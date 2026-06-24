import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env';
import { ALLOWED_EXTENSIONS } from '../utils/constants';
import { sanitizeFilename } from '../utils/fileValidation';

const storage = multer.memoryStorage();

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  if (!ALLOWED_EXTENSIONS.includes(ext as (typeof ALLOWED_EXTENSIONS)[number])) {
    cb(new Error(`Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`));
    return;
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.maxFileSizeMb * 1024 * 1024,
    files: 10,
  },
});

export function generateSafeKey(originalName: string): string {
  const sanitized = sanitizeFilename(originalName);
  const ext = path.extname(sanitized);
  const base = path.basename(sanitized, ext);
  return `${uuidv4()}-${base}${ext}`;
}
