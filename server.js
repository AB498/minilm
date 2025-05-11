import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Import API handlers
import embedHandler from './api/embed.js';
import faqHandler from './api/faq.js';
import infoHandler from './api/info.js';
import indexHandler from './api/index.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
