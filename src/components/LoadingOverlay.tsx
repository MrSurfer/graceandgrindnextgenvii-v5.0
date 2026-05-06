"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  theme?: "amber" | "blue";
}

export default function LoadingOverlay({ 
  isVisible, 
  message = "Loading Excellence...",
  theme = "amber" 
}: LoadingOverlayProps) {
  const [progress, setProgress] = useState(0);

  const colors = {
    amber: {
      text: "text-amber-500",
      bg: "bg-amber-500",
      glow: "bg-amber-500/30",
      textLight: "text-amber-500/60"
    },
    blue: {
      text: "text-blue-500",
      bg: "bg-blue-500",
      glow: "bg-blue-500/30",
      textLight: "text-blue-500/60"
    }
  };

  const activeTheme = colors[theme];

  useEffect(() => {
    if (!isVisible) {
      setProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 99) return 99;
        const inc = Math.floor(Math.random() * 15) + 5;
        return Math.min(prev + inc, 99);
      });
    }, 150);

    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex flex-col items-center justify-center bg-gray-950/60 backdrop-blur-md z-[9999]"
        >
          <div className="relative">
            <Loader2 className={`w-12 h-12 ${activeTheme.text} animate-spin`} />
            <div className={`absolute inset-0 blur-2xl ${activeTheme.glow} rounded-full animate-pulse`}></div>
          </div>
          
          <div className="mt-8 flex flex-col items-center gap-2">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`${activeTheme.text} font-bold tracking-[0.2em] uppercase text-[10px]`}
            >
              {message}
            </motion.p>
            
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: 120 }}
              className="h-[1px] bg-gray-800 relative overflow-hidden"
            >
              <motion.div 
                className={`absolute inset-0 ${activeTheme.bg}`}
                style={{ width: `${progress}%` }}
              />
            </motion.div>
            
            <span className={`text-[9px] font-mono ${activeTheme.textLight} tabular-nums`}>
              {progress}% Complete
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
