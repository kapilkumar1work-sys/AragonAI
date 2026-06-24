import { S3Client } from '@aws-sdk/client-s3';
import { env } from './env';

export const s3Client = new S3Client({
  region: env.aws.region,
  credentials:
    env.aws.accessKeyId && env.aws.secretAccessKey
      ? {
          accessKeyId: env.aws.accessKeyId,
          secretAccessKey: env.aws.secretAccessKey,
        }
      : undefined,
});

export const S3_FOLDERS = {
  originals: 'uploads/originals',
  processed: 'uploads/processed',
} as const;
