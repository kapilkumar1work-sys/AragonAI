import { useEffect, useRef } from 'react';
import { useUploadStore } from '../store/uploadStore';
import { imageApi } from '../services/api';
import { mapBackendStatus } from '../utils/validation';

const POLL_INTERVAL = 2000;

export function useImagePolling() {
  const { uploads, updateUpload } = useUploadStore();
  const pollingIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const processingUploads = uploads.filter(
      (u) => u.status === 'processing' || u.status === 'uploading',
    );

    for (const upload of processingUploads) {
      if (upload.id.startsWith('local-')) continue;
      if (pollingIds.current.has(upload.id)) continue;

      pollingIds.current.add(upload.id);

      const poll = async () => {
        try {
          const status = await imageApi.getStatus(upload.id);

          if (status.status === 'PENDING' || status.status === 'PROCESSING') {
            updateUpload(upload.id, { status: 'processing' });
            setTimeout(poll, POLL_INTERVAL);
            return;
          }

          updateUpload(upload.id, {
            status: mapBackendStatus(status.status),
            rejectionReason: status.rejectionReason,
          });
          pollingIds.current.delete(upload.id);
        } catch {
          pollingIds.current.delete(upload.id);
        }
      };

      if (upload.status === 'uploading' && (upload.uploadProgress ?? 0) >= 100) {
        updateUpload(upload.id, { status: 'processing' });
      }

      poll();
    }
  }, [uploads, updateUpload]);

  useEffect(() => {
    return () => {
      pollingIds.current.clear();
    };
  }, []);
}
