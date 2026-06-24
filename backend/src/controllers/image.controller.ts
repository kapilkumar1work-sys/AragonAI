import { Request, Response, NextFunction } from 'express';
import { uploadService } from '../services/upload.service';
import { AppError } from '../middleware/errorHandler.middleware';

export class ImageController {
  async upload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        throw new AppError('No file uploaded', 400);
      }

      const image = await uploadService.uploadImage(req.file);
      const formatted = await uploadService.formatImageResponse(image);

      res.status(201).json({
        success: true,
        data: formatted,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const images = await uploadService.getAllImages();
      const formatted = await Promise.all(
        images.map((img) => uploadService.formatImageResponse(img)),
      );

      res.json({
        success: true,
        data: formatted,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const image = await uploadService.getImageById(id);
      if (!image) {
        throw new AppError('Image not found', 404);
      }

      const formatted = await uploadService.formatImageResponse(image);
      res.json({
        success: true,
        data: formatted,
      });
    } catch (error) {
      next(error);
    }
  }

  async getStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const image = await uploadService.getImageStatus(id);
      if (!image) {
        throw new AppError('Image not found', 404);
      }

      res.json({
        success: true,
        data: {
          id: image._id.toString(),
          status: image.status,
          rejectionReason: image.rejectionReason,
          updatedAt: image.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await uploadService.deleteImage(String(req.params.id));
      res.json({
        success: true,
        message: 'Image deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const imageController = new ImageController();
