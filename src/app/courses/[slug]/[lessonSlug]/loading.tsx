export default function LessonLoading() {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main content area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Breadcrumb skeleton */}
          <div className="flex items-center gap-2">
            <div className="h-3 w-20 bg-gray-800/40 rounded animate-pulse" />
            <div className="h-3 w-3 bg-gray-800/20 rounded animate-pulse" />
            <div className="h-3 w-32 bg-gray-800/40 rounded animate-pulse" />
          </div>

          {/* Title skeleton */}
          <div className="h-8 w-3/4 bg-gray-800/60 rounded-xl animate-pulse" />

          {/* Video player skeleton */}
          <div className="aspect-video bg-gray-900 border border-gray-800/50 rounded-2xl animate-pulse flex items-center justify-center">
            <div className="w-16 h-16 bg-gray-800/40 rounded-full animate-pulse" />
          </div>

          {/* Content skeleton */}
          <div className="space-y-3 pt-4">
            <div className="h-4 w-full bg-gray-800/30 rounded animate-pulse" />
            <div className="h-4 w-11/12 bg-gray-800/25 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-gray-800/20 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-gray-800/15 rounded animate-pulse" />
          </div>

          {/* Action buttons skeleton */}
          <div className="flex gap-3 pt-4">
            <div className="h-10 w-36 bg-gray-800/40 rounded-xl animate-pulse" />
            <div className="h-10 w-28 bg-gray-800/30 rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Sidebar - lesson list skeleton */}
        <div className="space-y-3">
          <div className="h-5 w-28 bg-gray-800/50 rounded animate-pulse mb-4" />
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-900/50 border border-gray-800/30 rounded-xl">
              <div className="w-6 h-6 bg-gray-800/40 rounded-full animate-pulse shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-gray-800/40 rounded animate-pulse" style={{ width: `${50 + Math.random() * 40}%` }} />
                <div className="h-2 w-12 bg-gray-800/20 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
