import type { UploadStatus } from '../types';

interface StatusBadgeProps {
  status: UploadStatus;
}

const config: Record<
  UploadStatus,
  { label: string; className: string; dot: string }
> = {
  pending: {
    label: 'Pending',
    className: 'bg-slate-100 text-slate-700',
    dot: 'bg-slate-400',
  },
  uploading: {
    label: 'Uploading',
    className: 'bg-blue-100 text-blue-700',
    dot: 'bg-blue-500 animate-pulse',
  },
  processing: {
    label: 'Processing',
    className: 'bg-amber-100 text-amber-700',
    dot: 'bg-amber-500 animate-pulse',
  },
  accepted: {
    label: 'Accepted',
    className: 'bg-green-100 text-green-700',
    dot: 'bg-green-500',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-100 text-red-700',
    dot: 'bg-red-500',
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, className, dot } = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
