import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, S3_FOLDERS } from '../config/aws';
import { env } from '../config/env';

export class S3Service {
  async uploadFile(
    key: string,
    buffer: Buffer,
    contentType: string,
    folder: keyof typeof S3_FOLDERS = 'originals',
  ): Promise<string> {
    const fullKey = `${S3_FOLDERS[folder]}/${key}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: env.aws.bucket,
        Key: fullKey,
        Body: buffer,
        ContentType: contentType,
      }),
    );

    return fullKey;
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: env.aws.bucket,
      Key: key,
    });
    return getSignedUrl(s3Client, command, { expiresIn });
  }

  async downloadFile(key: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: env.aws.bucket,
      Key: key,
    });
    const response = await s3Client.send(command);
    const stream = response.Body;
    if (!stream) throw new Error('Empty S3 response body');

    const chunks: Uint8Array[] = [];
    for await (const chunk of stream as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }

  async deleteFile(key: string): Promise<void> {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: env.aws.bucket,
        Key: key,
      }),
    );
  }
}

export const s3Service = new S3Service();
