import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const isDevelopment = process.env.NODE_ENV !== 'production';

// Use environment-specific variables
const port = isDevelopment ? process.env.DEV_PORT : process.env.PROD_PORT;
const mongoUri = isDevelopment ? process.env.DEV_MONGODB_URI : process.env.PROD_MONGODB_URI;

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    environment: isDevelopment ? 'development' : 'production',
    timestamp: new Date().toISOString()
  });
});

// MongoDB connection
if (!mongoUri) {
  throw new Error('MongoDB URI environment variable is required');
}

mongoose.connect(mongoUri)
  .then(() => {
    console.log(`Connected to MongoDB in ${isDevelopment ? 'development' : 'production'} mode`);
    app.listen(port, () => {
      console.log(`Server running on port ${port} in ${isDevelopment ? 'development' : 'production'} mode`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });