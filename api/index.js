import { corsHeaders, handleCors } from './_utils.js';

export default (req, res) => {
  // Handle CORS
  if (handleCors(req, res)) return;

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Return API information
  res.status(200).json({
    name: 'MiniLM Text Embedding API',
    version: '1.0.0',
    endpoints: [
      {
        path: '/api/embed',
        method: 'POST',
        description: 'Generate embeddings for text'
      },
      {
        path: '/api/faq',
        method: 'POST',
        description: 'Find best matching FAQ for a query'
      },
      {
        path: '/api/info',
        method: 'GET',
        description: 'Get model information'
      }
    ]
  });
};
