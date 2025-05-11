import { getEmbeddingModel, corsHeaders, handleCors } from './_utils.js';

export default async (req, res) => {
  // Handle CORS
  if (handleCors(req, res)) return;

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Load the model if not already loaded
    await getEmbeddingModel();

    // Return model info
    return res.status(200).json({
      model_name: 'Xenova/all-MiniLM-L6-v2',
      embedding_dimensions: 384,
      max_sequence_length: 128
    });

  } catch (error) {
    console.error('Error getting model info:', error);
    return res.status(500).json({ error: error.message });
  }
};
