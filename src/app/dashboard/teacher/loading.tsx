export default function TeacherLoading() {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 animate-in fade-in duration-500">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-10">
        <div className="space-y-2">
          <div className="h-8 w-52 bg-gray-800/60 rounded-xl animate-pulse" />
          <div className="h-4 w-64 bg-gray-800/30 rounded-lg animate-pulse" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-28 bg-gray-800/40 rounded-lg animate-pulse" />
          <div className="h-10 w-36 bg-amber-500/20 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800/60 rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-800/50 rounded-xl animate-pulse" />
            <div className="space-y-2 flex-1">
              <div className="h-7 w-14 bg-gray-800/60 rounded-lg animate-pulse" />
              <div className="h-3 w-24 bg-gray-800/30 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Tabs skeleton */}
      <div className="flex gap-2 mb-8 border-b border-gray-800/50 pb-0">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-10 bg-gray-800/30 rounded-t-lg animate-pulse" style={{ width: `${80 + i * 20}px` }} />
        ))}
      </div>

      {/* Course cards skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800/60 rounded-2xl p-6 flex items-center gap-6">
            <div className="w-20 h-20 bg-gray-800/50 rounded-xl animate-pulse shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-5 w-3/4 bg-gray-800/60 rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-gray-800/30 rounded animate-pulse" />
              <div className="flex gap-4">
                <div className="h-3 w-20 bg-gray-800/20 rounded animate-pulse" />
                <div className="h-3 w-16 bg-gray-800/20 rounded animate-pulse" />
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <div className="h-8 w-20 bg-amber-500/20 rounded-lg animate-pulse" />
              <div className="h-8 w-8 bg-gray-800/30 rounded-lg animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
