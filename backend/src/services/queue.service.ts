import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis';
import { QUEUE_NAMES } from '../utils/constants';

export interface ImageValidationJobData {
  imageId: string;
  s3Key: string;
  filename: string;
}

class QueueService {
  private imageValidationQueue: Queue<ImageValidationJobData>;

  constructor() {
    this.imageValidationQueue = new Queue<ImageValidationJobData>(
      QUEUE_NAMES.IMAGE_VALIDATION,
      { connection: redisConnection },
    );
  }

  getImageValidationQueue(): Queue<ImageValidationJobData> {
    return this.imageValidationQueue;
  }

  async addImageValidationJob(data: ImageValidationJobData): Promise<void> {
    await this.imageValidationQueue.add('validate-image', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: 100,
      removeOnFail: 50,
    });
  }
}

export const queueService = new QueueService();
