"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number;
  type?: "fade" | "scale" | "slide";
}

export default function AnimatedSection({ children, className, delay = 0, type = "fade" }: Props) {
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
      initial={selected.initial}
      whileInView={selected.whileInView}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
