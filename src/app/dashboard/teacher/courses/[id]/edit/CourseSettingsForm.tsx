"use client";

import { useState } from "react";
import { updateCourse } from "@/app/dashboard/teacher/actions";
import { Loader2, Save, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CourseSettingsForm({ course }: { course: any }) {
  const router = useRouter();
  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description);
  const [imageUrl, setImageUrl] = useState(course.imageUrl || "");
  const [price, setPrice] = useState(course.price.toString());
  const [published, setPublished] = useState(course.published);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await updateCourse(course.id, {
        title,
        description,
        imageUrl: imageUrl || null,
        price: parseFloat(price) || 0,
        published,
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Failed to update course.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl relative">
      {/* Toast Notification */}
      {showSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-green-500/10 border border-green-500/20 text-green-400 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50 backdrop-blur-sm">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium text-sm">Changes saved successfully</span>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-bold">Course Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Manage the primary details and visibility of your course.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300">Course Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300">Course Thumbnail URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/thumbnail.jpg"
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500 transition-colors"
            />
            <p className="text-[10px] text-gray-500 italic">Recommended aspect ratio: 16:9 (e.g. 1280x720)</p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300">Price (USD)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="0"
              step="0.01"
              required
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="published"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                disabled={course.published && course._count.enrollments > 0}
                className="w-5 h-5 accent-amber-500 bg-gray-800 border-gray-700 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <label htmlFor="published" className={`text-sm font-medium cursor-pointer select-none ${course.published && course._count.enrollments > 0 ? "text-gray-500" : "text-gray-300"}`}>
                Publish Course (Make visible to students)
              </label>
            </div>
            {course.published && course._count.enrollments > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-500/80 leading-relaxed">
                  <strong>Course Locked:</strong> You cannot unpublish this course because it has <strong>{course._count.enrollments} active students</strong>. 
                  To protect student access to purchased content, unpublishing is restricted for courses with enrollments.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-gray-950 font-bold px-6 py-2.5 rounded-lg transition-colors"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
