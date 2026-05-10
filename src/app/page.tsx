import { Metadata } from "next";
import { ArrowRight, Heart, Sparkles, Star, Users, BookOpen, Award } from "lucide-react";
import Link from "next/link";
import AnimatedSection from "@/components/AnimatedSection";
import HorizontalScroll from "@/components/HorizontalScroll";
import CountUp from "@/components/CountUp";
import TranslatedHero from "@/components/TranslatedHero";

export const metadata: Metadata = {
  title: {
    default: "GraceAndGrind | Intentional Parenting Excellence",
    template: "%s | GraceAndGrind"
  },
  description: "Transformative courses and community designed to help you raise the next generation with purpose, grace, and grind.",
  keywords: ["Parenting", "Child Development", "Life Balance", "Educational Parenting", "Intentional Living"],
  authors: [{ name: "GraceAndGrind Team" }],
  creator: "GraceAndGrind",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://graceandgrind.com",
    title: "GraceAndGrind | Intentional Parenting Excellence",
    description: "Transformative courses designed to help you raise the next generation with purpose.",
    siteName: "GraceAndGrind",
  },
  twitter: {
    card: "summary_large_image",
    title: "GraceAndGrind | Intentional Parenting Excellence",
    description: "Transformative courses designed to help you raise the next generation with purpose.",
    creator: "@graceandgrind",
  },
};

