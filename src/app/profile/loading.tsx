export default function ProfileLoading() {
  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-12 py-16 animate-in fade-in duration-500">
      {/* Profile header skeleton */}
      <div className="flex items-start gap-6 mb-12">
        <div className="w-24 h-24 bg-gray-800/60 rounded-full animate-pulse shrink-0" />
        <div className="flex-1 space-y-3 pt-2">
          <div className="h-7 w-48 bg-gray-800/60 rounded-xl animate-pulse" />
          <div className="h-4 w-64 bg-gray-800/30 rounded-lg animate-pulse" />
          <div className="flex items-center gap-2 pt-1">
            <div className="h-5 w-20 bg-amber-500/20 rounded-full animate-pulse" />
            <div className="h-5 w-24 bg-gray-800/30 rounded-full animate-pulse" />
          </div>
        </div>
        <div className="h-9 w-28 bg-gray-800/40 rounded-xl animate-pulse shrink-0" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-12">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800/50 rounded-2xl p-6 text-center space-y-2">
            <div className="h-8 w-12 bg-gray-800/60 rounded-lg animate-pulse mx-auto" />
            <div className="h-3 w-24 bg-gray-800/30 rounded animate-pulse mx-auto" />
          </div>
        ))}
      </div>

      {/* Enrolled courses skeleton */}
      <div className="space-y-3">
        <div className="h-6 w-40 bg-gray-800/50 rounded-lg animate-pulse mb-6" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800/50 rounded-2xl p-5 flex items-center gap-5">
            <div className="w-14 h-14 bg-gray-800/50 rounded-xl animate-pulse shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-gray-800/60 rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-gray-800/30 rounded animate-pulse" />
              <div className="h-1.5 w-full bg-gray-800/30 rounded-full animate-pulse" />
            </div>
            <div className="h-8 w-24 bg-amber-500/20 rounded-lg animate-pulse shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
