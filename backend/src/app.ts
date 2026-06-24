import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import imageRoutes from './routes/image.routes';
import { apiRateLimiter } from './middleware/rateLimiter.middleware';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.middleware';

export function createApp(): express.Application {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(apiRateLimiter);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/images', imageRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
