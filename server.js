const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Import API handlers
const embedHandler = require('./api/embed');
const faqHandler = require('./api/faq');
const infoHandler = require('./api/info');
const indexHandler = require('./api/index');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// API routes
app.post('/api/embed', async (req, res) => {
  await embedHandler(req, res);
});

app.post('/api/faq', async (req, res) => {
  await faqHandler(req, res);
});

app.get('/api/info', async (req, res) => {
  await infoHandler(req, res);
});

app.get('/api', (req, res) => {
  indexHandler(req, res);
});

// Serve index.html for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('API endpoints:');
  console.log(`- POST http://localhost:${PORT}/api/embed`);
  console.log(`- POST http://localhost:${PORT}/api/faq`);
  console.log(`- GET  http://localhost:${PORT}/api/info`);
});
