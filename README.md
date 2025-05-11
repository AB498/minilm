# MiniLM API Tester

A simple frontend application to test the MiniLM API endpoints, including text embeddings and FAQ answering functionality.

## Features

- **Health Check**: Test if the API server is running correctly
- **Text Embedding**: Generate embeddings for one or more text inputs
- **FAQ Answer**: Ask natural language questions and get answers from the FAQ database

## How to Use

1. Open `index.html` in your web browser
2. The default API URL is set to `https://minilm-yzpj.vercel.app`, but you can change it to your local server (e.g., `http://localhost:3000`) if needed
3. Use the different sections to test each endpoint:

### Health Check
- Simply click the "Check Health" button to verify the server is running

### Text Embedding
- Enter one or more texts (one per line) in the text area
- Click "Generate Embeddings" to get vector representations of your texts
- The response will show the dimensions of the embeddings and a sample of the first few values

### FAQ Answer
- Enter a natural language question in the input field
- Click "Get Answer" to find the most relevant answer from the FAQ database
- The response will show:
  - The matched question from the FAQ database
  - The corresponding answer
  - A confidence score indicating how well the question matched (higher is better)
  - A visual confidence meter

## API Endpoints

The frontend interacts with the following API endpoints:

- `GET /health`: Check if the server is running
- `POST /embed`: Generate embeddings for an array of texts
- `POST /answer`: Find the most relevant answer for a natural language question

## Development

To run the API server locally:

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the server: `npm start`
4. Open `index.html` in your browser
5. Change the API URL to `http://localhost:3000`

## Testing

You can run automated tests for the API using:

```bash
node test-api.js
```

This will test all endpoints and report the results.
