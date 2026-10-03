import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './api-routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Mount REST API & SSE on /api
app.use('/api', apiRouter);

// Serve static files from the React dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// SPA Fallback for client-side routing with no-cache headers for instant mobile updates
app.get('*', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Sufrah SaaS Production Server & API is running on http://0.0.0.0:${PORT}`);
});
