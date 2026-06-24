import { ImageModel, IImage } from '../models/Image';
import { s3Service } from './s3.service';
import { queueService } from './queue.service';
import { validateFileBuffer } from '../validators/image.validator';
import { generateSafeKey } from '../middleware/upload.middleware';
import { IMAGE_STATUS } from '../utils/constants';
import { AppError } from '../middleware/errorHandler.middleware';

export class UploadService {
  async uploadImage(file: Express.Multer.File): Promise<IImage> {
    const validation = await validateFileBuffer(file.buffer, file.originalname);
    if (!validation.valid) {
      throw new AppError(validation.reason || 'Invalid file', 400);
    }

    const safeKey = generateSafeKey(file.originalname);
    const s3Key = await s3Service.uploadFile(safeKey, file.buffer, file.mimetype);

    const image = await ImageModel.create({
      filename: file.originalname,
      originalUrl: s3Key,
      fileType: file.mimetype,
      fileSize: file.size,
      status: IMAGE_STATUS.PENDING,
    });

    await queueService.addImageValidationJob({
      imageId: image._id.toString(),
      s3Key,
      filename: file.originalname,
    });

    return image;
  }

  async getAllImages(): Promise<IImage[]> {
    return ImageModel.find().sort({ createdAt: -1 }).exec();
  }

  async getImageById(id: string): Promise<IImage | null> {
    return ImageModel.findById(id).exec();
  }

  async getImageStatus(id: string): Promise<IImage | null> {
    return ImageModel.findById(id).select('status rejectionReason updatedAt').exec();
  }

  async deleteImage(id: string): Promise<void> {
    const image = await ImageModel.findById(id);
    if (!image) {
      throw new AppError('Image not found', 404);
    }

    try {
      await s3Service.deleteFile(image.originalUrl);
      if (image.processedUrl) {
        await s3Service.deleteFile(image.processedUrl);
      }
    } catch (error) {
      console.error('S3 delete error:', error);
    }

    await ImageModel.findByIdAndDelete(id);
  }

  async formatImageResponse(image: IImage) {
    const originalUrl = await s3Service.getSignedUrl(image.originalUrl);
    const processedUrl = image.processedUrl
      ? await s3Service.getSignedUrl(image.processedUrl)
      : undefined;

    return {
      id: image._id.toString(),
      filename: image.filename,
      originalUrl,
      processedUrl,
      fileType: image.fileType,
      fileSize: image.fileSize,
      width: image.width,
      height: image.height,
      status: image.status,
      rejectionReason: image.rejectionReason,
      createdAt: image.createdAt,
      updatedAt: image.updatedAt,
    };
  }
}

export const uploadService = new UploadService();
