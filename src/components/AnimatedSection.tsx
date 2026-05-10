"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

import { forwardRef } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number;
  type?: "fade" | "scale" | "slide";
}

const AnimatedSection = forwardRef<HTMLDivElement, Props>(({ children, className, delay = 0, type = "fade" }, ref) => {
  const variants = {
    fade: {
      initial: { opacity: 0, y: 20 },
      whileInView: { opacity: 1, y: 0 },
    },
    scale: {
      initial: { opacity: 0, scale: 0.97 },
      whileInView: { opacity: 1, scale: 1 },
    },
    slide: {
      initial: { opacity: 0, x: -20 },
      whileInView: { opacity: 1, x: 0 },
    }
  };

  const selected = variants[type];

  return (
    <motion.div
      ref={ref}
      initial={selected.initial}
      whileInView={selected.whileInView}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className={className}
    >
      {children}
    </motion.div>
  );
});

AnimatedSection.displayName = "AnimatedSection";
export default AnimatedSection;
