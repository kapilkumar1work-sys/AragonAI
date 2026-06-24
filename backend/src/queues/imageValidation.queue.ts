import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis';
import { QUEUE_NAMES } from '../utils/constants';

export const imageValidationQueue = new Queue(QUEUE_NAMES.IMAGE_VALIDATION, {
  connection: redisConnection,
});
