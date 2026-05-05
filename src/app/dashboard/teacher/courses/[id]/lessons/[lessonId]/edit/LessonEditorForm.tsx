"use client";

import { useState } from "react";
import { updateLesson, deleteLesson } from "@/app/dashboard/teacher/actions";
import { Loader2, Save, Trash2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import TipTapEditor from "@/components/TipTapEditor";

export default function LessonEditorForm({ lesson }: { lesson: any }) {
  const router = useRouter();
  const [title, setTitle] = useState(lesson.title);
  const [content, setContent] = useState(lesson.content || "");
  const [videoUrl, setVideoUrl] = useState(lesson.videoUrl || "");
  const [isFreePreview, setIsFreePreview] = useState(lesson.isFreePreview);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await updateLesson(lesson.id, {
        title,
        content,
        videoUrl,
        isFreePreview,
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Failed to update lesson.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this lesson?")) return;
    setDeleting(true);
    try {
      await deleteLesson(lesson.id);
      router.push(`/dashboard/teacher/courses/${lesson.courseId}/edit`);
    } catch (error: any) {
      alert(error.message || "Failed to delete lesson.");
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-4xl relative">
      {/* Toast Notification */}
      {showSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-green-500/10 border border-green-500/20 text-green-400 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50 backdrop-blur-sm">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium text-sm">Changes saved successfully</span>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Edit Lesson</h1>
          <p className="text-gray-400 text-sm mt-1">Structure your content and add media.</p>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="text-gray-500 hover:text-red-400 p-2 rounded-lg hover:bg-gray-800 transition-colors"
          title="Delete Lesson"
        >
          {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300">Lesson Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300">Video Embed URL (Optional)</label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/embed/..."
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500 transition-colors text-sm"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="isFreePreview"
              checked={isFreePreview}
              onChange={(e) => setIsFreePreview(e.target.checked)}
              className="w-5 h-5 accent-amber-500 bg-gray-800 border-gray-700 rounded cursor-pointer"
            />
            <label htmlFor="isFreePreview" className="text-sm font-medium text-gray-300 cursor-pointer select-none">
              Free Preview (Allow unauthenticated users to view this lesson)
            </label>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <label className="text-sm font-medium text-gray-300 mb-4 block">Lesson Content (Rich Text)</label>
          <TipTapEditor content={content} onChange={setContent} />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-gray-950 font-bold px-6 py-2.5 rounded-lg transition-colors"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Lesson
          </button>
        </div>
      </form>
    </div>
  );
}
