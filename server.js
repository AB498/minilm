// Import required packages
const express = require('express');
const { pipeline } = require('@huggingface/transformers');
const cors = require('cors');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Store the pipeline instance
let embeddingPipeline = null;

// Initialize the embedding pipeline
async function initializeEmbeddingPipeline() {
  try {
    console.log('Initializing embedding pipeline...');
    embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('Embedding pipeline initialized successfully!');
  } catch (error) {
    console.error('Error initializing embedding pipeline:', error);
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Embedding endpoint
app.post('/embed', async (req, res) => {
  try {
    const { texts } = req.body;

    if (!texts || !Array.isArray(texts)) {
      return res.status(400).json({ error: 'Please provide an array of texts to embed' });
    }

    if (!embeddingPipeline) {
      return res.status(503).json({ error: 'Embedding model is still loading. Please try again later.' });
    }

    const embeddings = await embeddingPipeline(texts, { pooling: 'mean', normalize: true });

    // Convert tensor to JavaScript array
    const embeddingsArray = embeddings.tolist();

    res.status(200).json({ embeddings: embeddingsArray });
  } catch (error) {
    console.error('Error generating embeddings:', error);
    res.status(500).json({ error: 'Failed to generate embeddings' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Initialize the embedding pipeline when the server starts
  initializeEmbeddingPipeline();
});