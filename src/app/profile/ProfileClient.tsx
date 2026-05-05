"use client";

import { useState } from "react";
import { Loader2, Trash2, Send } from "lucide-react";
import { applyForTeacher, requestAccountDeletion } from "./actions";

export default function ProfileClient({ 
  role, 
  applicationStatus,
  lastUpdate
}: { 
  role: string, 
  applicationStatus?: string,
  lastUpdate?: Date
}) {
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const diffDays = lastUpdate ? Math.ceil((new Date().getTime() - new Date(lastUpdate).getTime()) / (1000 * 3600 * 24)) : 0;
  const showApplyButton = !applicationStatus || (applicationStatus === "REJECTED" && diffDays >= 7);

  async function handleApply() {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await applyForTeacher();
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess("Application submitted successfully. An admin will review it soon.");
      }
    } catch (e: any) {
      setError(e.message || "Failed to submit application");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to request account deletion? You will be logged out and your account will be disabled pending admin review.")) return;
    setDeleteLoading(true);
    try {
      await requestAccountDeletion();
      window.location.href = "/";
    } catch (e) {
      console.error(e);
      setDeleteLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {role !== "ADMIN" && role !== "TEACHER" && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-2">Become a Teacher</h2>
          <p className="text-gray-400 text-sm mb-6">Want to share your knowledge with the world? Apply to become a teacher on GraceAndGrind.</p>
          
          {success && (
            <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg px-4 py-3 mb-4 text-sm font-medium">
              {success}
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 mb-4 text-sm font-medium">
              {error}
            </div>
          )}

          {!showApplyButton && applicationStatus === "PENDING" && (
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg px-4 py-3 text-sm font-medium">
              Your application is currently pending review.
            </div>
          )}

          {!showApplyButton && applicationStatus === "REJECTED" && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm font-medium">
              <p className="font-bold mb-1">Application not approved at this time.</p>
              <p className="opacity-80">You can re-apply in <span className="font-bold underline">{7 - diffDays} days</span>. Use this time to improve your portfolio!</p>
            </div>
          )}

          {showApplyButton && (
            <button
              onClick={handleApply}
              disabled={loading}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-gray-950 font-bold px-6 py-3 rounded-xl transition-colors"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              {applicationStatus === "REJECTED" ? "Try Re-applying" : "Submit Application"}
            </button>
          )}
        </div>
      )}

      {role === "TEACHER" && (
        <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-2 text-green-400 flex items-center gap-2">
            Teacher Status
          </h2>
          <p className="text-gray-400 text-sm mb-4">
            You are an approved educator on GraceAndGrind. 
            {lastUpdate && (
              <span className="block mt-2 font-medium text-green-500/80">
                Member since {new Date(lastUpdate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            )}
          </p>
          <div className="bg-green-500/10 border border-green-500/20 text-green-400/80 rounded-xl px-4 py-3 text-xs italic">
            You have full access to the teacher dashboard to create courses, lessons, and manage your content.
          </div>
        </div>
      )}

      <div className="bg-red-950/20 border border-red-900/30 rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-2 text-red-400">Danger Zone</h2>
        <p className="text-gray-400 text-sm mb-6">Once you request account deletion, your account will be disabled and queued for deletion by an administrator.</p>
        <button
          onClick={handleDelete}
          disabled={deleteLoading}
          className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 disabled:opacity-50 font-bold px-6 py-3 rounded-xl transition-colors"
        >
          {deleteLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
          Request Account Deletion
        </button>
      </div>
    </div>
  );
}
