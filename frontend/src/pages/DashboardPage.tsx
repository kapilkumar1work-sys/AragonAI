import { useCallback, useState } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { UploadArea } from '../components/UploadArea';
import { UploadSettingsForm } from '../components/UploadSettingsForm';
import { ImageGrid } from '../components/ImageGrid';
import { ToastContainer } from '../components/ToastContainer';
import { ImagePreviewCard } from '../components/ImagePreviewCard';
import { useUploadStore } from '../store/uploadStore';
import { useImageUpload } from '../hooks/useImageUpload';
import { useImagePolling } from '../hooks/useImagePolling';
import { useToast } from '../hooks/useToast';

export function DashboardPage() {
  const { uploads, getAccepted, getRejected, removeUpload } = useUploadStore();
  const { toasts, addToast, removeToast } = useToast();
  const [notifyOnComplete, setNotifyOnComplete] = useState(true);

  useImagePolling();

  const { uploadFiles } = useImageUpload({
    onSuccess: (upload) => {
      if (notifyOnComplete) {
        addToast(`${upload.fileName} uploaded successfully`, 'success');
      }
    },
    onError: (fileName, message) => {
      addToast(`${fileName}: ${message}`, 'error');
    },
  });

  const handleFilesSelected = useCallback(
    (files: File[]) => {
      uploadFiles(files);
    },
    [uploadFiles],
  );

  const accepted = getAccepted();
  const rejected = getRejected();
  const inProgress = uploads.filter(
    (u) =>
      u.status === 'pending' ||
      u.status === 'uploading' ||
      u.status === 'processing',
  );

  const isUploading = inProgress.some(
    (u) => u.status === 'uploading' || u.status === 'processing',
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Photo Upload</h2>
          <p className="mt-1 text-slate-600">
            Upload portrait photos for AI processing. We validate quality, detect faces, and
            check for duplicates automatically.
          </p>
        </div>

        <UploadSettingsForm
          disabled={isUploading}
          onSubmit={(values) => setNotifyOnComplete(values.notifyOnComplete)}
        />

        <UploadArea onFilesSelected={handleFilesSelected} disabled={isUploading} />

        {inProgress.length > 0 && (
          <section>
            <h3 className="mb-4 text-lg font-semibold text-slate-900">In Progress</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {inProgress.map((upload) => (
                <ImagePreviewCard
                  key={upload.id}
                  upload={upload}
                  onRemove={removeUpload}
                />
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <ImageGrid
            title="Accepted Images"
            images={accepted}
            emptyMessage="No accepted images yet. Upload photos to get started."
            variant="accepted"
            onRemove={removeUpload}
          />

          <ImageGrid
            title="Rejected Images"
            images={rejected}
            emptyMessage="No rejected images. Validation issues will appear here."
            variant="rejected"
            onRemove={removeUpload}
          />
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </DashboardLayout>
  );
}
