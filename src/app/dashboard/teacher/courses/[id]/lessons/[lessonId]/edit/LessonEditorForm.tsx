"use client";

import { useState, useEffect } from "react";
import { updateLesson, deleteLesson, requestLessonPublication, submitContentRequest } from "@/app/dashboard/teacher/actions";
import { Loader2, Save, Trash2, CheckCircle2, Send, Clock, ShieldCheck, AlertCircle, Zap } from "lucide-react";
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
  const [publishing, setPublishing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showRequestSuccess, setShowRequestSuccess] = useState(false);
  const [showPendingWarning, setShowPendingWarning] = useState(false);
  const [reason, setReason] = useState("");
  const [isRequestingChange, setIsRequestingChange] = useState(false);

  const isPublished = lesson.status === "PUBLISHED";
  const isPending = lesson.status === "PENDING";
  const isDraft = lesson.status === "DRAFT";

  const gracePeriodActive = lesson.approvedUntil && new Date(lesson.approvedUntil) > new Date();
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (gracePeriodActive) {
      const updateTimer = () => {
        const diff = new Date(lesson.approvedUntil).getTime() - new Date().getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${hours}h ${mins}m`);
      };
      updateTimer();
      const interval = setInterval(updateTimer, 60000);
      return () => clearInterval(interval);
    }
  }, [gracePeriodActive, lesson.approvedUntil]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isPublished && !gracePeriodActive) {
      setIsRequestingChange(true);
      return;
    }

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

  async function handleRequestPublish() {
    setPublishing(true);
    try {
      await requestLessonPublication(lesson.id);
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Failed to request publication.");
    } finally {
      setPublishing(false);
    }
  }

  async function handleSubmitChangeRequest(type: "EDIT" | "DELETE") {
    if (type === "DELETE" && !confirm("Requesting deletion will remove this content for all students. Are you sure?")) return;
    if (!reason) {
      alert("Please provide a reason for this change.");
      return;
    }

    setLoading(true);
    try {
      await submitContentRequest(lesson.id, type, type === "EDIT" ? { title, content, videoUrl, isFreePreview } : null, reason);
      setShowRequestSuccess(true);
      setTimeout(() => setShowRequestSuccess(false), 3000);
      setIsRequestingChange(false);
      router.refresh();
    } catch (error: any) {
      if (error.message.includes("already have a pending request")) {
        setShowPendingWarning(true);
        setTimeout(() => setShowPendingWarning(false), 4000);
        setIsRequestingChange(false);
      } else {
        alert(error.message || "Failed to submit request.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl relative pb-20">
      {/* Toast Notification */}
      {showSuccess && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-green-500/10 border border-green-500/20 text-green-400 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50 backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium text-sm">Changes saved successfully</span>
        </div>
      )}

      {showRequestSuccess && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-green-500/10 border border-green-500/20 text-green-400 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50 backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium text-sm">Change request submitted successfully</span>
        </div>
      )}

      {showPendingWarning && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50 backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium text-sm">You already have a pending request for this lesson. Please wait for approval.</span>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Edit Lesson</h1>
            <p className="text-gray-400 text-sm mt-1">Structure your content and add media.</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
            isPublished ? "bg-green-500/10 border-green-500/30 text-green-400" :
            isPending ? "bg-amber-500/10 border-amber-500/30 text-amber-400" :
            "bg-gray-800 border-gray-700 text-gray-500"
          }`}>
            {isPublished ? <ShieldCheck className="w-3 h-3" /> : isPending ? <Clock className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
            {lesson.status}
          </div>
          {gracePeriodActive && (
            <div className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-gray-950 flex items-center gap-1 animate-pulse">
              <Zap className="w-3 h-3" />
              EDIT WINDOW ACTIVE ({timeLeft})
            </div>
          )}
        </div>
        {!isPublished && (
          <button
            type="button"
            onClick={() => {
              if (confirm("Are you sure? Deleting drafts is permanent.")) {
                setDeleting(true);
                deleteLesson(lesson.id).then(() => router.push(`/dashboard/teacher/courses/${lesson.courseId}/edit`));
              }
            }}
            disabled={deleting}
            className="text-gray-500 hover:text-red-400 p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
          </button>
        )}
      </div>

      {isRequestingChange && (
        <div className="mb-8 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
          <h3 className="font-bold text-amber-500 mb-2 flex items-center gap-2">
            <Send className="w-4 h-4" /> Request Change for Published Lesson
          </h3>
          <p className="text-sm text-gray-400 mb-4">You are proposing an edit or deletion for live content. Please provide a reason for the administrator.</p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why are you making this change?"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-500 mb-4"
            rows={3}
          />
          <div className="flex gap-3">
            <button
              onClick={() => handleSubmitChangeRequest("EDIT")}
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Submit Edit Request
            </button>
            <button
              onClick={() => handleSubmitChangeRequest("DELETE")}
              disabled={loading}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Request Deletion
            </button>
            <button
              onClick={() => setIsRequestingChange(false)}
              className="text-gray-500 hover:text-gray-300 text-sm px-4"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className={`bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6 ${isPublished ? "opacity-75" : ""}`}>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300">Lesson Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isPublished && !isRequestingChange && !gracePeriodActive}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300">Video Embed URL (Optional)</label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              disabled={isPublished && !isRequestingChange && !gracePeriodActive}
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
              disabled={isPublished && !isRequestingChange && !gracePeriodActive}
              className="w-5 h-5 accent-amber-500 bg-gray-800 border-gray-700 rounded cursor-pointer"
            />
            <label htmlFor="isFreePreview" className="text-sm font-medium text-gray-300 cursor-pointer select-none">
              Free Preview (Allow unauthenticated users to view this lesson)
            </label>
          </div>
        </div>

        <div className={`bg-gray-900 border border-gray-800 rounded-2xl p-6 ${isPublished && !gracePeriodActive ? "opacity-75 pointer-events-none" : ""}`}>
          <label className="text-sm font-medium text-gray-300 mb-4 block">Lesson Content (Rich Text)</label>
          <TipTapEditor content={content} onChange={setContent} />
        </div>

        <div className="flex justify-between items-center bg-gray-950 border border-gray-800 p-4 rounded-2xl">
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            {gracePeriodActive ? `Grace period active. Direct edits allowed for ${timeLeft}.` : isPublished ? "Content is live. Request changes to update." : "Your changes are saved locally until published."}
          </div>
          <div className="flex gap-4">
            {isDraft && (
              <button
                type="button"
                onClick={handleRequestPublish}
                disabled={publishing || loading}
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold px-6 py-2.5 rounded-lg transition-colors border border-gray-700"
              >
                {publishing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                Request Publish
              </button>
            )}
            {!isPublished || gracePeriodActive ? (
              <button
                type="submit"
                disabled={loading || publishing}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-gray-950 font-bold px-8 py-2.5 rounded-lg transition-colors shadow-lg shadow-amber-500/20"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {gracePeriodActive ? "Apply Changes" : "Save Draft"}
              </button>
            ) : null}
            {isPublished && !isRequestingChange && (
              <button
                type="button"
                onClick={() => setIsRequestingChange(true)}
                className="flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 font-bold px-8 py-2.5 rounded-lg transition-colors border border-amber-500/30"
              >
                <AlertCircle className="w-5 h-5" />
                Request Changes
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
