export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 animate-in fade-in duration-500">
      {/* Page header skeleton */}
      <div className="flex items-center justify-between mb-10">
        <div className="space-y-3">
          <div className="h-8 w-56 bg-gray-800/60 rounded-xl animate-pulse" />
          <div className="h-4 w-80 bg-gray-800/40 rounded-lg animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-gray-800/40 rounded-xl animate-pulse" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800/60 rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-800/50 rounded-xl animate-pulse" />
            <div className="space-y-2 flex-1">
              <div className="h-6 w-16 bg-gray-800/60 rounded-lg animate-pulse" />
              <div className="h-3 w-24 bg-gray-800/30 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Content area skeleton */}
      <div className="bg-gray-900/50 border border-gray-800/40 rounded-2xl overflow-hidden">
        {/* Table header */}
        <div className="bg-gray-800/30 px-6 py-4 flex gap-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-3 bg-gray-700/40 rounded animate-pulse" style={{ width: `${60 + Math.random() * 60}px` }} />
          ))}
        </div>
        {/* Table rows */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="px-6 py-5 border-t border-gray-800/30 flex items-center gap-8">
            <div className="h-4 w-40 bg-gray-800/40 rounded animate-pulse" />
            <div className="h-4 w-28 bg-gray-800/30 rounded animate-pulse" />
            <div className="h-4 w-20 bg-gray-800/30 rounded animate-pulse" />
            <div className="h-4 w-16 bg-gray-800/20 rounded animate-pulse" />
            <div className="flex-1" />
            <div className="h-8 w-20 bg-gray-800/30 rounded-lg animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
