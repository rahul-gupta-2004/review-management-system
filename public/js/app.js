// Fetch and display the reviews
async function fetchReviews() {
    try {
        const response = await fetch("/api/reviews");
        const reviews = await response.json();
        const container = document.getElementById("reviews-container");
        container.innerHTML = ""; // Clear existing content

        // Separate reviews with null and non-null responses
        const nullResponseReviews = reviews.filter(review => review.response === null);
        const nonNullResponseReviews = reviews.filter(review => review.response !== null);

        // Sort the reviews with responses by ID in ascending order
        nullResponseReviews.sort((a, b) => a.id - b.id);
        nonNullResponseReviews.sort((a, b) => a.id - b.id);

        // Merge the two arrays: null responses first, then non-null responses
        const sortedReviews = [...nullResponseReviews, ...nonNullResponseReviews];

        // Add a heading for the section
        const heading = document.createElement("h2");
        heading.innerText = "Replies to Customer Reviews";
        heading.classList.add("review-section-heading");
        container.appendChild(heading);

        // Render each review
        sortedReviews.forEach((review) => {
            const reviewDiv = document.createElement("div");
            reviewDiv.classList.add("review-card");
            reviewDiv.id = `review-${review.id}`; // Ensure unique ID for each review card

            // Determine sentiment
            let sentimentText = review.rating >= 4 ? "Positive" : review.rating <= 2 ? "Negative" : "Neutral";
            let sentimentColor = review.rating >= 4 ? "green" : review.rating <= 2 ? "red" : "orange";
            let sentimentIcon = review.rating >= 4 ? "😊" : review.rating <= 2 ? "☹️" : "😐";

            // Show sentiment, then rating, followed by other details
            reviewDiv.innerHTML = `
                <h3>${review.name}</h3>
                <p style="color: ${sentimentColor}; font-weight: bold;">
                    ${sentimentText} ${sentimentIcon}
                </p>
                <p><strong>Rating:</strong> ${'★'.repeat(review.rating)}</p>
                <p><strong>Submitted on:</strong> ${review.date} at ${review.time}</p>
                <p><strong>Review:</strong> ${review.review}</p>
            `;

            if (review.response === null) {
                reviewDiv.innerHTML += `
                    <input type="text" class="reply-input" placeholder="Send reply to the user" />
                    <button class="reply-btn" onclick="sendReply(${review.id}, this)">Send</button>
                    
                    <div class="template-buttons">
                        <button class="template-btn" onclick="insertReplyText(${review.id}, 'Thank you for your feedback!')">Thank You</button>
                        <button class="template-btn" onclick="insertReplyText(${review.id}, 'We are sorry for the inconvenience caused!')">Sorry</button>
                        <button class="template-btn" onclick="generateAIResponse(${review.id})">AI Generate Response</button>
                    </div>
                `;
            } else {
                reviewDiv.innerHTML += `
                    <p><strong>Response:</strong> ${review.response}</p>
                    <p><strong>Responded on:</strong> ${review.response_date} at ${review.response_time}</p>
                `;
            }

            container.appendChild(reviewDiv);
        });
    } catch (error) {
        console.error("Error fetching reviews:", error);
    }
}

// Insert predefined template text into the reply input field
function insertReplyText(reviewId, replyText) {
    const replyInput = document.querySelector(`#review-${reviewId} .reply-input`);
    if (replyInput) {
        replyInput.value = replyText;  // Directly set the value of the input
    } else {
        console.error('Reply input not found for review ID:', reviewId);
    }
}

async function sendReply(reviewId, button) {
    const inputField = button.previousElementSibling;
    const response = inputField.value.trim();

    if (response === "") {
        alert("Reply cannot be empty");
        return;
    }

    try {
        const res = await fetch(`/api/reviews/${reviewId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ response }),
        });

        const result = await res.json();
        alert("Reply sent successfully!");
        fetchReviews(); // Reload the reviews to reflect the changes
    } catch (error) {
        console.error("Error sending reply:", error);
    }
}


// Generate AI response using Gemini API
async function generateAIResponse(reviewId) {
    try {
        const res = await fetch('/generate-ai-response', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reviewId }) 
        });

        if (res.ok) {
            const result = await res.json();
            const aiResponse = result.aiResponse;

            const replyInput = document.querySelector(`#review-${reviewId} .reply-input`);
            if (replyInput) {
                replyInput.value = aiResponse; 
            }
        } else {
            console.error('Failed to generate AI response:', await res.text());
        }
    } catch (error) {
        console.error('Error generating AI response:', error);
    }
}

fetchReviews();

async function generateAnalytics() {
  try {
    const response = await fetch("/api/reviews");
    const reviews = await response.json();

    // Array to store review data for each month (Jan = 0, Dec = 11)
    const months = Array(12).fill(0);
    const sentimentPerMonth = Array(12)
      .fill(null)
      .map(() => ({ Positive: 0, Neutral: 0, Negative: 0 }));

    const years = {};
    const sentimentPerYear = {};

    reviews.forEach((review) => {
      const [day, month, year] = review.date.split("-").map(Number);
      const monthIndex = month - 1; // Month is 1-12, but array index is 0-11

      // Count reviews per month (for all years)
      months[monthIndex] += 1;

      // Count reviews per year
      years[year] = (years[year] || 0) + 1;

      // Count sentiments per month (aggregate all years into months)
      const sentiment =
        review.rating >= 4
          ? "Positive"
          : review.rating <= 2
          ? "Negative"
          : "Neutral";
      sentimentPerMonth[monthIndex][sentiment] += 1;

      // Count sentiments per year
      if (!sentimentPerYear[year])
        sentimentPerYear[year] = { Positive: 0, Neutral: 0, Negative: 0 };
      sentimentPerYear[year][sentiment] += 1;
    });

    // Generate charts
    createChart(
      "reviews-per-month",
      [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ],
      months,
      "Number of Reviews Per Month"
    );

    createChart(
      "reviews-per-year",
      Object.keys(years),
      Object.values(years),
      "Number of Reviews Per Year"
    );

    createSentimentChart(
      "sentiment-per-month",
      [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ],
      sentimentPerMonth
    );

    createSentimentChart(
      "sentiment-per-year",
      Object.keys(sentimentPerYear),
      Object.values(sentimentPerYear)
    );
  } catch (error) {
    console.error("Error generating analytics:", error);
  }
}

function createChart(canvasId, labels, data, label) {
  const ctx = document.getElementById(canvasId).getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: label,
          data: data,
          backgroundColor: "rgba(54, 162, 235, 0.6)",
        },
      ],
    },
  });
}

function createSentimentChart(canvasId, labels, sentimentData) {
  const ctx = document.getElementById(canvasId).getContext("2d");

  const positive = sentimentData.map((item) => item.Positive || 0);
  const neutral = sentimentData.map((item) => item.Neutral || 0);
  const negative = sentimentData.map((item) => item.Negative || 0);

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        { label: "Positive", data: positive, backgroundColor: "#4CAF50" },
        { label: "Neutral", data: neutral, backgroundColor: "orange" },
        { label: "Negative", data: negative, backgroundColor: "red" },
      ],
    },
  });
}

generateAnalytics();
