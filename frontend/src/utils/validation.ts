import type { ValidationError } from '../types';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '../types';

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.heic'];
const ALLOWED_MIME_TYPES = Object.keys(ALLOWED_FILE_TYPES);

export function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.');
  return lastDot >= 0 ? fileName.slice(lastDot).toLowerCase() : '';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function validateFile(file: File): ValidationError | null {
  const extension = getFileExtension(file.name);

  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      fileName: file.name,
      message: `Invalid file type "${extension}". Allowed: JPG, JPEG, PNG, HEIC`,
    };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type) && file.type !== '') {
    const extToMime: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.heic': 'image/heic',
    };
    const expectedMime = extToMime[extension];
    if (file.type && expectedMime && file.type !== expectedMime) {
      return {
        fileName: file.name,
        message: 'File content does not match its extension',
      };
    }
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      fileName: file.name,
      message: `File exceeds 25MB limit (${formatFileSize(file.size)})`,
    };
  }

  if (file.size === 0) {
    return {
      fileName: file.name,
      message: 'File is empty or corrupted',
    };
  }

  return null;
}

export async function validateImageIntegrity(file: File): Promise<ValidationError | null> {
  if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
    return null;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      if (img.width === 0 || img.height === 0) {
        resolve({ fileName: file.name, message: 'Corrupted or invalid image' });
      } else {
        resolve(null);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ fileName: file.name, message: 'Corrupted or invalid image' });
    };

    img.src = url;
  });
}

export function mapBackendStatus(
  status: string,
): 'pending' | 'uploading' | 'processing' | 'accepted' | 'rejected' {
  switch (status) {
    case 'PENDING':
      return 'processing';
    case 'PROCESSING':
      return 'processing';
    case 'ACCEPTED':
      return 'accepted';
    case 'REJECTED':
      return 'rejected';
    default:
      return 'pending';
  }
}

export function generateLocalId(): string {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
