import sharp from 'sharp';
import { env } from '../config/env';

const BLUR_ANALYSIS_WIDTH = 800;

export interface BlurCheckResult {
  isBlurry: boolean;
  score: number;
  threshold: number;
}

export class BlurDetectionService {
  /**
   * Variance of Laplacian on a normalized-size grayscale image.
   * Sharp images → high score. Blurry images → low score.
   */
  async calculateLaplacianVariance(imageBuffer: Buffer): Promise<number> {
    const { data, info } = await sharp(imageBuffer)
      .resize(BLUR_ANALYSIS_WIDTH, null, { withoutEnlargement: true, fit: 'inside' })
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

  async checkBlur(imageBuffer: Buffer): Promise<BlurCheckResult> {
    const score = await this.calculateLaplacianVariance(imageBuffer);
    const threshold = env.blurThreshold;

    return {
      isBlurry: score < threshold,
      score: Math.round(score * 100) / 100,
      threshold,
    };
  }

  async isBlurry(imageBuffer: Buffer): Promise<boolean> {
    const result = await this.checkBlur(imageBuffer);
    return result.isBlurry;
  }
}

export const blurDetectionService = new BlurDetectionService();
