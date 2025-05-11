const { getEmbeddings, corsHeaders, handleCors } = require('./_utils');

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
    
    // Get text from request
    const data = req.body;
    
    if (!data || !data.texts) {
      return res.status(400).json({ error: 'Please provide texts to embed' });
    }
    
    // Ensure texts is an array
    const texts = Array.isArray(data.texts) ? data.texts : [data.texts];
    
    // Generate embeddings
    const embeddings = await getEmbeddings(texts);
    
    // Calculate processing time
    const processingTime = (Date.now() - startTime) / 1000;
    
    // Return response
    return res.status(200).json({
      embeddings: embeddings,
      dimensions: embeddings[0].length,
      processing_time_seconds: processingTime,
      texts_processed: texts.length
    });
    
  } catch (error) {
    console.error('Error generating embeddings:', error);
    return res.status(500).json({ error: error.message });
  }
};
