"use client";

import { useState } from "react";
import { Loader2, Trash2, Send } from "lucide-react";
import { applyForTeacher, requestAccountDeletion } from "./actions";

export default function ProfileClient({ 
  role, 
  applicationStatus 
}: { 
  role: string, 
  applicationStatus?: string 
}) {
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [success, setSuccess] = useState("");

  async function handleApply() {
    setLoading(true);
    try {
      await applyForTeacher();
      setSuccess("Application submitted successfully. An admin will review it soon.");
    } catch (e) {
      console.error(e);
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
      {role === "CUSTOMER" && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-2">Become a Teacher</h2>
          <p className="text-gray-400 text-sm mb-6">Want to share your knowledge with the world? Apply to become a teacher on GraceAndGrind.</p>
          
          {success && (
            <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg px-4 py-3 mb-4 text-sm">
              {success}
            </div>
          )}

          {applicationStatus === "PENDING" ? (
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg px-4 py-3 text-sm font-medium">
              Your application is currently pending review.
            </div>
          ) : applicationStatus === "REJECTED" ? (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm font-medium">
              Unfortunately, your application was not approved at this time.
            </div>
          ) : (
            <button
              onClick={handleApply}
              disabled={loading}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-gray-950 font-bold px-6 py-3 rounded-xl transition-colors"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              Submit Application
            </button>
          )}
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
