# Review Management System

A Review Management System built with Node.js, Express, and Google Generative AI for automated responses. This project helps businesses manage customer reviews, analyze sentiments, and generate AI-based responses for reviews.

## Tech Stack

This project uses the following technologies:

**Frontend** :
* HTML5
* CSS3 (Styled using custom styles)
* JavaScript
* Chart.js for data visualization
* Font Awesome for icons

**Backend** :
* Node.js
* Express.js
* Passport.js for Google OAuth authentication
* Sentiment.js for sentiment analysis
* **AI Integration** :
* Google Generative AI API (Gemini Model) for generating AI-based responses.
* **Database** :
* JSON file (`reviews.json`) for storing reviews.

## Features

* **Review Display** : Displays customer reviews, including rating and sentiment.
* **Reply Management** : Allows admins to reply to customer reviews, either manually or using predefined templates.
* **AI-Generated Responses** : Generates AI-based replies to reviews using the Google Generative AI model.
* **Analytics** : Shows review and sentiment analytics by month and year using Chart.js.
* **Authentication** : Google login for restricted access.

## Installation

1. **Clone the repository** :

```
   git clone https://github.com/your-username/review-management-system.git
   cd review-management-system
```

1. **Install dependencies** :
   Ensure you have **Node.js** installed. Run the following command to install required dependencies:

```
   npm install
```

1. **Set up environment variables** :

* Create a `.env` file in the root directory of the project.
* Add your **Google OAuth credentials** and **Google Generative AI API key** to the `.env` file:
  ```
  GOOGLE_CLIENT_ID=your-client-id
  GOOGLE_CLIENT_SECRET=your-client-secret
  GEMINI_API_KEY=your-api-key
  ```

1. **Ensure Python is installed** :
   The AI response generation requires a Python script to interact with the Gemini model. Ensure Python is installed on your machine.

## Run the Project

1. **Start the server** :
   Run the following command to start the backend server:

```
   node server.cjs
```

   This will start the application on `http://localhost:3000`.

1. **Access the app** :
   Open your browser and go to `http://localhost:3000` to access the Review Management System.

## Usage

* **Login** : Use the "Login with Google" button on the homepage (`index.html`) to authenticate with Google. Only authorized users can access the review management system.
* **View Reviews** : Once logged in, you can view the reviews in the system. If no response exists for a review, you can reply using predefined templates - "Thank you", "Sorry" or use the "AI Generate Response" button for an AI-generated reply.
* **Analytics** : You can also view review statistics such as the number of reviews per month, the sentiment breakdown by month, and more.

## How it Works

**Frontend** :
* The frontend is built using HTML, CSS, and JavaScript.
* Reviews are fetched using a GET request to `/api/reviews` from the server.
* Admins can reply to reviews by using a manual input or by clicking predefined response buttons.
* The AI response is generated through a backend route `/generate-ai-response`, which calls the Google Generative AI API using a Python script.

**Backend** :
* The backend is built with Node.js and Express.js.
* It includes API routes for managing reviews and generating responses using AI.
* Authentication is handled using Passport.js with Google OAuth.