const testimonials = [
  { quote: "Very informative, well paced, and I like how you take the time to explain why things work the way they work.", author: "Sabrina Goo", role: "Mother of 3" },
  { quote: "The teaching, storytelling, the whole styling and presentation — you've done a fantastic job. It's worth every cent.", author: "Tobi", role: "Father & Educator" },
  { quote: "I just love how the course content flows. The videos are legit interesting. The storytelling is top-notch!", author: "Vikrant Bhat", role: "Parent & Designer" },
  { quote: "Fantastic resource! Really helped to re-contextualize these concepts in a way that made them easy to understand.", author: "Connor Rouillard", role: "New Dad" },
  { quote: "An absolute masterpiece. Explanations are simple but effective, with relevant examples.", author: "Ethan Kircher", role: "Family Coach" },
  { quote: "This changed how I approach my mornings with my kids. Grace before grind — it just clicks.", author: "Amara Okafor", role: "Working Mom" },
  { quote: "My husband and I take the courses together. It's become our weekend ritual. Highly recommend.", author: "Lisa Chen", role: "Parent of Twins" },
];

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/supabase/server-auth";

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
          take: 8
        })
      : Promise.resolve([]),
    prisma.course.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 12,
      include: {
        teacher: { select: { name: true } },
        _count: { select: { lessons: true, enrollments: true } }
      }
    })
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* ═══════ HERO ═══════ */}
      <section className="relative overflow-hidden py-28 md:py-36 px-6 lg:px-12 flex flex-col items-center text-center">
        {/* Mesh gradient background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-amber-500/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-amber-500/3 rounded-full blur-[150px]" />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 -z-5 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-amber-500/20 animate-pulse"
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
                animationDelay: `${i * 0.7}s`,
                animationDuration: `${3 + i * 0.5}s`,
              }}
            />
          ))}
        </div>

        <TranslatedHero session={session} />
      </section>

      {/* ═══════ ENROLLED COURSES — Horizontal Scroll Strip ═══════ */}
      {enrolledCourses.length > 0 && (
        <section className="py-12 px-6 lg:px-12 bg-gray-900/50 border-t border-gray-800">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Heart className="w-6 h-6 text-amber-500" /> Your Growth Journey
            </h2>
            <HorizontalScroll cardWidth={340}>
              {enrolledCourses.map(({ course }) => {
                const totalLessons = course.lessons.length;
                const completedLessons = course.lessons.filter((l: any) => l.progress && l.progress.length > 0).length;
                const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
                
                return (
                  <Link
                    href={`/courses/${course.slug}`}
                    key={course.id}
                    className="flex-none w-[320px] snap-start group bg-gray-950 border border-gray-800 rounded-2xl p-5 hover:border-amber-500/50 transition-all relative overflow-hidden hover:-translate-y-1"
                  >
                    <h3 className="font-bold text-lg mb-2 group-hover:text-amber-400 transition-colors truncate">{course.title}</h3>
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                      <span>{progressPercentage}% Mastered</span>
                      <span>{completedLessons} / {totalLessons} Sessions</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1.5 mb-1 overflow-hidden">
                      <div className="bg-amber-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                    {progressPercentage === 100 && (
                      <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 blur-2xl rounded-full"></div>
                    )}
                  </Link>
                );
              })}
            </HorizontalScroll>
          </div>
        </section>
      )}

      {/* ═══════ ANIMATED STATS ═══════ */}
      <section className="border-y border-gray-800/50 bg-gray-900/30 py-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { end: 50000, prefix: "", suffix: "+", label: "Parents Equipped", icon: Users, color: "text-amber-400" },
            { end: 200, prefix: "", suffix: "+", label: "Hours of Content", icon: BookOpen, color: "text-blue-400" },
            { end: 49, prefix: "4.", suffix: "★", label: "Average Rating", icon: Star, color: "text-yellow-400" },
            { end: 1200, prefix: "", suffix: "+", label: "Certificates Earned", icon: Award, color: "text-emerald-400" },
          ].map(({ end, prefix, suffix, label, icon: Icon, color }) => (
            <AnimatedSection key={label} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-gray-800/50 border border-gray-700/50 flex items-center justify-center mb-1">
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div className={`text-3xl md:text-4xl font-extrabold ${color}`}>
                <CountUp end={end} prefix={prefix} suffix={suffix} />
              </div>
              <p className="text-gray-500 text-sm font-medium">{label}</p>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ═══════ TESTIMONIALS — Horizontal Scroll Carousel ═══════ */}
      <section className="py-24 px-6 lg:px-12 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              You'll be in great company
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Hear from parents who transformed their approach
            </p>
          </AnimatedSection>
          <HorizontalScroll cardWidth={380}>
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="flex-none w-[360px] snap-start p-7 rounded-2xl bg-gray-900/80 border border-gray-800 hover:border-amber-500/30 transition-all flex flex-col justify-between gap-5 backdrop-blur-sm hover:-translate-y-1"
              >
                {/* Stars */}
                <div className="flex gap-1">
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} className="w-4 h-4 text-amber-500 fill-amber-500" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed flex-grow">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-2 border-t border-gray-800">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-500/40 flex items-center justify-center text-amber-500 font-bold text-sm">
                    {t.author.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-amber-400 text-sm">{t.author}</p>
                    <p className="text-gray-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </HorizontalScroll>
        </div>
      </section>

      {/* ═══════ SPIRITUAL FOUNDATION ═══════ */}
      <section className="py-24 px-6 lg:px-12 bg-gradient-to-b from-gray-950 to-gray-900 border-y border-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <AnimatedSection className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-widest">
                Our Foundation
              </div>
              <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                Rooted in <span className="text-amber-500">Wisdom</span> & <span className="text-blue-400">Community</span>.
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                GraceAndGrind isn't just about techniques; it's about the heart. We believe that true growth happens when we support, challenge, and carry one another.
              </p>
            </AnimatedSection>

            <div className="space-y-6">
              <AnimatedSection delay={0.1} className="p-8 rounded-3xl bg-gray-900/50 border border-gray-800 hover:border-amber-500/30 transition-colors group">
                <p className="text-xl md:text-2xl font-medium text-gray-200 mb-4 leading-relaxed group-hover:text-white transition-colors">
                  "As iron sharpens iron, so one person sharpens another."
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-amber-500 font-bold text-sm uppercase tracking-wider">Proverbs 27:17</span>
                  <div className="h-px flex-1 bg-gray-800 mx-4"></div>
                </div>
                <p className="text-gray-500 text-sm mt-4 leading-relaxed">
                  This scripture reminds us that our purpose is to strengthen and uplift one another, to challenge each other, and to grow together in our faith.
                </p>
              </AnimatedSection>

              <AnimatedSection delay={0.2} className="p-8 rounded-3xl bg-gray-900/50 border border-gray-800 hover:border-blue-500/30 transition-colors group">
                <p className="text-xl md:text-2xl font-medium text-gray-200 mb-4 leading-relaxed group-hover:text-white transition-colors">
                  "Carry each other's burdens, and in this way, you will fulfill the law of Christ."
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-blue-400 font-bold text-sm uppercase tracking-wider">Galatians 6:2</span>
                  <div className="h-px flex-1 bg-gray-800 mx-4"></div>
                </div>
                <p className="text-gray-500 text-sm mt-4 leading-relaxed">
                  We are called to support one another and bear each other's burdens in love and unity.
                </p>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ COURSE CATALOG — Horizontal Scroll ═══════ */}
      <section className="py-24 px-6 lg:px-12 bg-gray-900/30 border-y border-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Ready to level up?</h2>
            <p className="text-gray-400 text-lg">
              Master modern parenting with a yearly subscription to{" "}
              <span className="text-amber-400 font-bold">GraceAndGrind Pro</span>.
            </p>
          </AnimatedSection>

          <HorizontalScroll cardWidth={300}>
            {publicCourses.map((course) => (
              <Link
                href={`/courses/${course.slug}`}
                key={course.id}
                className="flex-none w-[280px] snap-start group bg-gray-950 rounded-2xl overflow-hidden border border-gray-800 hover:border-amber-500/40 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-500/10"
              >
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
                        <Heart className="w-6 h-6 text-gray-500 group-hover:text-amber-500 transition-colors" />
                      </div>
                    </div>
                  )}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold bg-gray-900/80 text-amber-500 border border-amber-500/20 backdrop-blur-sm">
                    {course.price === 0 ? "Free" : `$${course.price}`}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-base mb-1 group-hover:text-amber-400 transition-colors line-clamp-1">{course.title}</h3>
                  <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed mb-3">{course.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>{(course as any)._count?.lessons ?? 0} lessons</span>
                    <span className="text-gray-500">{(course as any).teacher?.name || "GraceAndGrind"}</span>
                  </div>
                </div>
              </Link>
            ))}
          </HorizontalScroll>

          <div className="text-center mt-12">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold rounded-xl text-lg transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-[1.02]"
            >
              Explore All Programs <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════ PRICING CTA ═══════ */}
      <section className="py-28 px-6 lg:px-12 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-amber-500/5 rounded-full blur-[100px]" />
        </div>
        
        <div className="max-w-3xl mx-auto text-center">
          <AnimatedSection>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Access everything.</h2>
            <p className="text-gray-400 text-lg mb-2">
              Unlock our entire library of parenting programs for one low yearly price.
            </p>
            <p className="text-6xl font-extrabold text-amber-400 my-10">
              $495<span className="text-2xl text-gray-500 font-normal">/year</span>
            </p>
            <Link
              href={session ? "/courses" : "/register"}
              className="inline-flex items-center gap-2 px-10 py-5 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold rounded-2xl text-xl transition-all shadow-xl shadow-amber-500/25 hover:shadow-amber-500/50 hover:scale-105"
            >
              {session ? "Browse Library" : "I want to be a better parent"} <ArrowRight className="w-6 h-6" />
            </Link>
            <p className="text-gray-600 text-sm mt-6">Cancel anytime. No questions asked.</p>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
