import { StatusBadge } from './StatusBadge';
import { ProgressBar } from './ProgressBar';
import { formatFileSize } from '../utils/validation';
import type { ImageUpload } from '../types';

interface ImagePreviewCardProps {
  upload: ImageUpload;
  onRemove?: (id: string) => void;
}

export function ImagePreviewCard({ upload, onRemove }: ImagePreviewCardProps) {
  return (
    <div className="card animate-fade-in overflow-hidden transition-shadow hover:shadow-md">
      <div className="relative aspect-square bg-slate-100">
        <img
          src={upload.previewUrl}
          alt={upload.fileName}
          className="h-full w-full object-cover"
        />
        {(upload.status === 'uploading' || upload.status === 'processing') && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="text-center text-white">
              {upload.status === 'uploading' ? (
                <>
                  <div className="mb-2 h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent mx-auto" />
                  <p className="text-sm font-medium">Uploading...</p>
                </>
              ) : (
                <>
                  <div className="mb-2 h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent mx-auto" />
                  <p className="text-sm font-medium">Processing...</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2 p-4">
        <p className="truncate text-sm font-medium text-slate-900" title={upload.fileName}>
          {upload.fileName}
        </p>
        <p className="text-xs text-slate-500">{formatFileSize(upload.fileSize)}</p>

        {upload.status === 'uploading' && upload.uploadProgress !== undefined && (
          <ProgressBar progress={upload.uploadProgress} />
        )}

        <div className="flex items-center justify-between">
          <StatusBadge status={upload.status} />
          {onRemove && (
            <button
              onClick={() => onRemove(upload.id)}
              className="text-xs text-slate-400 hover:text-red-500 transition-colors"
            >
              Remove
            </button>
          )}
        </div>

        {upload.status === 'rejected' && upload.rejectionReason && (
          <p className="rounded-md bg-red-50 px-2 py-1.5 text-xs text-red-600">
            {upload.rejectionReason}
          </p>
        )}
      </div>
    </div>
  );
}
