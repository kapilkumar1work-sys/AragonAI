import sharp from 'sharp';
import { env } from '../config/env';

export class BlurDetectionService {
  async calculateLaplacianVariance(imageBuffer: Buffer): Promise<number> {
    const { data, info } = await sharp(imageBuffer)
      .greyscale()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const width = info.width;
    const height = info.height;
    let sum = 0;
    let sumSq = 0;
    let count = 0;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        const laplacian =
          -4 * data[idx] +
          data[idx - 1] +
          data[idx + 1] +
          data[idx - width] +
          data[idx + width];
        sum += laplacian;
        sumSq += laplacian * laplacian;
        count++;
      }
    }

    if (count === 0) return 0;
    const mean = sum / count;
    return sumSq / count - mean * mean;
  }

  async isBlurry(imageBuffer: Buffer): Promise<boolean> {
    const variance = await this.calculateLaplacianVariance(imageBuffer);
    return variance < env.blurThreshold;
  }
}

export const blurDetectionService = new BlurDetectionService();
