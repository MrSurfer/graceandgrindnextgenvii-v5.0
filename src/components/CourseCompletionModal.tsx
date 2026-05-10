"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import Link from "next/link";
import { Trophy, ArrowRight, X, Sparkles } from "lucide-react";

interface Props {
  isOpen: boolean;
  courseTitle: string;
  certificateId?: string;
  onClose: () => void;
}

function fireConfetti() {
  const count = 300;
  const defaults = { origin: { y: 0.7 }, zIndex: 9999 };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) });
  }

  fire(0.25, { spread: 26, startVelocity: 55, colors: ["#f59e0b", "#fbbf24", "#fcd34d"] });
  fire(0.2,  { spread: 60, colors: ["#ffffff", "#f59e0b"] });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: ["#f59e0b", "#fbbf24", "#10b981"] });
  fire(0.1,  { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2, colors: ["#ffffff"] });
  fire(0.1,  { spread: 120, startVelocity: 45, colors: ["#f59e0b", "#6366f1"] });

  // Side cannons
  setTimeout(() => {
    confetti({ ...defaults, angle: 60,  spread: 55, origin: { x: 0 }, zIndex: 9999, colors: ["#f59e0b", "#fbbf24"] });
    confetti({ ...defaults, angle: 120, spread: 55, origin: { x: 1 }, zIndex: 9999, colors: ["#f59e0b", "#fbbf24"] });
  }, 300);
}

export default function CourseCompletionModal({ isOpen, courseTitle, certificateId, onClose }: Props) {
  useEffect(() => {
    if (isOpen) {
      fireConfetti();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative bg-gray-950 border border-amber-500/30 rounded-3xl p-8 md:p-12 max-w-lg w-full text-center shadow-[0_0_80px_rgba(245,158,11,0.15)] z-10"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Glow Ring */}
            <div className="relative inline-flex items-center justify-center w-28 h-28 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-pulse" />
              <div className="absolute inset-2 rounded-full bg-amber-500/10" />
              <Trophy className="w-14 h-14 text-amber-500 relative z-10" />
            </div>

            {/* Emoji & Header */}
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-3">
              You Did It!
            </h2>
            <p className="text-gray-400 mb-2 text-sm uppercase tracking-widest font-bold">
              Course Mastered
            </p>
            <p className="text-xl font-bold text-amber-400 mb-8 leading-tight">
              {courseTitle}
            </p>

            <div className="flex items-center gap-2 justify-center mb-6 text-emerald-400">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Your certificate has been generated</span>
              <Sparkles className="w-4 h-4" />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {certificateId && (
                <Link
                  href={`/certificates/${certificateId}`}
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-gray-950 font-black px-6 py-3 rounded-xl transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105 active:scale-95"
                >
                  <Trophy className="w-5 h-5" />
                  View Certificate
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
              <Link
                href="/profile"
                onClick={onClose}
                className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-bold px-6 py-3 rounded-xl transition-colors border border-gray-700"
              >
                Go to Profile
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
