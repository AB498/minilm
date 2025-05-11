# MiniLM Text Embedding Server

A simple Flask server that uses the SentenceTransformer library with the all-MiniLM-L6-v2 model to generate text embeddings and perform semantic search on FAQs using cosine similarity.

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/Emy2sU?referralCode=alphasec)

## Setup

### Option 1: Using the batch file (Windows)

1. Simply run the `setup_and_run.bat` file:
   - Double-click on `setup_and_run.bat` in File Explorer
   - Or run it from the command prompt: `setup_and_run.bat`

### Option 2: Manual setup

1. Install the required dependencies:
   ```
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

2. Run the server:
   ```
   python server.py
   ```

3. The server will be available at http://localhost:5000

## Requirements

- Python 3.8 or higher (tested with Python 3.12)
- Required packages are listed in requirements.txt

## Features

1. **Text Embeddings**: Generate vector embeddings for text using the SentenceTransformer model
2. **FAQ Search**: Find the most relevant answers to questions using semantic similarity
3. **Web Interface**: User-friendly interface for testing both functionalities

## API Endpoints

### GET /
- Returns the HTML interface for testing the embedding service and FAQ search

### POST /embed
- Accepts JSON with a "texts" field containing either a string or an array of strings
- Returns JSON with embeddings and metadata

Example request:
```json
{
  "texts": ["This is an example sentence", "Each sentence is converted"]
}
```

Example response:
```json
{
  "dimensions": 384,
  "embeddings": [[...384 values...], [...384 values...]],
  "processing_time_seconds": 0.123,
  "texts_processed": 2
}
```

### POST /faq
- Accepts JSON with a "query" field containing the question to search for
- Optional "top_k" field to specify the number of results to return (default: 1)
- Returns JSON with matching FAQs and similarity scores

Example request:
```json
{
  "query": "How do I donate?",
  "top_k": 3
}
```

Example response:
```json
{
  "matches": [
    {
      "question": "How can I make a donation",
      "answer": "You can donate through our app using mobile banking, card, or manual bank transfer. Just click \"Donate Now\" on the home screen, login/signup and follow the steps!",
      "score": 0.8976
    },
    {
      "question": "Is there a minimum amount I can donate?",
      "answer": "Yes, the minimum donation is BDT 50. Every little bit counts!",
      "score": 0.7654
    },
    {
      "question": "How do you ensure the right people get the money?",
      "answer": "All relief applicants go through a strict verification process before being approved.",
      "score": 0.5432
    }
  ],
  "processing_time_seconds": 0.045,
  "query": "How do I donate?"
}
```

### GET /info
- Returns information about the model

## Model Information

- Model: sentence-transformers/all-MiniLM-L6-v2
- Embedding dimensions: 384
- Max sequence length: 256

## Testing

The repository includes two test scripts:

1. `test_client.py` - Tests the embedding functionality
2. `test_faq.py` - Tests the FAQ search functionality

Run these scripts after starting the server to verify that everything is working correctly.

## Deployment Options

### Option 1: Railway.app (Python)

This project is configured for easy deployment on Railway.app:

1. **Fork or Clone this Repository**
   - Create your own copy of this repository on GitHub

2. **Deploy on Railway**
   - Click the "Deploy on Railway" button at the top of this README
   - Or connect your GitHub repository to Railway manually

3. **Configuration**
   - Railway will automatically detect the Python project based on:
     - `main.py` - Entry point for the application
     - `requirements.txt` - Dependencies

4. **Environment Variables**
   - No additional environment variables are required for basic functionality
   - Railway will automatically assign a PORT value

5. **Accessing Your Deployed API**
   - Once deployed, Railway will provide a URL for your application
   - Use this URL to access the API endpoints described above
   - Replace `http://localhost:5000` with your Railway URL in any API calls

### Option 2: Vercel (JavaScript)

This project also includes Vercel serverless functions for deployment:

1. **Deploy to Vercel**
   - Fork or clone this repository
   - Connect your GitHub repository to Vercel
   - Vercel will automatically detect the configuration

2. **API Endpoints**
   - `/api/embed` - Generate embeddings for text
   - `/api/faq` - Find best matching FAQ for a query
   - `/api/info` - Get model information

3. **JavaScript Implementation**
   - Uses the Xenova/transformers library for JavaScript
   - Implements the same functionality as the Python version
   - Optimized for serverless deployment

4. **Usage Example**
   ```javascript
   // Generate embeddings
   const response = await fetch('https://your-vercel-app.vercel.app/api/embed', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ texts: ["Example text"] })
   });
   const data = await response.json();
   console.log(data.embeddings);
   ```
