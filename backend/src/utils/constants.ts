export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/heic',
  'image/heif',
] as const;

export const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'heic', 'heif'] as const;

export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;

export const MIN_RESOLUTION = 512;

export const IMAGE_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
} as const;

export const REJECTION_REASONS = {
  INVALID_FORMAT: 'Invalid File Format',
  FILE_TOO_LARGE: 'File Too Large',
  INVALID_RESOLUTION: 'Invalid Resolution',
  BLURRY_IMAGE: 'Blurry Image',
  NO_FACE_DETECTED: 'No Face Detected',
  MULTIPLE_FACES: 'Multiple Faces Detected',
  FACE_TOO_SMALL: 'Face Too Small',
  DUPLICATE_IMAGE: 'Duplicate Image',
  CORRUPTED_IMAGE: 'Corrupted Image',
} as const;

export const QUEUE_NAMES = {
  IMAGE_VALIDATION: 'IMAGE_VALIDATION',
} as const;
