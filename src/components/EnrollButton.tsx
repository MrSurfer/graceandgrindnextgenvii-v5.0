"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { enrollInFreeCourse } from "@/app/courses/actions";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { usePlatformSound } from "@/lib/SoundContext";
import { useCurrency } from "@/lib/CurrencyContext";

interface EnrollButtonProps {
  courseId: string;
  courseSlug: string;
  price: number;
  isLoggedIn: boolean;
  isCourseTeacher?: boolean;
}

export default function EnrollButton({
  courseId,
  courseSlug,
  price,
  isLoggedIn,
  isCourseTeacher,
}: EnrollButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { playSound } = usePlatformSound();
  const { formatPrice } = useCurrency();

  const handleEnroll = async () => {
    playSound("click");
    if (isCourseTeacher) {
      router.push(`/dashboard/teacher/courses/${courseId}/edit`);
      return;
    }

    if (!isLoggedIn) {
      router.push(`/login?callbackUrl=/courses/${courseSlug}`);
      return;
    }

    if (price > 0) {
      // Paid course - redirect to checkout API
      setLoading(true);
      window.location.href = `/api/checkout/${courseId}`;
      return;
    }

    // Free course - use server action for immediate feedback
    setLoading(true);
    try {
      const res = await enrollInFreeCourse(courseId, courseSlug);
      if (res.error) {
        playSound("error");
        toast.error(res.error);
      } else {
        playSound("success");
        toast.success(res.message);
        // Force a refresh to update the UI
        router.refresh();
      }
    } catch (e: any) {
      playSound("error");
      toast.error(e.message || "Failed to enroll");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleEnroll}
      disabled={loading}
      className="px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-70 text-gray-950 font-bold rounded-lg transition-all whitespace-nowrap flex items-center justify-center gap-2 min-w-[140px]"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          <Sparkles className="w-4 h-4" />
          {!isLoggedIn
            ? "Login to Enroll"
            : isCourseTeacher
            ? "Course Settings"
            : price === 0
            ? "Enroll Free"
            : `Enroll for ${formatPrice(price)}`}
        </>
      )}
    </motion.button>
  );
}
