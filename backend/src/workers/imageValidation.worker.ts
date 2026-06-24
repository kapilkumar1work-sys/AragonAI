import { Worker } from 'bullmq';
import { redisConnection } from '../config/redis';
import { connectDatabase } from '../config/database';
import { QUEUE_NAMES } from '../utils/constants';
import { processImageValidationJob } from '../jobs/imageValidation.job';
import { validateEnv } from '../config/env';

async function startWorker(): Promise<void> {
  validateEnv();
  await connectDatabase();

  const worker = new Worker(QUEUE_NAMES.IMAGE_VALIDATION, processImageValidationJob, {
    connection: redisConnection,
    concurrency: 5,
  });

  worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed for image ${job.data.imageId}`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed:`, err.message);
    if (job?.data.imageId) {
      ImageModelUpdateFailed(job.data.imageId, err.message);
    }
  });

  console.log('Image validation worker started');
}

async function ImageModelUpdateFailed(imageId: string, reason: string): Promise<void> {
  const { ImageModel } = await import('../models/Image');
  const { IMAGE_STATUS } = await import('../utils/constants');
  await ImageModel.findByIdAndUpdate(imageId, {
    status: IMAGE_STATUS.REJECTED,
    rejectionReason: reason,
  });
}

startWorker().catch((err) => {
  console.error('Worker failed to start:', err);
  process.exit(1);
});
