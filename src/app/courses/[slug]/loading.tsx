import { Loader2, Heart } from "lucide-react";

export default function CourseLoading() {
  return (
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center gap-4 animate-in fade-in duration-700">
      <div className="relative">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
        <Heart className="w-4 h-4 text-red-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse fill-red-500" />
      </div>
      <div className="text-center">
        <h2 className="text-lg font-bold tracking-tight text-gray-200">Entering Mastery Session</h2>
        <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">Grace & Grind</p>
      </div>
      
      {/* Skeleton structure */}
      <div className="w-full max-w-4xl mt-12 space-y-6 opacity-10 pointer-events-none px-6">
        <div className="h-10 bg-gray-800 rounded-xl w-2/3 animate-pulse"></div>
        <div className="aspect-video bg-gray-800 rounded-3xl w-full animate-pulse"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-800 rounded-lg w-full animate-pulse"></div>
          <div className="h-4 bg-gray-800 rounded-lg w-5/6 animate-pulse"></div>
          <div className="h-4 bg-gray-800 rounded-lg w-4/6 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
