import { fromBuffer } from 'file-type';
import sharp from 'sharp';
import { ALLOWED_MIME_TYPES, REJECTION_REASONS } from '../utils/constants';
import { getFileExtension, isAllowedExtension } from '../utils/fileValidation';

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

export async function validateFileBuffer(
  buffer: Buffer,
  filename: string,
): Promise<ValidationResult> {
  const extension = getFileExtension(filename);

  if (!isAllowedExtension(extension)) {
    return { valid: false, reason: REJECTION_REASONS.INVALID_FORMAT };
  }

  const fileType = await fromBuffer(buffer);
  if (!fileType || !ALLOWED_MIME_TYPES.includes(fileType.mime as (typeof ALLOWED_MIME_TYPES)[number])) {
    return { valid: false, reason: REJECTION_REASONS.INVALID_FORMAT };
  }

  try {
    if (extension === 'heic' || extension === 'heif') {
      return { valid: true };
    }
    await sharp(buffer).metadata();
    return { valid: true };
  } catch {
    return { valid: false, reason: REJECTION_REASONS.CORRUPTED_IMAGE };
  }
}
