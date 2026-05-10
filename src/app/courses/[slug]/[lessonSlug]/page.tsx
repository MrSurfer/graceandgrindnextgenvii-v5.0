import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/supabase/server-auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, PlayCircle, Lock, CheckCircle } from "lucide-react";
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
    where: { slug },
  });

  if (!course) return notFound();

  const userRole = (session?.user as any)?.role;
  const isTeacherOrAdmin = ["ADMIN", "SUPER_ADMIN", "ROOT", "OWNER"].includes(userRole) || course.teacherId === session?.user?.id;

  if (!course.published && !isTeacherOrAdmin) return notFound();

  const lessons = await prisma.lesson.findMany({
    where: {
      courseId: course.id,
      ...(isTeacherOrAdmin ? {} : { status: "PUBLISHED" }),
    },
    orderBy: { order: "asc" },
    include: {
      progress: session?.user?.id ? { where: { userId: session.user.id } } : false,
      comments: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  // Attach lessons to course object
  (course as any).lessons = lessons;

  const lesson = (course as any).lessons.find((l: any) => l.slug === lessonSlug);
  if (!lesson) return notFound();

  let enrollment = null;
  if (session?.user?.id) {
    enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
    });
  }

  // Check access (Admins, Super Admins, and Teachers bypass enrollment)
  if (!lesson.isFreePreview && !isTeacherOrAdmin) {
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

  const currentIndex = lessons.findIndex((l) => l.slug === lessonSlug);
  const prevLesson = lessons[currentIndex - 1];
  const nextLesson = lessons[currentIndex + 1];

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
      return `https://www.youtube.com/embed/${videoId}?rel=0`;
    }
    return url;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12 flex flex-col lg:flex-row gap-8">
      
      {/* MAIN CONTENT AREA */}
      <div className="flex-1 min-w-0">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/courses" className="hover:text-white transition-colors">Programs</Link>
          <span>/</span>
          <Link href={`/courses/${slug}`} className="hover:text-white transition-colors truncate max-w-[150px] sm:max-w-xs block">{course.title}</Link>
          <span>/</span>
          <span className="text-gray-300 truncate max-w-[150px] sm:max-w-xs block">{lesson.title}</span>
        </div>

        {/* Lesson Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{lesson.title}</h1>
          {session?.user?.id && (
            <div className="shrink-0">
              <MarkCompleteButton 
                lessonId={lesson.id} 
                courseSlug={slug} 
                lessonSlug={lessonSlug} 
                initialCompleted={isCompleted} 
              />
            </div>
          )}
        </div>

        {/* Video Embed */}
        {lesson.videoUrl && (
          <div className="aspect-video bg-gray-900 rounded-2xl border border-gray-800 mb-10 flex items-center justify-center overflow-hidden shadow-2xl">
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

        {/* Bottom Navigation */}
        <div className="flex justify-between items-center mt-16 pt-8 border-t border-gray-800">
          {prevLesson ? (
            <Link
              href={`/courses/${slug}/${prevLesson.slug}`}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <div className="text-left">
                <div className="text-xs text-gray-600 uppercase tracking-wider font-bold">Previous</div>
                <div className="font-medium hidden sm:block">{prevLesson.title}</div>
              </div>
            </Link>
          ) : <div />}

          {nextLesson ? (
            <Link
              href={`/courses/${slug}/${nextLesson.slug}`}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
            >
              <div className="text-right">
                <div className="text-xs text-gray-600 uppercase tracking-wider font-bold">Next Session</div>
                <div className="font-medium hidden sm:block">{nextLesson.title}</div>
              </div>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : <div />}
        </div>

        {/* Comments Section */}
        <div className="mt-16">
          {(isCompleted || enrollment || lesson.isFreePreview) && (
            <LessonComments 
              lessonId={lesson.id}
              courseSlug={slug}
              lessonSlug={lessonSlug}
              comments={lesson.comments}
              currentUserId={session?.user?.id}
              isAdminOrTeacher={userRole === "ADMIN" || userRole === "TEACHER" || userRole === "SUPER_ADMIN"}
            />
          )}
        </div>
      </div>

      {/* SIDEBAR NAVIGATION */}
      <div className="w-full lg:w-80 shrink-0">
        <div className="sticky top-24 bg-gray-900 border border-gray-800 rounded-2xl flex flex-col max-h-[calc(100vh-8rem)] shadow-xl overflow-hidden">
          <div className="p-5 border-b border-gray-800 bg-gray-900 z-10 shrink-0">
            <h3 className="font-bold text-lg text-white">Course Content</h3>
            <p className="text-xs text-gray-400 mt-1">{lessons.length} sessions in this program</p>
            
            {/* Progress Bar in Sidebar */}
            {enrollment && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Progress</span>
                  <span className="text-amber-500 font-bold">
                    {Math.round((lessons.filter((l: any) => l.progress?.length > 0).length / lessons.length) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1.5">
                  <div 
                    className="bg-amber-500 h-1.5 rounded-full transition-all" 
                    style={{ width: `${(lessons.filter((l: any) => l.progress?.length > 0).length / lessons.length) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="overflow-y-auto custom-scrollbar p-3 flex-grow">
            {lessons.map((l, i) => {
              const isCurrent = l.id === lesson.id;
              const isCompletedLocal = (l as any).progress?.length > 0;
              const accessible = enrollment || l.isFreePreview || isTeacherOrAdmin;

              if (accessible) {
                return (
                  <Link
                    key={l.id}
                    href={`/courses/${slug}/${l.slug}`}
                    className={`flex gap-3 p-3 rounded-xl mb-1 transition-all ${
                      isCurrent ? "bg-amber-500/10 border border-amber-500/30" : "hover:bg-gray-800 border border-transparent"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isCompletedLocal ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <PlayCircle className={`w-5 h-5 ${isCurrent ? "text-amber-500" : "text-gray-500"}`} />
                      )}
                    </div>
                    <div>
                      <p className={`text-sm font-medium leading-tight ${isCurrent ? "text-amber-500" : "text-gray-300"}`}>
                        {i + 1}. {l.title}
                      </p>
                      {l.isFreePreview && !enrollment && !isTeacherOrAdmin && (
                        <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest mt-1 block">
                          Free Preview
                        </span>
                      )}
                    </div>
                  </Link>
                );
              }

              return (
                <div
                  key={l.id}
                  className="flex gap-3 p-3 rounded-xl mb-1 transition-all opacity-50 cursor-not-allowed border border-transparent"
                >
                  <div className="mt-0.5 shrink-0">
                    <Lock className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-tight text-gray-500">
                      {i + 1}. {l.title}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
    </div>
  );
}
