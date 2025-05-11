// Import required packages
const express = require('express');
const { pipeline } = require('@huggingface/transformers');
const cors = require('cors');
const path = require('path');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// Store the pipeline instance
let embeddingPipeline = null;

// FAQ data
const faqs = [
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
];

// Store FAQ embeddings
let faqEmbeddings = null;

// Initialize the embedding pipeline
async function initializeEmbeddingPipeline() {
  try {
    console.log('Initializing embedding pipeline...');
    embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('Embedding pipeline initialized successfully!');

    // Initialize FAQ embeddings after pipeline is ready
    await initializeFaqEmbeddings();
  } catch (error) {
    console.error('Error initializing embedding pipeline:', error);
  }
}

// Initialize FAQ embeddings
async function initializeFaqEmbeddings() {
  try {
    if (!embeddingPipeline) {
      console.error('Cannot initialize FAQ embeddings: embedding pipeline not ready');
      return;
    }

    console.log('Initializing FAQ embeddings...');
    const faqQuestions = faqs.map(faq => faq.question);
    const embeddings = await embeddingPipeline(faqQuestions, { pooling: 'mean', normalize: true });

    // Convert tensor to JavaScript array
    faqEmbeddings = embeddings.tolist();
    console.log(`FAQ embeddings initialized successfully for ${faqQuestions.length} questions!`);
  } catch (error) {
    console.error('Error initializing FAQ embeddings:', error);
  }
}

// Calculate cosine similarity between two vectors
function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same dimensions');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Serve index.html at the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

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

// Answer endpoint
app.post('/answer', async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Please provide a question string' });
    }

    if (!embeddingPipeline || !faqEmbeddings) {
      return res.status(503).json({ error: 'FAQ system is still initializing. Please try again later.' });
    }

    // Generate embedding for the user's question
    const questionEmbedding = await embeddingPipeline(question, { pooling: 'mean', normalize: true });
    const questionEmbeddingArray = questionEmbedding.tolist()[0]; // Get the first (and only) embedding

    // Find the most similar FAQ
    let bestMatchIndex = -1;
    let bestMatchScore = -1;

    for (let i = 0; i < faqEmbeddings.length; i++) {
      const similarity = cosineSimilarity(questionEmbeddingArray, faqEmbeddings[i]);

      if (similarity > bestMatchScore) {
        bestMatchScore = similarity;
        bestMatchIndex = i;
      }
    }

    // Prepare the response
    const response = {
      question: question,
      answer: faqs[bestMatchIndex].answer,
      matchedQuestion: faqs[bestMatchIndex].question,
      confidence: bestMatchScore
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error answering question:', error);
    res.status(500).json({ error: 'Failed to process question' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API endpoints available at:`);
  console.log(`  - http://localhost:${PORT}/health`);
  console.log(`  - http://localhost:${PORT}/embed`);
  console.log(`  - http://localhost:${PORT}/answer`);
  console.log(`Frontend available at: http://localhost:${PORT}/`);

  // Initialize the embedding pipeline when the server starts
  initializeEmbeddingPipeline();
});