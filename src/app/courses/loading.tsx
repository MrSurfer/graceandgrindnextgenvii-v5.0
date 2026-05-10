export default function CoursesLoading() {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 animate-in fade-in duration-500">
      {/* Hero skeleton */}
      <div className="text-center mb-14 space-y-4">
        <div className="h-10 w-72 bg-gray-800/50 rounded-xl animate-pulse mx-auto" />
        <div className="h-5 w-96 bg-gray-800/30 rounded-lg animate-pulse mx-auto" />
        <div className="flex items-center justify-center gap-3 pt-2">
          <div className="h-10 w-48 bg-gray-800/40 rounded-xl animate-pulse" />
          <div className="h-10 w-32 bg-amber-500/20 rounded-xl animate-pulse" />
        </div>
      </div>

      {/* Course grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800/60 rounded-3xl overflow-hidden">
            {/* Course image */}
            <div className="aspect-video bg-gray-800/50 animate-pulse" />
            {/* Course info */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-5 w-16 bg-amber-500/20 rounded-full animate-pulse" />
                <div className="h-5 w-20 bg-gray-800/40 rounded-full animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-5 w-full bg-gray-800/60 rounded animate-pulse" />
                <div className="h-5 w-4/5 bg-gray-800/40 rounded animate-pulse" />
              </div>
              <div className="h-3 w-2/3 bg-gray-800/30 rounded animate-pulse" />
              <div className="flex items-center justify-between pt-2">
                <div className="h-6 w-16 bg-gray-800/40 rounded animate-pulse" />
                <div className="h-9 w-28 bg-amber-500/20 rounded-xl animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
