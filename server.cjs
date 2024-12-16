const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const fs = require('fs'); // File system module to read and update reviews.json
const Sentiment = require('sentiment'); // Import the sentiment library
require('dotenv').config();
const { exec } = require('child_process'); // For running Python script

const app = express();
app.use(express.json()); // To parse JSON bodies

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Google Authentication Setup
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
    if (profile.emails[0].value === "testproject.rahul@gmail.com") {
        return done(null, profile);
    } else {
        return done(null, false);
    }
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

app.use(passport.initialize());
app.use(passport.session());

// Google Authentication Routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/error.html' }),
    (req, res) => res.redirect('/home.html')
);

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

// API to fetch reviews and perform sentiment analysis
app.get('/api/reviews', (req, res) => {
    const filePath = path.join(__dirname, 'reviews.json');
    const sentiment = new Sentiment();

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading reviews.json:', err);
            res.status(500).json({ error: 'Failed to load reviews' });
        } else {
            try {
                const reviews = JSON.parse(data);
                
                // Analyze the sentiment of each review
                reviews.forEach(review => {
                    const sentimentResult = sentiment.analyze(review.review);
                    review.sentiment = sentimentResult.score;

                    if (review.sentiment > 0) {
                        review.sentimentLabel = 'positive';
                    } else if (review.sentiment < 0) {
                        review.sentimentLabel = 'negative';
                    } else {
                        review.sentimentLabel = 'neutral';
                    }
                });

                res.json(reviews);
            } catch (error) {
                console.error('Error parsing reviews.json:', error);
                res.status(500).json({ error: 'Invalid JSON in reviews.json' });
            }
        }
    });
});

// API to update the review with a response
app.post('/api/reviews/:id', (req, res) => {
    const reviewId = parseInt(req.params.id, 10);
    const { response } = req.body;
    const filePath = path.join(__dirname, 'reviews.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading reviews.json:', err);
            res.status(500).json({ error: 'Failed to read reviews.json' });
        } else {
            try {
                const reviews = JSON.parse(data);
                const review = reviews.find(r => r.id === reviewId);
                if (!review) return res.status(404).json({ error: 'Review not found' });

                const now = new Date();
                review.response = response;
                review.response_date = now.toLocaleDateString('en-GB');
                review.response_time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

                fs.writeFile(filePath, JSON.stringify(reviews, null, 2), (err) => {
                    if (err) {
                        console.error('Error writing to reviews.json:', err);
                        res.status(500).json({ error: 'Failed to update review' });
                    } else {
                        res.json({ message: 'Review updated successfully', review });
                    }
                });
            } catch (error) {
                res.status(500).json({ error: 'Invalid JSON in reviews.json' });
            }
        }
    });
});

// API to generate AI response for the review based on the review text
app.post('/generate-ai-response', async (req, res) => {
    const { reviewId } = req.body;
    const filePath = path.join(__dirname, 'reviews.json');

    try {
        // Read reviews.json to get the review text
        const data = await fs.promises.readFile(filePath, 'utf8');
        const reviews = JSON.parse(data);
        const review = reviews.find(r => r.id === reviewId);

        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        const reviewText = review.review;

        // Call the Python script to get the AI response
        exec(`python3 generate_ai_response.py "${reviewText}"`, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return res.status(500).json({ error: 'Failed to generate AI response' });
            }

            // Send the AI response from the Python script to the client
            res.json({ aiResponse: stdout.trim() });
        });
    } catch (error) {
        console.error('Error generating AI response:', error);
        res.status(500).json({ error: 'Failed to generate AI response' });
    }
});

// Start the server
app.listen(3000, () => console.log('Server running on http://localhost:3000'));
