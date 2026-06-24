import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ALLOWED_FILE_TYPES } from '../types';

interface UploadAreaProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

export function UploadArea({ onFilesSelected, disabled = false }: UploadAreaProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFilesSelected(acceptedFiles);
      }
    },
    [onFilesSelected],
  );

  const { getRootProps, getInputProps, isDragReject, fileRejections } = useDropzone({
    onDrop,
    accept: ALLOWED_FILE_TYPES,
    multiple: true,
    disabled,
    maxSize: 25 * 1024 * 1024,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onDropAccepted: () => setIsDragActive(false),
    onDropRejected: () => setIsDragActive(false),
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          relative cursor-pointer rounded-xl border-2 border-dashed p-8 sm:p-12
          transition-all duration-200 text-center
          ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:border-brand-400 hover:bg-brand-50/50'}
          ${isDragActive ? 'border-brand-500 bg-brand-50' : 'border-slate-300 bg-white'}
          ${isDragReject ? 'border-red-400 bg-red-50' : ''}
        `}
      >
        <input {...getInputProps()} />

        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100">
          <svg
            className="h-8 w-8 text-brand-600"
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

        <h3 className="mb-2 text-lg font-semibold text-slate-900">
          {isDragActive ? 'Drop your photos here' : 'Upload your photos'}
        </h3>
        <p className="mb-4 text-sm text-slate-500">
          Drag and drop or click to browse. Supports JPG, JPEG, PNG, and HEIC.
        </p>
        <p className="text-xs text-slate-400">Maximum file size: 25MB per image</p>

        <button type="button" className="btn-primary mt-6" disabled={disabled}>
          Select Photos
        </button>
      </div>

      {fileRejections.length > 0 && (
        <div className="mt-3 space-y-1">
          {fileRejections.map(({ file, errors }) => (
            <p key={file.name} className="text-sm text-red-600">
              {file.name}: {errors.map((e) => e.message).join(', ')}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
