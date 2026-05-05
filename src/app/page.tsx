import { ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import AnimatedSection from "@/components/AnimatedSection";

const testimonials = [
  { quote: "Very informative, well paced, and I like how you take the time to explain why things work the way they work.", author: "Sabrina Goo" },
  { quote: "The teaching, storytelling, the whole styling and presentation — you've done a fantastic job. It's worth every cent.", author: "Tobi" },
  { quote: "I just love how the course content flows. The videos are legit interesting. The storytelling is top-notch!", author: "Vikrant Bhat" },
  { quote: "Fantastic resource! Really helped to re-contextualize these concepts in a way that made them easy to understand.", author: "Connor Rouillard" },
  { quote: "An absolute masterpiece. Explanations are simple but effective, with relevant examples.", author: "Ethan Kircher" },
];



import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();
  
  const [enrolledCourses, publicCourses] = await Promise.all([
    session?.user?.id 
      ? prisma.enrollment.findMany({
          where: { userId: session.user.id },
          include: {
            course: {
              include: {
                lessons: { 
                  include: { 
                    progress: { where: { userId: session.user.id } } 
                  } 
                },
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 4
        })
      : Promise.resolve([]),
    prisma.course.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 8
    })
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-6 lg:px-12 flex flex-col items-center text-center" style={{ background: "radial-gradient(circle at 50% -10%, rgba(245,158,11,0.12), transparent 60%)" }}>
        <AnimatedSection className="max-w-4xl w-full">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-medium mb-8">
            <Zap className="w-4 h-4" /> New Parenting Course is live!
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 leading-tight">
            Equipping the{" "}
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Next Generation Parents.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto font-mono leading-relaxed">
            GraceAndGrind courses make life long learning{" "}
            <span className="text-amber-400">fun</span>{" "}
            <span className="text-gray-600">&&</span>{" "}
            <span className="text-amber-400">approachable</span>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/courses"
              id="hero-cta-btn"
              className="group px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-lg transition-all duration-200 flex items-center gap-2 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40"
            >
              Shut up and take my money
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            {!session && (
              <Link
                href="/register"
                className="px-8 py-4 rounded-xl border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-semibold text-lg transition-colors"
              >
                Start for free
              </Link>
            )}
          </div>
        </AnimatedSection>

        {/* Floating code decoration */}
        <div className="absolute -bottom-4 right-8 opacity-10 text-amber-400 font-mono text-xs hidden lg:block select-none">
          {`const learn = () => { return 'awesome' }`}
        </div>
      </section>

      {/* Enrolled Courses Section */}
      {enrolledCourses.length > 0 && (
        <section className="py-12 px-6 lg:px-12 bg-gray-900/50 border-t border-gray-800">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Zap className="w-6 h-6 text-amber-500" /> Continue Learning
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {enrolledCourses.map(({ course }) => {
                const totalLessons = course.lessons.length;
                const completedLessons = course.lessons.filter((l: any) => l.progress && l.progress.length > 0).length;
                const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
                
                return (
                  <Link href={`/courses/${course.slug}`} key={course.id} className="block group bg-gray-950 border border-gray-800 rounded-xl p-5 hover:border-amber-500/50 transition-colors relative overflow-hidden">
                    <h3 className="font-bold text-lg mb-2 group-hover:text-amber-400 transition-colors truncate">{course.title}</h3>
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                      <span>{progressPercentage}% Complete</span>
                      <span>{completedLessons} / {totalLessons}</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1.5 mb-1 overflow-hidden">
                      <div className="bg-amber-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                    {progressPercentage === 100 && (
                      <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 blur-xl rounded-full"></div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Social Proof Counter */}
      <section className="border-y border-gray-800/50 bg-gray-900/30 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-8 md:gap-16 text-center">
          {[
            { value: "50,000+", label: "Parents Equipped" },
            { value: "200+", label: "Hours of content" },
            { value: "4.9★", label: "Average rating" },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl font-extrabold text-amber-400">{value}</p>
              <p className="text-gray-500 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            You'll be in great company
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <AnimatedSection
                key={i}
                delay={i * 0.08}
                className="p-6 rounded-2xl bg-gray-950 border border-gray-800 hover:border-gray-700 transition-colors flex flex-col justify-between gap-4"
              >
                <p className="text-gray-300 text-sm leading-relaxed font-mono">"{t.quote}"</p>
                <p className="font-bold text-amber-400 text-sm">— {t.author}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Course Grid */}
      <section className="py-24 px-6 lg:px-12 bg-gray-900/30 border-y border-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Ready to level up?</h2>
            <p className="text-gray-400 text-lg">
              Master modern parenting with a yearly subscription to{" "}
              <span className="text-amber-400 font-bold">GraceAndGrind Pro</span>.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {publicCourses.map((course, i) => (
              <AnimatedSection
                key={course.id}
                delay={i * 0.05}
                type="scale"
                className="group bg-gray-950 rounded-2xl overflow-hidden border border-gray-800 hover:border-amber-500/40 transition-all hover:-translate-y-1 cursor-pointer"
              >
                <Link href={`/courses/${course.slug}`}>
                  <div className="aspect-video bg-gray-900 flex items-center justify-center relative overflow-hidden">
                    {course.imageUrl ? (
                      <img 
                        src={course.imageUrl} 
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-gray-700 group-hover:bg-amber-500/20 transition-colors flex items-center justify-center">
                          <Zap className="w-6 h-6 text-gray-500 group-hover:text-amber-500 transition-colors" />
                        </div>
                      </div>
                    )}
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-widest font-bold bg-gray-900/80 text-amber-500 border border-amber-500/20 backdrop-blur-sm">
                      {course.price === 0 ? "Free" : `$${course.price}`}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-base mb-1 group-hover:text-amber-400 transition-colors line-clamp-1">{course.title}</h3>
                    <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">{course.description}</p>
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold rounded-xl text-lg transition-colors shadow-lg shadow-amber-500/20"
            >
              View All Courses <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="py-24 px-6 lg:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Access everything.</h2>
          <p className="text-gray-400 text-lg mb-2">
            Unlock our entire course library for one low yearly price.
          </p>
          <p className="text-5xl font-extrabold text-amber-400 my-8">
            $495<span className="text-2xl text-gray-500 font-normal">/year</span>
          </p>
          <Link
            href={session ? "/courses" : "/register"}
            className="inline-flex items-center gap-2 px-10 py-5 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold rounded-xl text-xl transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105"
          >
            {session ? "Browse Library" : "I want to be a better parent"} <ArrowRight className="w-6 h-6" />
          </Link>
          <p className="text-gray-600 text-sm mt-6">Cancel anytime. No questions asked.</p>
        </div>
      </section>
    </div>
  );
}
