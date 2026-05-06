"use client";

import { useState, useEffect } from "react";
import { updateLesson, deleteLesson, requestLessonPublication, submitContentRequest } from "@/app/dashboard/teacher/actions";
import { Loader2, Save, Trash2, CheckCircle2, Send, Clock, ShieldCheck, AlertCircle, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import TipTapEditor from "@/components/TipTapEditor";
import { toast } from "sonner";
import LoadingOverlay from "@/components/LoadingOverlay";

export default function LessonEditorForm({ lesson }: { lesson: any }) {
  const router = useRouter();
  const [title, setTitle] = useState(lesson.title);
  const [content, setContent] = useState(lesson.content || "");
  const [videoUrl, setVideoUrl] = useState(lesson.videoUrl || "");
  const [isFreePreview, setIsFreePreview] = useState(lesson.isFreePreview);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [reason, setReason] = useState("");
  const [isRequestingChange, setIsRequestingChange] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
      const res = await updateLesson(lesson.id, {
        title,
        content,
        videoUrl,
        isFreePreview,
      });
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message);
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update lesson.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRequestPublish() {
    setPublishing(true);
    try {
      const res = await requestLessonPublication(lesson.id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message);
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to request publication.");
    } finally {
      setPublishing(false);
    }
  }

  async function handleSubmitChangeRequest(type: "EDIT" | "DELETE") {
    if (type === "DELETE" && !showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    if (!reason) {
      toast.error("Please provide a reason for this change.");
      return;
    }

    setLoading(true);
    try {
      const res = await submitContentRequest(lesson.id, type, type === "EDIT" ? { title, content, videoUrl, isFreePreview } : null, reason);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message);
        setIsRequestingChange(false);
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to submit request.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl relative pb-20">

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
        <button
          type="button"
          onClick={() => setIsRequestingChange(true)}
          className="text-gray-500 hover:text-amber-500 p-2 rounded-lg hover:bg-gray-800 transition-colors"
          title="Request Deletion"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {isRequestingChange && (
        <div className="mb-8 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="font-bold text-amber-500 mb-2 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" /> Moderation Workflow: {isPublished ? 'Edit Live Content' : 'Delete Session'}
          </h3>
          <p className="text-xs text-amber-500/70 mb-4 leading-relaxed">
            {isPublished 
              ? "You are proposing a modification to live content. This requires an administrator's review to ensure curriculum consistency. If approved, you will have a 1-hour grace period to apply your changes."
              : "Deletion requests for curriculum items must be reviewed by an administrator. Please provide a brief justification below."}
          </p>
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
            {showDeleteConfirm ? (
              <button
                onClick={() => handleSubmitChangeRequest("DELETE")}
                disabled={loading || !reason.trim()}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-lg text-sm transition-all active:scale-95 flex items-center gap-2 animate-pulse shadow-lg shadow-red-500/20"
              >
                <AlertCircle className="w-4 h-4" />
                Confirm Deletion Request
              </button>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={loading}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold px-6 py-2.5 rounded-lg text-sm transition-all active:scale-95 disabled:opacity-30 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Request Deletion
              </button>
            )}
            <button
              onClick={() => { setIsRequestingChange(false); setShowDeleteConfirm(false); }}
              className="text-gray-500 hover:text-gray-300 text-sm px-4"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <LoadingOverlay isVisible={loading || publishing || deleting} message={loading ? "Syncing Mastery..." : publishing ? "Publishing Session..." : "Deleting Session..."} theme="amber" />
      <form onSubmit={handleSubmit} className="space-y-8">
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
              Free Preview (Allow unauthenticated parents to view this session)
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
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-gray-950 font-bold px-8 py-2.5 rounded-lg transition-all shadow-lg shadow-amber-500/20 active:scale-95"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Applying Mastery...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>{gracePeriodActive ? "Apply Changes" : "Save Draft"}</span>
                  </>
                )}
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
