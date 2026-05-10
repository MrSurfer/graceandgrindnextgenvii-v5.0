"use client";

import { useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { markLessonComplete } from "@/app/courses/actions";
import { toast } from "sonner";
import CourseCompletionModal from "./CourseCompletionModal";

export default function MarkCompleteButton({ 
  lessonId, 
  courseSlug, 
  lessonSlug,
  initialCompleted,
  isLastLesson = false,
  courseTitle = "",
}: { 
  lessonId: string, 
  courseSlug: string, 
  lessonSlug: string,
  initialCompleted: boolean,
  isLastLesson?: boolean,
  courseTitle?: string,
}) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [certificateId, setCertificateId] = useState<string | undefined>();

  async function handleComplete() {
    if (completed) return;
    setLoading(true);
    try {
      const res = await markLessonComplete(lessonId, courseSlug, lessonSlug);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message);
        setCompleted(true);
        if (res.courseCompleted && res.certificateId) {
          setCertificateId(res.certificateId);
          setShowModal(true);
        }
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to mark complete");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <CourseCompletionModal
        isOpen={showModal}
        courseTitle={courseTitle}
        certificateId={certificateId}
        onClose={() => setShowModal(false)}
      />

      {completed ? (
        <div className="flex items-center gap-2 text-green-500 font-bold bg-green-500/10 px-4 py-2 rounded-lg border border-green-500/20">
          <CheckCircle className="w-5 h-5" />
          Mastered
        </div>
      ) : (
        <button
          onClick={handleComplete}
          disabled={loading}
          className="flex items-center gap-2 text-gray-950 font-bold bg-amber-500 hover:bg-amber-400 disabled:opacity-50 px-4 py-2 rounded-lg transition-colors"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
          {isLastLesson ? "Complete Course" : "Mark as Mastered"}
        </button>
      )}
    </>
  );
}
