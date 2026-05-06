"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, FileText, Plus, Settings } from "lucide-react";
import { useState } from "react";
import { createLesson } from "@/app/dashboard/teacher/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function CourseSidebar({ courseId, lessons }: { courseId: string; lessons: any[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  async function handleAddLesson() {
    setIsCreating(true);
    try {
      const title = `New Lesson ${lessons.length + 1}`;
      const res = await createLesson(courseId, title);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message);
        router.push(`/dashboard/teacher/courses/${courseId}/lessons/${res.lessonId}/edit`);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create lesson");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="w-64 border-r border-gray-800 bg-gray-900/50 min-h-[calc(100vh-64px)] flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-xs font-bold tracking-widest text-gray-500 uppercase">Workspace</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-3 mb-2">
          <Link
            href={`/dashboard/teacher/courses/${courseId}/edit`}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === `/dashboard/teacher/courses/${courseId}/edit`
                ? "bg-amber-500/10 text-amber-500"
                : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
            }`}
          >
            <Settings className="w-4 h-4" /> Course Settings
          </Link>
        </div>

        <div className="px-4 mt-6 mb-2 flex items-center justify-between">
          <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase">Curriculum</h3>
          <button 
            onClick={handleAddLesson}
            disabled={isCreating}
            className="text-gray-400 hover:text-amber-500 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="px-3 space-y-1">
          {lessons.length === 0 ? (
            <p className="text-xs text-gray-600 px-3 py-2 italic">No lessons yet.</p>
          ) : (
            lessons.map((lesson, idx) => {
              const isActive = pathname.includes(`/lessons/${lesson.id}`);
              return (
                <Link
                  key={lesson.id}
                  href={`/dashboard/teacher/courses/${courseId}/lessons/${lesson.id}/edit`}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-500/10 text-blue-400"
                      : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                  }`}
                >
                  <FileText className="w-4 h-4 flex-shrink-0" /> 
                  <span className="truncate">{idx + 1}. {lesson.title}</span>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
