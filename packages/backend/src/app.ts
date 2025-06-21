// Basic Express app setup
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import apiRouter from './routes/api';
import authRouter from './routes/auth.routes';

const app = express();

// Middlewaree
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// API Routes
app.use('/api', apiRouter);
app.use('/api/auth', authRouter);

// Health check route
app.get('/', (req, res) => {
  res.send('API is running');
});

export default app;