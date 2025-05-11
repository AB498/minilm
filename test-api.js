// Test script for MiniLM API endpoints
const axios = require('axios');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3000'; // Default to local server
const PRODUCTION_URL = 'https://minilm-production.up.railway.app'; // Production URL

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Helper function to log test results
function logResult(testName, success, message, data = null) {
  const status = success ? `${colors.green}PASS${colors.reset}` : `${colors.red}FAIL${colors.reset}`;
  console.log(`[${status}] ${testName}: ${message}`);
  if (data) {
    console.log(`${colors.cyan}Response data:${colors.reset}`, JSON.stringify(data, null, 2));
  }
}

// Test the health endpoint
async function testHealthEndpoint(url) {
  console.log(`\n${colors.magenta}Testing Health Endpoint at ${url}${colors.reset}`);
  try {
    const response = await axios.get(`${url}/health`);

    if (response.status === 200 && response.data.status === 'ok') {
      logResult('Health Check', true, 'Server is running correctly', response.data);
      return true;
    } else {
      logResult('Health Check', false, `Unexpected response: ${response.status}`, response.data);
      return false;
    }
  } catch (error) {
    logResult('Health Check', false, `Error: ${error.message}`);
    return false;
  }
}

// Test the embed endpoint with valid input
async function testEmbedEndpointValid(url) {
  console.log(`\n${colors.magenta}Testing Embed Endpoint (Valid Input) at ${url}${colors.reset}`);
  try {
    const testTexts = ["Hello world", "This is a test"];
    const response = await axios.post(`${url}/embed`, {
      texts: testTexts
    });

    if (response.status === 200 && response.data.embeddings) {
      // Verify the response structure
      const embeddings = response.data.embeddings;
      if (Array.isArray(embeddings) &&
          embeddings.length === testTexts.length &&
          Array.isArray(embeddings[0])) {
        logResult('Embed Valid', true, `Successfully generated embeddings for ${testTexts.length} texts`);

        // Log embedding dimensions
        console.log(`${colors.blue}Embedding dimensions: ${embeddings[0].length}${colors.reset}`);

        // Log a sample of the first embedding (first 5 values)
        console.log(`${colors.blue}Sample of first embedding:${colors.reset}`,
          embeddings[0].slice(0, 5));

        return true;
      } else {
        logResult('Embed Valid', false, 'Response format is incorrect', response.data);
        return false;
      }
    } else {
      logResult('Embed Valid', false, `Unexpected response: ${response.status}`, response.data);
      return false;
    }
  } catch (error) {
    logResult('Embed Valid', false, `Error: ${error.message}`);
    if (error.response) {
      console.log(`${colors.yellow}Response data:${colors.reset}`, error.response.data);
    }
    return false;
  }
}

// Test the embed endpoint with invalid input
async function testEmbedEndpointInvalid(url) {
  console.log(`\n${colors.magenta}Testing Embed Endpoint (Invalid Input) at ${url}${colors.reset}`);
  try {
    // Test with non-array input
    const response = await axios.post(`${url}/embed`, {
      texts: "This is not an array"
    });

    // This should fail, so if we get here, it's a problem
    logResult('Embed Invalid', false, 'Server accepted invalid input', response.data);
    return false;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      logResult('Embed Invalid', true, 'Server correctly rejected invalid input', error.response.data);
      return true;
    } else {
      logResult('Embed Invalid', false, `Unexpected error: ${error.message}`);
      if (error.response) {
        console.log(`${colors.yellow}Response data:${colors.reset}`, error.response.data);
      }
      return false;
    }
  }
}

// Test the answer endpoint
async function testAnswerEndpoint(url) {
  console.log(`\n${colors.magenta}Testing Answer Endpoint at ${url}${colors.reset}`);
  try {
    // Test with a question similar to one in the FAQs
    const testQuestion = "How do I donate money?";
    const response = await axios.post(`${url}/answer`, {
      question: testQuestion
    });

    if (response.status === 200 &&
        response.data.answer &&
        response.data.matchedQuestion &&
        typeof response.data.confidence === 'number') {

      logResult('Answer Endpoint', true, `Successfully found answer for question: "${testQuestion}"`, response.data);

      // Log the confidence score
      console.log(`${colors.blue}Confidence score: ${response.data.confidence.toFixed(4)}${colors.reset}`);

      return true;
    } else {
      logResult('Answer Endpoint', false, `Unexpected response format`, response.data);
      return false;
    }
  } catch (error) {
    logResult('Answer Endpoint', false, `Error: ${error.message}`);
    if (error.response) {
      console.log(`${colors.yellow}Response data:${colors.reset}`, error.response.data);
    }
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log(`${colors.cyan}=== MiniLM API Test Suite ===${colors.reset}`);

  // Determine which URLs to test
  const urlsToTest = [];

  if (process.argv.includes('--local') || process.argv.length === 2) {
    urlsToTest.push(API_URL);
  }

  if (process.argv.includes('--prod')) {
    urlsToTest.push(PRODUCTION_URL);
  }

  // If no URLs to test, show usage
  if (urlsToTest.length === 0) {
    console.log(`
${colors.yellow}Usage:${colors.reset}
  node test-api.js [options]

${colors.yellow}Options:${colors.reset}
  --local    Test local server (default if no options provided)
  --prod     Test production server
  --all      Test both local and production servers
    `);
    return;
  }

  // Add both URLs if --all is specified
  if (process.argv.includes('--all')) {
    urlsToTest.length = 0; // Clear the array
    urlsToTest.push(API_URL, PRODUCTION_URL);
  }

  // Run tests for each URL
  for (const url of urlsToTest) {
    console.log(`\n${colors.cyan}Testing API at: ${url}${colors.reset}`);

    // Run the tests
    const healthResult = await testHealthEndpoint(url);

    // Only proceed with tests if health check passes
    if (healthResult) {
      await testEmbedEndpointValid(url);
      await testEmbedEndpointInvalid(url);
      await testAnswerEndpoint(url);
    } else {
      console.log(`${colors.yellow}Skipping tests because health check failed${colors.reset}`);
    }
  }

  console.log(`\n${colors.cyan}=== Test Suite Completed ===${colors.reset}`);
}

// Run the tests
runTests().catch(error => {
  console.error(`${colors.red}Unhandled error in test suite:${colors.reset}`, error);
});
