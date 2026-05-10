"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { ShieldCheck, Loader2, ArrowRight, RefreshCcw, Mail } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!email) {
      router.push("/register");
    }
  }, [email, router]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const supabase = createClient();

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length !== 6) return;

    setLoading(true);
    
    const { error } = await supabase.auth.verifyOtp({
      email: email!,
      token: fullCode,
      type: 'signup'
    });
    
    setLoading(false);

    if (error) {
      toast.error(error.message || "Failed to verify email.");
    } else {
      toast.success("Email verified successfully! You can now log in.");
      router.push("/login?verified=true");
    }
  }

  async function handleResend() {
    setResending(true);
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email!
    });
    
    setResending(false);

    if (error) {
      toast.error(error.message || "Failed to resend code.");
    } else {
      toast.success("A new code has been sent to your email.");
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-3xl p-10 max-w-md w-full shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[60px] -mr-16 -mt-16" />
      
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-amber-500/30">
          <ShieldCheck className="w-8 h-8 text-amber-500" />
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Verify Your Email</h1>
        <p className="text-gray-400 text-sm">
          We sent a 6-digit code to <span className="text-white font-bold">{email}</span>
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-8">
        <div className="flex justify-between gap-3">
          {code.map((digit, idx) => (
            <input
              key={idx}
              id={`otp-${idx}`}
              type="text"
              inputMode="numeric"
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-full h-14 bg-gray-800 border-2 border-gray-700 rounded-xl text-center text-xl font-black text-white focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 transition-all"
              required
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || code.some(d => !d)}
          className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-30 text-gray-950 font-black py-4 rounded-2xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Complete Verification <ArrowRight className="w-5 h-5" /></>}
        </button>
      </form>

      <div className="mt-10 text-center space-y-4">
        <button
          onClick={handleResend}
          disabled={resending}
          className="text-sm font-bold text-gray-500 hover:text-amber-500 transition-colors flex items-center justify-center gap-2 mx-auto uppercase tracking-widest"
        >
          {resending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
          Resend Code
        </button>
        
        <div className="pt-6 border-t border-gray-800/50">
          <Link href="/login" className="text-xs font-bold text-gray-600 hover:text-white transition-colors uppercase tracking-tighter">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
      <Suspense fallback={<Loader2 className="w-10 h-10 animate-spin text-amber-500" />}>
        <VerifyEmailForm />
      </Suspense>
    </div>
  );
}
