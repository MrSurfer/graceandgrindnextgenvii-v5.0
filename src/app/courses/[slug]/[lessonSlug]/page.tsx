import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MarkCompleteButton from "@/components/MarkCompleteButton";
import LessonComments from "@/components/LessonComments";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string; lessonSlug: string }>;
}

export default async function LessonPage({ params }: Props) {
  const { slug, lessonSlug } = await params;
  const session = await auth();

  const course = await prisma.course.findUnique({
    where: { slug, published: true },
    include: { 
      lessons: { 
        orderBy: { order: "asc" },
        include: {
          comments: {
            include: { user: { select: { id: true, name: true, email: true } } },
            orderBy: { createdAt: "desc" }
          }
        }
      } 
    },
  });

  if (!course) return notFound();

  const lesson = course.lessons.find((l) => l.slug === lessonSlug);
  if (!lesson) return notFound();

  let enrollment = null;
  if (session?.user?.id) {
    enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
    });
  }

  // Check access
  if (!lesson.isFreePreview) {
    if (!session?.user?.id) redirect(`/login?callbackUrl=/courses/${slug}/${lessonSlug}`);
    if (!enrollment) redirect(`/courses/${slug}`);
  }

  let isCompleted = false;
  if (session?.user?.id) {
    const progress = await prisma.lessonProgress.findUnique({
      where: { userId_lessonId: { userId: session.user.id, lessonId: lesson.id } }
    });
    isCompleted = !!progress;
  }

  const currentIndex = course.lessons.findIndex((l) => l.slug === lessonSlug);
  const prevLesson = course.lessons[currentIndex - 1];
  const nextLesson = course.lessons[currentIndex + 1];

  // YouTube Embed Helper
  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    let videoId = "";
    
    if (url.includes("youtube.com/watch?v=")) {
      videoId = url.split("v=")[1].split("&")[0];
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1].split("?")[0];
    } else if (url.includes("youtube.com/embed/")) {
      return url; // Already an embed link
    }
    
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-12 py-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/courses" className="hover:text-white transition-colors">Courses</Link>
        <span>/</span>
        <Link href={`/courses/${slug}`} className="hover:text-white transition-colors">{course.title}</Link>
        <span>/</span>
        <span className="text-gray-300">{lesson.title}</span>
      </div>

      {/* Lesson Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{lesson.title}</h1>
        {session?.user?.id && (
          <MarkCompleteButton 
            lessonId={lesson.id} 
            courseSlug={slug} 
            lessonSlug={lessonSlug} 
            initialCompleted={isCompleted} 
          />
        )}
      </div>

      {/* Video Embed */}
      {lesson.videoUrl && (
        <div className="aspect-video bg-gray-900 rounded-2xl border border-gray-800 mb-10 flex items-center justify-center overflow-hidden">
          <iframe
            src={getEmbedUrl(lesson.videoUrl)}
            className="w-full h-full rounded-2xl"
            allowFullScreen
          />
        </div>
      )}

      {/* Content */}
      {lesson.content && (
        <div
          className="prose prose-invert prose-amber max-w-none"
          dangerouslySetInnerHTML={{ __html: lesson.content }}
        />
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center mt-16 pt-8 border-t border-gray-800">
        {prevLesson ? (
          <Link
            href={`/courses/${slug}/${prevLesson.slug}`}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <div className="text-left">
              <div className="text-xs text-gray-600">Previous</div>
              <div className="font-medium">{prevLesson.title}</div>
            </div>
          </Link>
        ) : <div />}

        {nextLesson ? (
          <Link
            href={`/courses/${slug}/${nextLesson.slug}`}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
          >
            <div className="text-right">
              <div className="text-xs text-gray-600">Next</div>
              <div className="font-medium">{nextLesson.title}</div>
            </div>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        ) : <div />}
      </div>

      {/* Comments Section */}
      {(isCompleted || enrollment || lesson.isFreePreview) && (
        <LessonComments 
          lessonId={lesson.id}
          courseSlug={slug}
          lessonSlug={lessonSlug}
          comments={lesson.comments}
          currentUserId={session?.user?.id}
          isAdminOrTeacher={(session?.user as any)?.role === "ADMIN" || (session?.user as any)?.role === "TEACHER"}
        />
      )}
    </div>
  );
}
