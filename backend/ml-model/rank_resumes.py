import sys
import json
import os
import re
from pdfminer.high_level import extract_text
import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "resume_rank_model.joblib")
VECTORIZER_PATH = os.path.join(BASE_DIR, "tfidf_vectorizer.joblib")

model = joblib.load(MODEL_PATH)
vectorizer = joblib.load(VECTORIZER_PATH)

def extract_pdf_text(pdf_path):
    """Extract text from a PDF resume."""
    if not os.path.exists(pdf_path):
        return ""
    try:
        return extract_text(pdf_path).strip()
    except Exception:
        return ""

def clean_text(text):
    """Clean and prepare text by removing special characters and lowercasing."""
    return re.sub(r'[^\w\s]', '', text.lower())

def calculate_match_score(keywords, resume_text):
    """Calculate match score based on keyword occurrence in the resume."""
    resume_text = clean_text(resume_text)
    resume_words = set(resume_text.split())
    matches = sum(1 for keyword in keywords if keyword in resume_words)
    score = (matches / len(keywords)) * 100 if keywords else 0
    return round(score, 2)

def rank_resumes_rule_based(job_title, job_requirements, resumes):
    """Rank resumes using rule-based matching."""
    combined_text = f"{job_title} {job_requirements}"
    keywords = clean_text(combined_text).split()

    resume_texts = [extract_pdf_text(res["resumePath"]) for res in resumes]
    valid_resumes = [res for i, res in enumerate(resumes) if resume_texts[i].strip()]
    valid_texts = [text for text in resume_texts if text.strip()]

    if not valid_resumes:
        return {"error": "No valid resumes found"}

    scores = [calculate_match_score(keywords, text) for text in valid_texts]

    rankings = sorted(
        [{"applicantId": valid_resumes[i]["applicantId"], "score": scores[i]}
         for i in range(len(scores))],
        key=lambda x: x["score"], reverse=True
    )

    return rankings

def rank_resumes_ml_based(job_title, job_description, job_requirements, resumes):
    """Rank resumes using ML-based model."""
    if not resumes:
        return {"error": "No resumes provided"}

    job_text = f"{job_title} {job_description} {job_requirements}"
    resume_texts = [extract_pdf_text(res["resumePath"]) for res in resumes]

    valid_resumes = [res for i, res in enumerate(resumes) if resume_texts[i].strip()]
    valid_texts = [text for text in resume_texts if text.strip()]

    if not valid_resumes:
        return {"error": "No valid resumes found"}

    job_vector = vectorizer.transform([job_text])
    resume_vectors = vectorizer.transform(valid_texts)

    scores = model.predict(resume_vectors.toarray())

    rankings = sorted(
        [{"applicantId": valid_resumes[i]["applicantId"], "score": round(scores[i], 2)}
         for i in range(len(scores))],
        key=lambda x: x["score"], reverse=True
    )

    return rankings

def rank_resumes(job_title, job_description, job_requirements, resumes, method="rule_based"):
    """Select ranking method based on user input (rule-based or ML-based)."""
    if method == "rule_based":
        return rank_resumes_rule_based(job_title, job_requirements, resumes)
    elif method == "ml_based":
        return rank_resumes_ml_based(job_title, job_description, job_requirements, resumes)
    else:
        return {"error": "Invalid ranking method specified"}

if __name__ == "__main__":
    try:
        data = json.loads(sys.stdin.read())
        method = data.get("method", "rule_based")  

        ranked_applicants = rank_resumes(
            data.get("job_title", ""),
            data.get("job_description", ""),
            data.get("job_requirements", ""),
            data.get("resumes", []),
            method
        )

        print(json.dumps(ranked_applicants))
    except Exception as e:
        print(json.dumps({"error": f"Processing failed: {str(e)}"}))
