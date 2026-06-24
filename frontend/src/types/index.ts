export type UploadStatus =
  | 'pending'
  | 'uploading'
  | 'processing'
  | 'accepted'
  | 'rejected';

export type BackendImageStatus = 'PENDING' | 'PROCESSING' | 'ACCEPTED' | 'REJECTED';

export interface ImageUpload {
  id: string;
  fileName: string;
  previewUrl: string;
  fileSize: number;
  status: UploadStatus;
  rejectionReason?: string;
  uploadProgress?: number;
}

export interface ApiImage {
  id: string;
  filename: string;
  originalUrl: string;
  processedUrl?: string;
  fileType: string;
  fileSize: number;
  width?: number;
  height?: number;
  status: BackendImageStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ImageStatusResponse {
  id: string;
  status: BackendImageStatus;
  rejectionReason?: string;
  updatedAt: string;
}

export interface ValidationError {
  fileName: string;
  message: string;
}

export const ALLOWED_FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/heic': ['.heic'],
  'image/heif': ['.heic'],
} as const;

export const MAX_FILE_SIZE = 25 * 1024 * 1024;

export const REJECTION_REASONS = [
  'Multiple Faces Detected',
  'Face Too Small',
  'Blurry Image',
  'Duplicate Image',
  'Invalid Resolution',
  'No Face Detected',
  'Invalid File Format',
  'Corrupted Image',
] as const;
