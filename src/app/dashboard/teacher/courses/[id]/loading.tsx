import { Loader2, Sparkles } from "lucide-react";

export default function TeacherCourseLoading() {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-4 animate-in fade-in duration-700">
      <div className="relative">
        <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
        <Sparkles className="w-5 h-5 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
      </div>
      <div className="text-center">
        <h2 className="text-xl font-bold tracking-tight text-gray-200">Preparing Workspace</h2>
        <p className="text-sm text-gray-500 mt-1 italic">Aligning with Parenting Excellence...</p>
      </div>
      
      {/* Subtle background skeleton for a premium feel */}
      <div className="w-full max-w-3xl mt-12 space-y-8 opacity-20 pointer-events-none">
        <div className="h-8 bg-gray-800 rounded-lg w-1/3 animate-pulse"></div>
        <div className="space-y-4">
          <div className="h-32 bg-gray-800 rounded-2xl w-full animate-pulse"></div>
          <div className="h-64 bg-gray-800 rounded-2xl w-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
