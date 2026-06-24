import { Job } from 'bullmq';
import { ImageModel } from '../models/Image';
import { s3Service } from '../services/s3.service';
import { validationService } from '../services/validation.service';
import { ImageValidationJobData } from '../services/queue.service';
import { IMAGE_STATUS } from '../utils/constants';
import { generateSafeKey } from '../middleware/upload.middleware';

export async function processImageValidationJob(
  job: Job<ImageValidationJobData>,
): Promise<void> {
  const { imageId, s3Key, filename } = job.data;

  const image = await ImageModel.findById(imageId);
  if (!image) {
    throw new Error(`Image not found: ${imageId}`);
  }

  await ImageModel.findByIdAndUpdate(imageId, {
    status: IMAGE_STATUS.PROCESSING,
  });

  const buffer = await s3Service.downloadFile(s3Key);
  const result = await validationService.runValidationPipeline(
    buffer,
    filename,
    imageId,
  );

  if (!result.accepted) {
    await ImageModel.findByIdAndUpdate(imageId, {
      status: IMAGE_STATUS.REJECTED,
      rejectionReason: result.rejectionReason,
    });
    return;
  }

  const processed = result.processedImage!;
  const processedKey = generateSafeKey(filename.replace(/\.[^.]+$/, '.jpg'));
  const processedS3Key = await s3Service.uploadFile(
    processedKey,
    processed.buffer,
    processed.contentType,
    'processed',
  );

  await ImageModel.findByIdAndUpdate(imageId, {
    status: IMAGE_STATUS.ACCEPTED,
    processedUrl: processedS3Key,
    width: processed.width,
    height: processed.height,
    hash: processed.hash,
    rejectionReason: undefined,
  });
}
