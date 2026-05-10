export default function AdminLoading() {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 animate-in fade-in duration-500">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-gray-800/60 rounded-xl animate-pulse" />
          <div className="h-4 w-48 bg-gray-800/30 rounded-lg animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500/50 animate-pulse" />
          <div className="h-3 w-24 bg-gray-800/30 rounded animate-pulse" />
        </div>
      </div>

      {/* Stats grid skeleton */}
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

      {/* Tab selector skeleton */}
      <div className="mb-10">
        <div className="h-12 w-64 bg-gray-900 border border-gray-800/50 rounded-xl animate-pulse" />
      </div>

      {/* Table skeleton */}
      <div className="bg-gray-900/50 border border-gray-800/40 rounded-2xl overflow-hidden">
        <div className="bg-gray-800/30 px-6 py-4 flex gap-12">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-3 bg-gray-700/40 rounded animate-pulse" style={{ width: `${50 + Math.random() * 50}px` }} />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="px-6 py-5 border-t border-gray-800/30 flex items-center gap-10">
            <div className="flex items-center gap-3 w-48">
              <div className="w-8 h-8 bg-gray-800/40 rounded-full animate-pulse shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3 bg-gray-800/40 rounded animate-pulse" />
                <div className="h-2 w-20 bg-gray-800/20 rounded animate-pulse" />
              </div>
            </div>
            <div className="h-5 w-16 bg-gray-800/30 rounded-full animate-pulse" />
            <div className="h-3 w-20 bg-gray-800/20 rounded animate-pulse" />
            <div className="flex-1" />
            <div className="flex gap-2">
              <div className="h-8 w-20 bg-gray-800/30 rounded-lg animate-pulse" />
              <div className="h-8 w-8 bg-gray-800/20 rounded-lg animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
