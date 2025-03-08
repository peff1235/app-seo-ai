import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import keywordRoutes from './routes/keywordRoutes.js';
import serpRoutes from './routes/serpRoutes.js';
import competitorRoutes from './routes/competitorRoutes.js';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/keywords', keywordRoutes);
app.use('/api/serp', serpRoutes);
app.use('/api/competitors', competitorRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'MCP Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`MCP Server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});

export default app;