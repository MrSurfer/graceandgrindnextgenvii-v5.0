"use client";

import { useTranslation } from "@/lib/i18n/I18nContext";
import AnimatedSection from "@/components/AnimatedSection";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function TranslatedHero({ session }: { session: any }) {
  const { t } = useTranslation();
  const heroRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const yText = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const opacityText = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <AnimatedSection className="max-w-4xl w-full" ref={heroRef}>
      <motion.div style={{ y: yText, opacity: opacityText }} className="flex flex-col items-center">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-medium mb-8 backdrop-blur-sm">
        <Sparkles className="w-4 h-4" /> {t.hero.badge}
      </div>

      <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter mb-6 leading-[0.9]">
        {t.hero.title1}{" "}
        <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
          {t.hero.title2}
        </span>
      </h1>

      <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
        {t.hero.subtitle}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/courses"
          id="hero-cta-btn"
          className="group px-10 py-5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-lg transition-all duration-300 flex items-center gap-2 shadow-xl shadow-amber-500/25 hover:shadow-amber-500/50 hover:scale-[1.02]"
        >
          {t.hero.ctaPrimary}
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
        {!session && (
          <Link
            href="/register"
            className="px-10 py-5 rounded-2xl border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-semibold text-lg transition-all hover:bg-white/5"
          >
            {t.hero.ctaSecondary}
          </Link>
        )}
      </div>
      </motion.div>
    </AnimatedSection>
  );
}
