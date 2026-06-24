import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: parseInt(process.env.PORT || '5001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || '',
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'us-east-1',
    bucket: process.env.AWS_S3_BUCKET || '',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '25', 10),
  blurThreshold: parseFloat(process.env.BLUR_THRESHOLD || '250'),
  faceMinAreaPercent: parseFloat(process.env.FACE_MIN_AREA_PERCENT || '15'),
  duplicateSimilarityThreshold: parseFloat(
    process.env.DUPLICATE_SIMILARITY_THRESHOLD || '95',
  ),
};

export function validateEnv(): void {
  const required = ['mongodbUri'];
  const missing = required.filter((key) => !env[key as keyof typeof env]);
  if (missing.length > 0) {
    console.warn(`Warning: Missing environment variables: ${missing.join(', ')}`);
  }
}
