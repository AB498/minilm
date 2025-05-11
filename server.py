from flask import Flask, request, render_template
from sentence_transformers import SentenceTransformer, util
import numpy as np
import time
import os
from typing import List, Dict, Any

app = Flask(__name__)

# Create templates directory if it doesn't exist
if not os.path.exists('templates'):
    os.makedirs('templates')

# Load the model when the server starts
print("Loading model... This may take a moment.")
try:
    model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
    print("Please make sure you have installed all dependencies with: pip install -r requirements.txt")
    exit(1)

# FAQ data
FAQS = [
    {
        "question": "Who reviews my application?",
        "answer": "Our admin team and NGO partners carefully verify every application."
    },
    {
        "question": "Is there any helpline I can call?",
        "answer": "Yes! You can contact our support team for further assistance. You can find our contact details by following these steps: Click on the three horizontal lines (☰) at the top left corner of the homepage. Select 'Contact Us' from the menu."
    },
    {
        "question": "What if I don't have an NID?",
        "answer": "You can use a birth certificate or guardian ID with proper explanation."
    },
    {
        "question": "How can I make a donation",
        "answer": "You can donate through our app using mobile banking, card, or manual bank transfer. Just click \"Donate Now\" on the home screen , login/signup and follow the steps!"
    },
    {
        "question": "What if my application is rejected?",
        "answer": "You'll receive a message explaining why. You can reapply with updated info."
    },
    {
        "question": "How long does it take to get help?",
        "answer": "If your request is verified, aid is usually sent within 2–3 days."
    },
    {
        "question": "How do you ensure the right people get the money?",
        "answer": "All relief applicants go through a strict verification process before being approved."
    },
    {
        "question": "Is there a minimum amount I can donate?",
        "answer": "Yes, the minimum donation is BDT 50. Every little bit counts!"
    },
    {
        "question": "How can I apply for financial help?",
        "answer": "Go to the \"Apply for Relief\" section, and fill out the form with your correct details."
    },
    {
        "question": "Can I apply on behalf of someone else?",
        "answer": "Yes, with their consent and proper documentation."
    }
]

# Cache for FAQ embeddings
FAQ_EMBEDDINGS = None

# Helper function to convert numpy types to Python native types
def convert_numpy_types(obj):
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    if isinstance(obj, (np.float32, np.float64)):
        return float(obj)
    if isinstance(obj, (np.int32, np.int64)):
        return int(obj)
    return obj

# Function to calculate cosine similarity between query and FAQs
def find_best_faq_match(query_text: str, top_k: int = 1):
    global FAQ_EMBEDDINGS

    # Ensure top_k is positive
    top_k = max(1, top_k)

    # Encode the query
    query_embedding = model.encode(query_text, convert_to_numpy=True)

    # Encode FAQs if not already cached
    if FAQ_EMBEDDINGS is None:
        faq_questions = [faq["question"] for faq in FAQS]
        FAQ_EMBEDDINGS = model.encode(faq_questions, convert_to_numpy=True)

    # Calculate cosine similarities
    cos_scores = util.cos_sim(query_embedding, FAQ_EMBEDDINGS)[0]

    # Get top-k matches
    top_results = []

    # Convert to numpy array if it's not already
    if not isinstance(cos_scores, np.ndarray):
        cos_scores = np.array(cos_scores)

    # Get indices of top-k scores
    top_indices = np.argsort(cos_scores)
    top_indices = top_indices[-top_k:]  # Take last k elements (highest scores)
    top_indices = top_indices[::-1]     # Reverse to get descending order

    for idx in top_indices:
        top_results.append({
            "question": FAQS[int(idx)]["question"],
            "answer": FAQS[int(idx)]["answer"],
            "score": float(cos_scores[idx])
        })

    return top_results

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/embed', methods=['POST'])
def embed():
    start_time = time.time()

    # Get text from request
    data = request.get_json()

    if not data or 'texts' not in data:
        return {'error': 'Please provide texts to embed'}, 400

    texts = data['texts']

    # Validate input
    if not isinstance(texts, list):
        texts = [texts]  # Convert single text to list

    # Generate embeddings
    try:
        embeddings = model.encode(texts)
        processing_time = time.time() - start_time

        # Convert numpy types to Python native types
        embeddings_list = [convert_numpy_types(embedding) for embedding in embeddings]
        dimensions = int(embeddings.shape[1])
        processing_time = float(processing_time)

        return {
            'embeddings': embeddings_list,
            'dimensions': dimensions,
            'processing_time_seconds': processing_time,
            'texts_processed': len(texts)
        }

    except Exception as e:
        return {'error': str(e)}, 500

@app.route('/info', methods=['GET'])
def model_info():
    return {
        'model_name': 'sentence-transformers/all-MiniLM-L6-v2',
        'embedding_dimensions': int(model.get_sentence_embedding_dimension()),
        'max_sequence_length': int(model.max_seq_length)
    }

@app.route('/faq', methods=['POST'])
def faq_query():
    start_time = time.time()

    # Get query from request
    data = request.get_json()

    if not data or 'query' not in data:
        return {'error': 'Please provide a query'}, 400

    query = data['query']
    top_k = data.get('top_k', 1)  # Default to 1 if not provided

    # Validate input
    if not isinstance(query, str):
        return {'error': 'Query must be a string'}, 400

    if not isinstance(top_k, int) or top_k < 1:
        return {'error': 'top_k must be a positive integer'}, 400

    # Find best matching FAQ
    try:
        matches = find_best_faq_match(query, top_k)
        processing_time = time.time() - start_time

        return {
            'matches': matches,
            'processing_time_seconds': float(processing_time),
            'query': query
        }

    except Exception as e:
        return {'error': str(e)}, 500

if __name__ == '__main__':
    try:
        # Get port from environment variable or default to 5000
        import os
        port = int(os.environ.get('PORT', 5000))

        print(f"Starting server on port {port}")
        print("Press Ctrl+C to stop the server")
        app.run(debug=False, host='0.0.0.0', port=port)
    except KeyboardInterrupt:
        print("\nServer stopped by user")
    except Exception as e:
        print(f"\nError starting server: {e}")
