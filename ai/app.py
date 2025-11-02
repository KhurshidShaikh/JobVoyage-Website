import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv
import logging
import traceback
import re


# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
app.logger.setLevel(logging.DEBUG)

# Read Gemini API key from .env file
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Configure Gemini
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-2.5-flash')
    print(f"GEMINI_API_KEY loaded: {GEMINI_API_KEY[:10]}...")
else:
    print("WARNING: GEMINI_API_KEY not found in environment variables!")
    print("Please check your .env file in the ai directory.")
    model = None


def sanitize_input(text):
    """Removes non-alphanumeric characters and limits length."""
    text = re.sub(r'[^\w\s]', '', text)  # Remove non-alphanumeric
    return text[:500]  # Limit length to prevent abuse


def call_gemini_api(user_input):
    """
    Call Gemini API with JobVoyage-specific context.
    """
    if not model:
        raise Exception("Gemini model not initialized. Check your API key.")
    
    job_portal_context = """You are JobVoyage AI Assistant, a specialized chatbot for the JobVoyage job portal website. 

ABOUT JOBVOYAGE:
- JobVoyage is a comprehensive job portal connecting job seekers with employers
- Features: Job search, resume upload, company profiles, application tracking
- Locations: Focuses on Indian job market (Bangalore, Mumbai, Delhi NCR, Pune, Hyderabad)
- Industries: IT, Software Development, Data Science, Design, DevOps
- Companies: Partners with top Indian IT companies like Infosys, TCS, Wipro, Tech Mahindra, HCL

YOUR ROLE:
- Help job seekers navigate the platform
- Provide career advice and job search tips
- Answer questions about resume writing, interview preparation
- Explain how to use JobVoyage features
- Suggest relevant jobs based on skills/location

RESPONSE GUIDELINES:
- Keep answers concise (2-4 sentences)
- Focus only on job-related topics and JobVoyage platform
- If asked about non-job topics, politely redirect: "I can only help with job searching and career advice on JobVoyage."
- Be helpful, professional, and encouraging

USER QUESTION: """

    full_prompt = job_portal_context + user_input

    try:
        response = model.generate_content(full_prompt)
        return response.text
    except Exception as e:
        raise Exception(f"Gemini API request failed: {str(e)}")


def truncate_response(text, max_sentences=3):
    """Truncates a text to a maximum number of sentences."""
    sentences = re.split(r'(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s', text) # Splits correctly even on abreviations
    return " ".join(sentences[:max_sentences])


@app.route("/chat", methods=["POST"])
def chat():
    try:
        # Check if Gemini model is initialized
        if not model:
            app.logger.error("Gemini model not initialized. Check API key.")
            return jsonify({"error": "Server configuration error: Gemini API key not set."}), 500

        user_input = request.json.get("message")
        if not user_input:
            app.logger.warning("No message provided")
            return jsonify({"error": "No message provided"}), 400

        # Sanitize Input
        user_input = sanitize_input(user_input.strip())

        # Call Gemini API
        try:
            bot_reply = call_gemini_api(user_input)
            bot_reply = truncate_response(bot_reply)

            return jsonify({"reply": bot_reply})

        except Exception as e:
            app.logger.error(f"Gemini API error: {str(e)}")
            return jsonify({"error": f"Gemini API error: {str(e)}"}), 500

    except Exception as e:
        traceback.print_exc()
        app.logger.error(f"Error in /chat route: {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5002)