"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";

/**
 * Handles inactivity timeouts based on user roles.
 * - Leadership Roles (Teacher, Admin, SuperAdmin): 4 hours (2 minutes for testing)
 * - Students: Infinite (unless manually logged out)
 */
export default function InactivityHandler() {
  const { data: session } = useSession();
  const router = useRouter();
  const [countdown, setCountdown] = useState<number | null>(null);
  
  // CONFIGURATION
  const TEST_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes for testing
  const COUNTDOWN_START_S = 60; // 60 second countdown
  
  const role = (session?.user as any)?.role;
  const isLeadership = role === "TEACHER" || role === "ADMIN" || role === "SUPER_ADMIN";

  const handleLogout = useCallback(async () => {
    setCountdown(null);
    toast.error("Session Expired", {
      description: "You have been logged out due to inactivity.",
      duration: 5000,
    });
    await signOut({ callbackUrl: "/login?expired=true" });
  }, []);

  useEffect(() => {
    if (!session || !isLeadership) return;

    let timeoutId: NodeJS.Timeout;
    let countdownInterval: NodeJS.Timeout;

    const resetTimer = () => {
      // Clear existing timers
      clearTimeout(timeoutId);
      clearInterval(countdownInterval);
      setCountdown(null);

      // Set main inactivity timeout
      // We start the countdown COUNTDOWN_START_S seconds before the actual timeout
      const timeToCountdown = TEST_TIMEOUT_MS - (COUNTDOWN_START_S * 1000);
      
      timeoutId = setTimeout(() => {
        setCountdown(COUNTDOWN_START_S);
        
        countdownInterval = setInterval(() => {
          setCountdown((prev) => {
            if (prev !== null && prev <= 1) {
              clearInterval(countdownInterval);
              handleLogout();
              return 0;
            }
            return prev !== null ? prev - 1 : null;
          });
        }, 1000);
      }, timeToCountdown);
    };

    // Events to track activity
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    // Initialize timer
    resetTimer();

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      clearTimeout(timeoutId);
      clearInterval(countdownInterval);
    };
  }, [session, isLeadership, handleLogout]);

  if (countdown !== null && countdown > 0) {
    return (
      <div className="fixed bottom-6 right-6 z-[9999] animate-in slide-in-from-right-10">
        <div className="bg-gray-900 border-2 border-amber-500/50 p-6 rounded-2xl shadow-2xl max-w-sm flex items-start gap-4 backdrop-blur-md">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6 text-amber-500 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Inactivity Warning</h3>
            <p className="text-gray-400 text-sm mb-4 leading-relaxed">
              Your session will expire in <span className="text-amber-500 font-black tabular-nums">{countdown}s</span> due to security policies.
            </p>
            <button 
              onClick={() => window.dispatchEvent(new Event("mousedown"))}
              className="w-full bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold py-2 rounded-xl text-xs transition-all uppercase tracking-widest"
            >
              I'm still here
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
