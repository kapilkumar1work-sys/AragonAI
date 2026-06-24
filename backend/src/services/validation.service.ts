import sharp from 'sharp';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const convert = require('heic-convert');
import { MIN_RESOLUTION, REJECTION_REASONS } from '../utils/constants';
import { blurDetectionService } from './blurDetection.service';
import { faceDetectionService } from './faceDetection.service';
import { duplicateDetectionService } from './duplicateDetection.service';
import { getFileExtension } from '../utils/fileValidation';

export interface ProcessedImage {
  buffer: Buffer;
  width: number;
  height: number;
  contentType: string;
  hash: string;
}

export interface ValidationPipelineResult {
  accepted: boolean;
  rejectionReason?: string;
  processedImage?: ProcessedImage;
}

export class ValidationService {
  async convertHeicIfNeeded(buffer: Buffer, filename: string): Promise<Buffer> {
    const ext = getFileExtension(filename);
    if (ext !== 'heic' && ext !== 'heif') {
      return buffer;
    }

    const outputBuffer = await convert({
      buffer,
      format: 'JPEG',
      quality: 0.9,
    });

    return Buffer.from(outputBuffer);
  }

  async processImage(buffer: Buffer, filename: string): Promise<ProcessedImage> {
    let processedBuffer = await this.convertHeicIfNeeded(buffer, filename);

    const metadata = await sharp(processedBuffer).metadata();
    if (!metadata.width || !metadata.height) {
      throw new Error(REJECTION_REASONS.CORRUPTED_IMAGE);
    }

    const ext = getFileExtension(filename);
    const isHeic = ext === 'heic' || ext === 'heif';
    const contentType = isHeic ? 'image/jpeg' : `image/${ext === 'jpg' ? 'jpeg' : ext}`;

    if (isHeic) {
      processedBuffer = await sharp(processedBuffer).jpeg({ quality: 90 }).toBuffer();
    }

    const hash = await duplicateDetectionService.generateHash(processedBuffer);

    return {
      buffer: processedBuffer,
      width: metadata.width,
      height: metadata.height,
      contentType,
      hash,
    };
  }

  async runValidationPipeline(
    buffer: Buffer,
    filename: string,
    excludeId?: string,
  ): Promise<ValidationPipelineResult> {
    let processed: ProcessedImage;

    try {
      processed = await this.processImage(buffer, filename);
    } catch {
      return { accepted: false, rejectionReason: REJECTION_REASONS.CORRUPTED_IMAGE };
    }

    if (processed.width < MIN_RESOLUTION || processed.height < MIN_RESOLUTION) {
      return {
        accepted: false,
        rejectionReason: REJECTION_REASONS.INVALID_RESOLUTION,
      };
    }

    const blurResult = await blurDetectionService.checkBlur(processed.buffer);
    if (blurResult.isBlurry) {
      console.log(
        `Rejected blurry image (score: ${blurResult.score}, threshold: ${blurResult.threshold})`,
      );
      return { accepted: false, rejectionReason: REJECTION_REASONS.BLURRY_IMAGE };
    }

    const faceResult = await faceDetectionService.validateFace(processed.buffer);
    if (faceResult.faceCount === 0) {
      return { accepted: false, rejectionReason: REJECTION_REASONS.NO_FACE_DETECTED };
    }
    if (faceResult.faceCount > 1) {
      return { accepted: false, rejectionReason: REJECTION_REASONS.MULTIPLE_FACES };
    }
    if (faceResult.largestFaceAreaPercent < 15) {
      return { accepted: false, rejectionReason: REJECTION_REASONS.FACE_TOO_SMALL };
    }

    const isDuplicate = await duplicateDetectionService.findDuplicate(
      processed.hash,
      excludeId,
    );
    if (isDuplicate) {
      return { accepted: false, rejectionReason: REJECTION_REASONS.DUPLICATE_IMAGE };
    }

    return { accepted: true, processedImage: processed };
  }
}

export const validationService = new ValidationService();
