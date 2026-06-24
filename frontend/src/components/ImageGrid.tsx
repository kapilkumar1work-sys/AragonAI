import { ImagePreviewCard } from './ImagePreviewCard';
import type { ImageUpload } from '../types';

interface ImageGridProps {
  title: string;
  images: ImageUpload[];
  emptyMessage: string;
  variant: 'accepted' | 'rejected';
  onRemove?: (id: string) => void;
}

export function ImageGrid({
  title,
  images,
  emptyMessage,
  variant,
  onRemove,
}: ImageGridProps) {
  const borderColor = variant === 'accepted' ? 'border-green-200' : 'border-red-200';
  const headerBg = variant === 'accepted' ? 'bg-green-50' : 'bg-red-50';
  const headerText = variant === 'accepted' ? 'text-green-800' : 'text-red-800';

  return (
    <section className={`card overflow-hidden ${borderColor}`}>
      <div className={`border-b px-6 py-4 ${headerBg}`}>
        <div className="flex items-center justify-between">
          <h2 className={`text-lg font-semibold ${headerText}`}>{title}</h2>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${headerBg} ${headerText}`}
          >
            {images.length}
          </span>
        </div>
      </div>

      <div className="p-6">
        {images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <svg
                className="h-6 w-6 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-sm text-slate-500">{emptyMessage}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((upload) => (
              <ImagePreviewCard key={upload.id} upload={upload} onRemove={onRemove} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
