import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { allowedOrigins, env } from './config/env.js';
import { globalLimiter } from './middleware/rateLimits.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { invalidatePortfolioCache } from './services/portfolio.service.js';
import api from './routes/index.js';

export const app = express();
 app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: allowedOrigins(),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '1mb' }));
app.use('/api', (req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && !req.path.startsWith('/contact') && !req.path.startsWith('/auth')) {
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        invalidatePortfolioCache();
      }
    });
  }
  next();
});
app.use('/api', globalLimiter, api);
app.use(notFound);
app.use(errorHandler);
