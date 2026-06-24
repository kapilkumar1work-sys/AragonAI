import { createApp } from './app';
import { connectDatabase } from './config/database';
import { validateEnv, env } from './config/env';

async function bootstrap(): Promise<void> {
  validateEnv();

  try {
    await connectDatabase();
  } catch (err) {
    if (env.nodeEnv === 'production') {
      throw err;
    }
    console.warn(
      'MongoDB connection failed — API will start but database operations will fail until MONGODB_URI is configured.',
    );
    console.warn(err instanceof Error ? err.message : err);
  }

  const app = createApp();

  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
