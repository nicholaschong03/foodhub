// Basic Express app setup
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import apiRouter from './routes/api';
import authRouter from './routes/auth.routes';

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://sage-manatee-1d2d66.netlify.app',
  process.env.FRONTEND_URL || 'http://localhost:5173'
].filter(Boolean);

// Middlewaree
app.use(cors({
  origin: function (origin, callback) {
    // origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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