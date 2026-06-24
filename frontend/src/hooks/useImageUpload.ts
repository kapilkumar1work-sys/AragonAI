import { useCallback } from 'react';
import { useUploadStore } from '../store/uploadStore';
import { imageApi } from '../services/api';
import {
  validateFile,
  validateImageIntegrity,
  mapBackendStatus,
  generateLocalId,
} from '../utils/validation';
import type { ImageUpload } from '../types';

interface UseImageUploadOptions {
  onSuccess?: (upload: ImageUpload) => void;
  onError?: (fileName: string, message: string) => void;
}

export function useImageUpload(options: UseImageUploadOptions = {}) {
  const { addUpload, updateUpload } = useUploadStore();

  const uploadFile = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        options.onError?.(validationError.fileName, validationError.message);
        return;
      }

      const integrityError = await validateImageIntegrity(file);
      if (integrityError) {
        options.onError?.(integrityError.fileName, integrityError.message);
        return;
      }

      const localId = generateLocalId();
      const previewUrl = URL.createObjectURL(file);

      const upload: ImageUpload = {
        id: localId,
        fileName: file.name,
        previewUrl,
        fileSize: file.size,
        status: 'uploading',
        uploadProgress: 0,
      };

      addUpload(upload);

      try {
        const result = await imageApi.upload(file, (progress) => {
          updateUpload(localId, { uploadProgress: progress });
        });

        updateUpload(localId, {
          id: result.id,
          status: mapBackendStatus(result.status),
          uploadProgress: 100,
        });

        options.onSuccess?.({
          ...upload,
          id: result.id,
          status: mapBackendStatus(result.status),
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Upload failed. Please try again.';
        updateUpload(localId, {
          status: 'rejected',
          rejectionReason: message,
        });
        options.onError?.(file.name, message);
      }
    },
    [addUpload, updateUpload, options],
  );

  const uploadFiles = useCallback(
    async (files: File[]) => {
      await Promise.all(files.map((file) => uploadFile(file)));
    },
    [uploadFile],
  );

  return { uploadFile, uploadFiles };
}
