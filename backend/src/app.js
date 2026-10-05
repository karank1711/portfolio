import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { allowedOrigins, env } from './config/env.js';
import { globalLimiter } from './middleware/rateLimits.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import api from './routes/index.js';

export const app = express();

if (env.nodeEnv === 'production') app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(helmet());
app.use(cors({
  origin: allowedOrigins(),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '1mb' }));
app.use('/api', globalLimiter, api);
app.use(notFound);
app.use(errorHandler);
