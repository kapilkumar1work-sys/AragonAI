import { ALLOWED_EXTENSIONS, ALLOWED_MIME_TYPES } from './constants';

const EXTENSION_SET = new Set<string>(ALLOWED_EXTENSIONS);
const MIME_SET = new Set<string>(ALLOWED_MIME_TYPES);

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .slice(0, 255);
}

export function getFileExtension(filename: string): string {
  const parts = filename.toLowerCase().split('.');
  return parts.length > 1 ? parts[parts.length - 1] : '';
}

export function isAllowedExtension(extension: string): boolean {
  return EXTENSION_SET.has(extension.toLowerCase());
}

export function isAllowedMimeType(mimeType: string): boolean {
  return MIME_SET.has(mimeType.toLowerCase());
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
