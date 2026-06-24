import imageHash from 'image-hash';
import { promisify } from 'util';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { ImageModel } from '../models/Image';
import { env } from '../config/env';
import { IMAGE_STATUS } from '../utils/constants';

const hashImage = promisify(imageHash.imageHash);

export class DuplicateDetectionService {
  async generateHash(imageBuffer: Buffer): Promise<string> {
    const tempPath = path.join(os.tmpdir(), `img-hash-${Date.now()}.jpg`);
    await fs.writeFile(tempPath, imageBuffer);
    try {
      return (await hashImage(tempPath, 16, true)) as string;
    } finally {
      await fs.unlink(tempPath).catch(() => undefined);
    }
  }

  calculateSimilarity(hash1: string, hash2: string): number {
    if (hash1.length !== hash2.length) return 0;

    let distance = 0;
    const totalBits = hash1.length * 4;

    for (let i = 0; i < hash1.length; i++) {
      const n1 = parseInt(hash1[i], 16);
      const n2 = parseInt(hash2[i], 16);
      let xor = n1 ^ n2;
      while (xor > 0) {
        distance += xor & 1;
        xor >>= 1;
      }
    }

    return ((totalBits - distance) / totalBits) * 100;
  }

  async findDuplicate(hash: string, excludeId?: string): Promise<boolean> {
    const existingImages = await ImageModel.find({
      hash: { $exists: true, $ne: null },
      status: { $in: [IMAGE_STATUS.ACCEPTED, IMAGE_STATUS.PROCESSING] },
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    })
      .select('hash')
      .lean();

    const threshold = env.duplicateSimilarityThreshold;

    for (const image of existingImages) {
      if (!image.hash) continue;
      const similarity = this.calculateSimilarity(hash, image.hash);
      if (similarity > threshold) {
        return true;
      }
    }

    return false;
  }
}

export const duplicateDetectionService = new DuplicateDetectionService();
