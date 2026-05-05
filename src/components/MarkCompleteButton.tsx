"use client";

import { useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { markLessonComplete } from "@/app/courses/actions";

export default function MarkCompleteButton({ 
  lessonId, 
  courseSlug, 
  lessonSlug,
  initialCompleted 
}: { 
  lessonId: string, 
  courseSlug: string, 
  lessonSlug: string,
  initialCompleted: boolean 
}) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [loading, setLoading] = useState(false);

  async function handleComplete() {
    if (completed) return;
    setLoading(true);
    try {
      await markLessonComplete(lessonId, courseSlug, lessonSlug);
      setCompleted(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (completed) {
    return (
      <div className="flex items-center gap-2 text-green-500 font-bold bg-green-500/10 px-4 py-2 rounded-lg border border-green-500/20">
        <CheckCircle className="w-5 h-5" />
        Completed
      </div>
    );
  }

  return (
    <button
      onClick={handleComplete}
      disabled={loading}
      className="flex items-center gap-2 text-gray-950 font-bold bg-amber-500 hover:bg-amber-400 disabled:opacity-50 px-4 py-2 rounded-lg transition-colors"
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
      Mark as Complete
    </button>
  );
}
