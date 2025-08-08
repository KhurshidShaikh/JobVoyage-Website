from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import os
from bson.objectid import ObjectId
import pymongo
import threading
import time
from collections import Counter
import scipy.sparse
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={r"/predict": {"origins": ["http://localhost:3000", "http://localhost:5000"], "methods": ["POST", "OPTIONS"], "allow_headers": ["Content-Type"]}})

# Connect to MongoDB with error handling
try:
    client = pymongo.MongoClient("mongodb://localhost:27017/", serverSelectionTimeoutMS=5000)
    client.server_info()  # Test connection
    db = client['JobVoyage']
    job_collection = db['jobs']
    company_collection = db['companies']
    logger.info("Successfully connected to MongoDB")
except Exception as e:
    logger.error(f"MongoDB connection failed: {e}. Ensure MongoDB is running on localhost:27017.")
    exit(1)

# Global variables
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = BASE_DIR
tfidf = None
jobs_data = []
job_requirements_sets = []
job_tfidf = None
model_lock = threading.Lock()
last_job_count = 0
last_update_time = 0
POLL_INTERVAL = 30  # Check for updates every 30 seconds

def convert_objectid_to_str(obj):
    if isinstance(obj, ObjectId):
        return str(obj)
    if isinstance(obj, dict):
        return {k: convert_objectid_to_str(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [convert_objectid_to_str(item) for item in obj]
    return obj

def get_company_info(company_field):
    """Helper function to get company info from company ID"""
    try:
        if isinstance(company_field, ObjectId) or (isinstance(company_field, str) and len(company_field) == 24):
            company_id = ObjectId(company_field)
            company = company_collection.find_one({'_id': company_id})
            if company:
                return {
                    'name': company.get('name', 'Unknown'),
                    'logo': company.get('logo', '')
                }
    except Exception as e:
        logger.warning(f"Error retrieving company info: {e}")
    
    return {'name': 'Unknown', 'logo': ''}

def process_job_requirements(reqs):
    """Helper function to clean and process job requirements"""
    if not isinstance(reqs, list):
        return [], set()
    
    cleaned_reqs = [req.lower().strip() for req in reqs if req and req.strip()]
    return " ".join(cleaned_reqs), set(cleaned_reqs)

def train_ml_model():
    global tfidf, jobs_data, job_tfidf, job_requirements_sets, last_job_count, last_update_time
    
    with model_lock:
        logger.info("Starting model training")
        # Get all jobs from database
        jobs_data = list(job_collection.find())
        last_job_count = len(jobs_data)
        last_update_time = time.time()
        
        job_requirements_list = []
        job_requirements_sets = []
        
        for job in jobs_data:
            # Process company info
            job['company'] = get_company_info(job.get('company'))
            job['_id'] = str(job['_id'])
            job = convert_objectid_to_str(job)
            
            # Process requirements
            req_text, req_set = process_job_requirements(job.get('requirements', []))
            job_requirements_list.append(req_text)
            job_requirements_sets.append(req_set)

        # Create the TF-IDF model
        if job_requirements_list:
            tfidf = TfidfVectorizer(stop_words=None, lowercase=False)
            tfidf.fit(job_requirements_list)
            job_tfidf = tfidf.transform(job_requirements_list)
            logger.info(f"Model trained with {len(jobs_data)} jobs")
        else:
            tfidf = None
            job_tfidf = None
            logger.warning("No job requirements found, model not created")

        # Save the model to disk
        try:
            os.makedirs(MODEL_DIR, exist_ok=True)
            joblib.dump(tfidf, os.path.join(MODEL_DIR, 'tfidf_vectorizer.joblib'))
            joblib.dump(job_tfidf, os.path.join(MODEL_DIR, 'job_tfidf.joblib'))
            joblib.dump(jobs_data, os.path.join(MODEL_DIR, 'jobs_data.joblib'))
            joblib.dump(job_requirements_sets, os.path.join(MODEL_DIR, 'job_requirements_sets.joblib'))
            logger.info("Model saved to disk")
        except Exception as e:
            logger.error(f"Error saving model to disk: {e}")

def check_for_updates():
    """Periodically check if the database has changed and needs retraining"""
    global last_job_count, last_update_time
    
    while True:
        try:
            # Get current job count
            current_job_count = job_collection.count_documents({})
            current_time = time.time()
            
            # Check if we need to update the model
            if current_job_count != last_job_count or (current_time - last_update_time) > 3600:
                logger.info(f"Database changed: old count={last_job_count}, new count={current_job_count}. Retraining model.")
                train_ml_model()
            else:
                logger.debug("No database changes detected")
                
        except Exception as e:
            logger.error(f"Error checking for updates: {e}")
            
        time.sleep(POLL_INTERVAL)

# Start the database polling thread
update_check_thread = threading.Thread(target=check_for_updates, daemon=True)
update_check_thread.start()

# Initial model training
logger.info("Performing initial model training")
train_ml_model()

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        if not data or 'skills' not in data:
            logger.info("Predict API called with no skills data")
            return jsonify({'recommended_jobs': []}), 200

        user_skills = data.get('skills', [])
        user_skills_set = set(skill.lower().strip() for skill in user_skills if skill and skill.strip())
        
        if not user_skills_set:
            logger.info("No valid skills provided in request")
            return jsonify({'recommended_jobs': []}), 200

        with model_lock:
            if tfidf is None or job_tfidf is None or not jobs_data:
                logger.warning("ML model not ready or no jobs in database")
                return jsonify({'recommended_jobs': []}), 200

            # Calculate similarities
            user_text = ' '.join(user_skills_set)
            user_tfidf_vec = tfidf.transform([user_text])
            user_similarity = cosine_similarity(user_tfidf_vec, job_tfidf)[0]
            
            # Calculate skill matches
            match_counts_user = np.array([len(user_skills_set.intersection(job_reqs)) for job_reqs in job_requirements_sets])

            # Filter jobs with at least one match
            valid_indices = np.where(match_counts_user > 0)[0]
            if len(valid_indices) == 0:
                logger.info("No matching jobs found for user skills")
                return jsonify({'recommended_jobs': []}), 200

            # Sort by match count first, then by similarity within each match count group
            sorted_indices = valid_indices[np.argsort(-match_counts_user[valid_indices])]
            final_indices = []
            tie_groups = Counter(match_counts_user[valid_indices])
            
            for count in sorted(tie_groups.keys(), reverse=True):
                tie_indices = [i for i in sorted_indices if match_counts_user[i] == count]
                tie_indices.sort(key=lambda i: user_similarity[i], reverse=True)
                final_indices.extend(tie_indices)
                if len(final_indices) >= 5:
                    break

            # Prepare recommendations
            recommended_jobs = []
            for idx in final_indices[:5]:
                job = jobs_data[idx]
                company = job.get('company', {'name': 'Unknown', 'logo': ''})
                job_data = {
                    '_id': job.get('_id', 'Unknown'),
                    'title': job.get('title', 'No title'),
                    'description': job.get('description', 'No description'),
                    'requirements': job.get('requirements', []),
                    'salary': job.get('salary', 'Not Provided'),
                    'location': job.get('location', 'Not Provided'),
                    'jobType': job.get('jobType', 'Not Provided'),
                    'company': {
                        'name': company.get('name', 'Unknown'),
                        'logo': company.get('logo', '')
                    },
                    'match_count': int(match_counts_user[idx]),
                    'similarity_score': float(user_similarity[idx])
                }
                recommended_jobs.append(job_data)

            logger.info(f"Returning {len(recommended_jobs)} recommended jobs")
            return jsonify({'recommended_jobs': recommended_jobs}), 200

    except Exception as e:
        logger.error(f"Error in predict endpoint: {e}", exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/refresh', methods=['POST'])
def refresh_model():
    """Force a model refresh"""
    try:
        train_ml_model()
        return jsonify({'status': 'success', 'message': 'Model refreshed successfully'}), 200
    except Exception as e:
        logger.error(f"Error refreshing model: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint to verify the service is running"""
    status = {
        'status': 'ok',
        'jobs_loaded': len(jobs_data),
        'model_ready': tfidf is not None and job_tfidf is not None,
        'last_update': last_update_time
    }
    return jsonify(status), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=False)