"use client";

import { useState } from "react";
import { addComment, deleteComment } from "@/app/courses/actions";
import { Loader2, Trash2, User } from "lucide-react";
import { toast } from "sonner";

type CommentType = {
  id: string;
  content: string;
  createdAt: Date;
  user: { id: string; name: string | null; email: string };
};

export default function LessonComments({
  lessonId,
  courseSlug,
  lessonSlug,
  comments,
  currentUserId,
  isAdminOrTeacher,
}: {
  lessonId: string;
  courseSlug: string;
  lessonSlug: string;
  comments: CommentType[];
  currentUserId?: string;
  isAdminOrTeacher: boolean;
}) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      const res = await addComment(lessonId, content, courseSlug, lessonSlug);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message);
        setContent("");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to post comment");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(commentId: string) {
    if (!confirm("Delete this comment?")) return;
    setDeletingId(commentId);
    try {
      const res = await deleteComment(commentId, courseSlug, lessonSlug);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete comment");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mt-16 pt-8 border-t border-gray-800">
      <h3 className="text-2xl font-bold mb-6">Discussion</h3>

      {/* New Comment Form */}
      {currentUserId ? (
        <form onSubmit={handleSubmit} className="mb-10">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Ask a question or share your thoughts..."
            className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 text-sm focus:outline-none focus:border-amber-500 transition-colors min-h-[100px] mb-3 resize-y"
            required
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold px-6 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Post Comment
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center mb-10">
          <p className="text-gray-400">Please log in to participate in the discussion.</p>
        </div>
      )}

      {/* Comment List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-gray-500 italic text-sm">No comments yet. Be the first to start the discussion!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4 group">
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex-grow bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-bold text-gray-200">{comment.user.name || "Anonymous"}</span>
                    <span className="text-gray-500 text-xs ml-3">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {(currentUserId === comment.user.id || isAdminOrTeacher) && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      disabled={deletingId === comment.id}
                      className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                    >
                      {deletingId === comment.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
                <p className="text-gray-300 text-sm whitespace-pre-wrap">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
