// Test client for the JavaScript API
// Run with: node test_js_client.js

const fetch = require('node-fetch');

// Base URL - using the deployed Vercel app URL
const BASE_URL = 'https://minilm-yzpj.vercel.app/api';

// Test the embedding service
async function testEmbeddingService() {
  console.log('Testing embedding service...');

  try {
    const response = await fetch(`${BASE_URL}/embed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        texts: ["This is an example sentence", "Each sentence is converted"]
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`Success! Processed ${data.texts_processed} texts`);
      console.log(`Embedding dimensions: ${data.dimensions}`);
      console.log(`Processing time: ${data.processing_time_seconds.toFixed(3)} seconds`);

      // Print first few dimensions of first embedding as example
      const firstEmbedding = data.embeddings[0];
      const previewSize = Math.min(5, firstEmbedding.length);

      console.log(`\nExample (first ${previewSize} dimensions of first embedding):`);
      console.log(JSON.stringify(firstEmbedding.slice(0, previewSize), null, 2));
      console.log(`... (${firstEmbedding.length - previewSize} more dimensions)`);

      // Get model info
      await testModelInfo();

      return true;
    } else {
      console.log(`Error: ${response.status}`);
      console.log(await response.text());
      return false;
    }
  } catch (error) {
    console.log(`Error: ${error.message}`);
    return false;
  }
}

// Test the model info endpoint
async function testModelInfo() {
  console.log('\nTesting model info endpoint...');

  try {
    const response = await fetch(`${BASE_URL}/info`);

    if (response.ok) {
      const data = await response.json();
      console.log('Model Information:');
      console.log(`Model name: ${data.model_name}`);
      console.log(`Embedding dimensions: ${data.embedding_dimensions}`);
      console.log(`Max sequence length: ${data.max_sequence_length}`);
      return true;
    } else {
      console.log(`Error: ${response.status}`);
      console.log(await response.text());
      return false;
    }
  } catch (error) {
    console.log(`Error: ${error.message}`);
    return false;
  }
}

// Test the FAQ search functionality
async function testFaqSearch() {
  console.log('\nTesting FAQ search functionality...');

  const testQueries = [
    "How do I donate money?",
    "What documents do I need if I don't have an ID?",
    "Who checks my application?",
    "How long will it take to receive help?",
    "Can I apply for someone else?"
  ];

  for (const query of testQueries) {
    console.log(`\nQuery: "${query}"`);

    try {
      const response = await fetch(`${BASE_URL}/faq`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query,
          top_k: 1
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`Processing time: ${data.processing_time_seconds.toFixed(3)} seconds`);

        if (data.matches && data.matches.length > 0) {
          const match = data.matches[0];
          const scorePercentage = match.score * 100;

          console.log(`Best match (${scorePercentage.toFixed(1)}%):`);
          console.log(`Q: ${match.question}`);
          console.log(`A: ${match.answer}`);
        } else {
          console.log('No matches found.');
        }
      } else {
        console.log(`Error: ${response.status}`);
        console.log(await response.text());
      }

      console.log('-'.repeat(50));
    } catch (error) {
      console.log(`Error: ${error.message}`);
      break;
    }
  }

  // Test with multiple results
  console.log('\nTesting with multiple results:');
  try {
    const response = await fetch(`${BASE_URL}/faq`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: "How can I donate?",
        top_k: 3
      })
    });

    if (response.ok) {
      const data = await response.json();

      console.log(`Query: "How can I donate?"`);
      console.log(`Processing time: ${data.processing_time_seconds.toFixed(3)} seconds`);
      console.log(`Found ${data.matches.length} matches:`);

      data.matches.forEach((match, i) => {
        const scorePercentage = match.score * 100;
        console.log(`\nMatch ${i + 1} (${scorePercentage.toFixed(1)}%):`);
        console.log(`Q: ${match.question}`);
        console.log(`A: ${match.answer}`);
      });
    } else {
      console.log(`Error: ${response.status}`);
      console.log(await response.text());
    }
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
}

// Run the tests
async function runTests() {
  await testEmbeddingService();
  await testFaqSearch();
}

runTests().catch(console.error);
