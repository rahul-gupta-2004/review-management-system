# generate_ai_response.py
import google.generativeai as genai
import os
import sys

# Configure the API key from environment variable
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("API key is missing")
    sys.exit(1)

# Configure the Gemini client
genai.configure(api_key=api_key)
model = genai.GenerativeModel("gemini-1.5-flash")

def generate_response(review_text):
    prompt = f"Give a simple 1-sentence reply to this review - {review_text}"
    response = model.generate_content(prompt)
    return response.text

if __name__ == "__main__":
    review_text = sys.argv[1]  # The review text is passed as an argument
    response = generate_response(review_text)
    print(response)
