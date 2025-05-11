const { findBestFaqMatch, corsHeaders, handleCors } = require('./_utils');

module.exports = async (req, res) => {
  // Handle CORS
  if (handleCors(req, res)) return;

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const startTime = Date.now();
    
    // Get query from request
    const data = req.body;
    
    if (!data || !data.query) {
      return res.status(400).json({ error: 'Please provide a query' });
    }
    
    const query = data.query;
    const topK = data.top_k || 1;
    
    // Validate input
    if (typeof query !== 'string') {
      return res.status(400).json({ error: 'Query must be a string' });
    }
    
    if (!Number.isInteger(topK) || topK < 1) {
      return res.status(400).json({ error: 'top_k must be a positive integer' });
    }
    
    // Find best matching FAQ
    const matches = await findBestFaqMatch(query, topK);
    
    // Calculate processing time
    const processingTime = (Date.now() - startTime) / 1000;
    
    // Return response
    return res.status(200).json({
      matches: matches,
      processing_time_seconds: processingTime,
      query: query
    });
    
  } catch (error) {
    console.error('Error finding FAQ matches:', error);
    return res.status(500).json({ error: error.message });
  }
};
