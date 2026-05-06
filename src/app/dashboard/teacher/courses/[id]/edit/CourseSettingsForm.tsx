"use client";

import { useState, useEffect } from "react";
import { updateCourse, requestCoursePublication } from "@/app/dashboard/teacher/actions";
import { Loader2, Save, CheckCircle2, AlertCircle, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import LoadingOverlay from "@/components/LoadingOverlay";
import ImageUpload from "@/components/ImageUpload";

export default function CourseSettingsForm({ course }: { course: any }) {
  const router = useRouter();
  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description);
  const [imageUrl, setImageUrl] = useState(course.imageUrl || "");
  const [price, setPrice] = useState(course.price.toString());
  const [loading, setLoading] = useState(false);
  const [requestingPublish, setRequestingPublish] = useState(false);
  const [reason, setReason] = useState("");
  const [isRequestingChange, setIsRequestingChange] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isPublished = course.status === "PUBLISHED" || course.published;
  const isPending = course.status === "PENDING";
  const isDraft = course.status === "DRAFT" || (!isPublished && !isPending);

  const gracePeriodActive = course.approvedUntil && new Date(course.approvedUntil) > new Date();
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (gracePeriodActive) {
      const updateTimer = () => {
        const diff = new Date(course.approvedUntil).getTime() - new Date().getTime();
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${h}h ${m}m`);
      };
      updateTimer();
      const interval = setInterval(updateTimer, 60000);
      return () => clearInterval(interval);
    }
  }, [gracePeriodActive, course.approvedUntil]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isPublished && !gracePeriodActive) {
      setIsRequestingChange(true);
      return;
    }

    setLoading(true);
    try {
      const res = await updateCourse(course.id, {
        title,
        description,
        imageUrl: imageUrl || null,
        price: parseFloat(price) || 0,
      });
      
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message);
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update course.");
    } finally {
      setLoading(false);
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
      // Re-using the same content request infrastructure
      const { submitContentRequest } = await import("@/app/dashboard/teacher/actions");
      const res = await submitContentRequest(course.id, type, type === "EDIT" ? { title, description, price: parseFloat(price), imageUrl } : null, reason, true);
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
    <div className="max-w-3xl relative">

      <div className="mb-8">
        <h1 className="text-2xl font-bold">Program Configuration</h1>
        <p className="text-gray-400 text-sm mt-1">Manage the primary details and visibility of your parenting program.</p>
      </div>

      <>
      <LoadingOverlay isVisible={loading} message="Syncing Program Settings..." theme="amber" />
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300">Program Title</label>
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

          <ImageUpload 
            value={imageUrl} 
            onChange={setImageUrl} 
            label="Program Thumbnail" 
            bucket="course-assets"
          />

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
            {isPublished && !isRequestingChange && (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded bg-green-500/20 border border-green-500/50 flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                </div>
                <label className="text-sm font-bold text-green-400">
                  Program is LIVE
                </label>
              </div>
            )}
            
            {isPublished && !gracePeriodActive && !isRequestingChange && (
              <button
                type="button"
                onClick={() => setIsRequestingChange(true)}
                className="mt-2 w-full flex items-center justify-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 font-bold py-3 rounded-xl transition-all"
              >
                <AlertCircle className="w-4 h-4" />
                Request Changes to Live Program
              </button>
            )}

            {isRequestingChange && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 space-y-4">
                <div className="flex items-start gap-3">
                  <Send className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-amber-500">Propose Modifications</p>
                    <p className="text-xs text-gray-400">Describe why you're changing the program's primary details.</p>
                  </div>
                </div>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Justification for Admin..."
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-500"
                  rows={3}
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => handleSubmitChangeRequest("EDIT")}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold py-2.5 rounded-lg text-xs transition-colors"
                  >
                    Submit Edit Proposal
                  </button>
                  {showDeleteConfirm ? (
                    <button
                      onClick={() => handleSubmitChangeRequest("DELETE")}
                      disabled={loading || !reason.trim()}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-lg text-xs transition-all active:scale-95 animate-pulse shadow-lg shadow-red-500/20"
                    >
                      Confirm Deletion Request
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={!reason.trim()}
                      className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold py-2.5 rounded-lg text-xs transition-colors disabled:opacity-30"
                    >
                      Request Deletion
                    </button>
                  )}
                  <button
                    onClick={() => { setIsRequestingChange(false); setShowDeleteConfirm(false); }}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-2.5 rounded-lg text-xs transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {isDraft && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-400/80 leading-relaxed">
                    <strong>Draft Status:</strong> This program is currently private. To make it visible to parents, you must first have at least one session approved by the Admin, then submit a publication request.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    setRequestingPublish(true);
                    try {
                      const res = await requestCoursePublication(course.id);
                      if (res.error) toast.error(res.error);
                      else toast.success(res.message);
                    } catch (e) {
                      toast.error("Failed to send request.");
                    } finally {
                      setRequestingPublish(false);
                    }
                  }}
                  disabled={requestingPublish}
                  className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-gray-950 font-bold py-2 rounded-lg text-xs transition-all"
                >
                  {requestingPublish ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Request Program Publication
                </button>
              </div>
            )}
            {isPublished && course._count.enrollments > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-500/80 leading-relaxed">
                  <strong>Program Locked:</strong> You cannot unpublish this program because it has <strong>{course._count.enrollments} active parents</strong>. 
                  To protect parental access to purchased content, unpublishing is restricted for programs with enrollments.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
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
                <span>Save Changes</span>
              </>
            )}
          </button>
          </div>
        </form>
      </>
    </div>
  );
}
