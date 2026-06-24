export function ImageCardSkeleton() {
  return (
    <div className="card animate-pulse overflow-hidden">
      <div className="aspect-square bg-slate-200" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-3/4 rounded bg-slate-200" />
        <div className="h-3 w-1/2 rounded bg-slate-200" />
        <div className="h-6 w-20 rounded-full bg-slate-200" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <ImageCardSkeleton key={i} />
      ))}
    </div>
  );
}
