import { Router } from 'express';
import { imageController } from '../controllers/image.controller';
import { upload } from '../middleware/upload.middleware';
import { uploadRateLimiter } from '../middleware/rateLimiter.middleware';

const router = Router();

router.post(
  '/upload',
  uploadRateLimiter,
  upload.single('image'),
  imageController.upload.bind(imageController),
);

router.get('/', imageController.getAll.bind(imageController));
router.get('/status/:id', imageController.getStatus.bind(imageController));
router.get('/:id', imageController.getById.bind(imageController));
router.delete('/:id', imageController.delete.bind(imageController));

export default router;
