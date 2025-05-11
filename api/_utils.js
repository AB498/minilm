// Import the transformers library
const { pipeline, env } = require('@xenova/transformers');

// Set environment variables
env.allowLocalModels = false;
env.useBrowserCache = false;
env.cacheDir = '/tmp/transformers_cache/';

// FAQ data
const FAQS = [
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

// Cache for model and embeddings
let embeddingModel = null;
let faqEmbeddings = null;

// Function to get the embedding model
async function getEmbeddingModel() {
  if (!embeddingModel) {
    console.log("Loading model... This may take a moment.");
    embeddingModel = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log("Model loaded successfully!");
  }
  return embeddingModel;
}

// Function to calculate cosine similarity between two vectors
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// Function to get embeddings for a text
async function getEmbedding(text) {
  const model = await getEmbeddingModel();
  const result = await model(text, { pooling: 'mean', normalize: true });
  return Array.from(result.data);
}

// Function to get embeddings for multiple texts
async function getEmbeddings(texts) {
  const embeddings = [];
  for (const text of texts) {
    const embedding = await getEmbedding(text);
    embeddings.push(embedding);
  }
  return embeddings;
}

// Function to find the best FAQ match
async function findBestFaqMatch(queryText, topK = 1) {
  // Ensure topK is positive
  topK = Math.max(1, topK);

  // Get the query embedding
  const queryEmbedding = await getEmbedding(queryText);

  // Get FAQ embeddings if not already cached
  if (!faqEmbeddings) {
    const faqQuestions = FAQS.map(faq => faq.question);
    faqEmbeddings = await getEmbeddings(faqQuestions);
  }

  // Calculate cosine similarities
  const similarities = faqEmbeddings.map(embedding => 
    cosineSimilarity(queryEmbedding, embedding)
  );

  // Get indices of top-k scores
  const indexedScores = similarities.map((score, index) => ({ score, index }));
  const sortedScores = indexedScores.sort((a, b) => b.score - a.score);
  const topIndices = sortedScores.slice(0, topK);

  // Create result array
  const topResults = topIndices.map(({ score, index }) => ({
    question: FAQS[index].question,
    answer: FAQS[index].answer,
    score: score
  }));

  return topResults;
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Helper function to handle CORS preflight requests
function handleCors(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    res.end();
    return true;
  }
  return false;
}

module.exports = {
  getEmbeddingModel,
  getEmbedding,
  getEmbeddings,
  findBestFaqMatch,
  FAQS,
  corsHeaders,
  handleCors
};
