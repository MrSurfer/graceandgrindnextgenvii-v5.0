"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Heart, Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff, ShieldCheck, CheckCircle, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  let callbackUrl = searchParams.get("callbackUrl") || searchParams.get("trigger") || "/courses";
  if (callbackUrl.includes("/login") || callbackUrl.includes("/register") || callbackUrl.includes("/verify-email")) {
    callbackUrl = "/courses";
  }
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isPasswordStrong = password.length >= 8;
  const canSubmit = name && email && isPasswordStrong && passwordsMatch && !loading;

  // Note: we intentionally don't auto-redirect if already authenticated here.
  // The register page should always be accessible so users can share it.
  // After successful registration, the redirect happens in handleSubmit.

  const [isSuccess, setIsSuccess] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
      },
    });

    setLoading(false);

    if (authError) {
      setError(authError.message || "Something went wrong.");
    } else {
      setIsSuccess(true);
      // Wait for the animation/onboarding message to show for 3 seconds
      setTimeout(() => {
        // If email confirmation is required, Supabase returns user but no session.
        if (!data.session) {
          router.push(`/verify-email?email=${encodeURIComponent(email)}&callbackUrl=${encodeURIComponent(callbackUrl)}`);
        } else {
          router.push(callbackUrl);
        }
      }, 3000);
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center p-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#f59e0b10,transparent_70%)]" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-center space-y-8 max-w-md w-full"
        >
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-amber-500/20 rounded-full flex items-center justify-center border border-amber-500/30">
              <CheckCircle className="w-12 h-12 text-amber-500" />
            </div>
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -inset-4 bg-amber-500/20 blur-2xl rounded-full -z-10" 
            />
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-white tracking-tight">Welcome Aboard!</h1>
            <p className="text-gray-400 text-lg leading-relaxed">
              Your journey to excellence begins now. We're preparing your mastery hub...
            </p>
          </div>

          <div className="pt-8">
            <div className="w-full bg-gray-900/50 h-1.5 rounded-full overflow-hidden border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 3, ease: "easeInOut" }}
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500" 
              />
            </div>
            <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold animate-pulse">
              Redirecting to Excellence
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center">
              <Heart className="text-gray-950 w-6 h-6" />
            </div>
            <span className="font-bold text-2xl tracking-tight">GraceAndGrind</span>
          </Link>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <h1 className="text-2xl font-bold mb-2">Create your account</h1>
          <p className="text-gray-400 mb-8 text-sm">Start learning today — it's free to join.</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-300">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Your Name"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-300">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => setCapsLock(e.getModifierState("CapsLock"))}
                  onKeyUp={(e) => setCapsLock(e.getModifierState("CapsLock"))}
                  required
                  placeholder="Create a strong password"
                  className={`w-full bg-gray-800 border ${password && !isPasswordStrong ? 'border-red-500/50' : 'border-gray-700'} rounded-xl pl-10 pr-12 py-3.5 text-sm focus:outline-none focus:border-amber-500 transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex gap-1 h-1 mt-1">
                <div className={`flex-1 rounded-full transition-all duration-500 ${password.length > 0 ? (isPasswordStrong ? 'bg-green-500' : 'bg-red-500') : 'bg-gray-800'}`} />
                <div className={`flex-1 rounded-full transition-all duration-500 ${isPasswordStrong && /[A-Z]/.test(password) ? 'bg-green-500' : 'bg-gray-800'}`} />
                <div className={`flex-1 rounded-full transition-all duration-500 ${isPasswordStrong && /[0-9]/.test(password) ? 'bg-green-500' : 'bg-gray-800'}`} />
              </div>
              <div className="flex justify-between items-center px-1">
                <p className="text-[9px] text-gray-500 uppercase font-bold tracking-tighter">Strength</p>
                <p className="text-[9px] text-gray-500 uppercase font-bold tracking-tighter">
                  {password.length === 0 ? "Empty" : !isPasswordStrong ? "Weak" : (/[A-Z]/.test(password) && /[0-9]/.test(password)) ? "Strong" : "Fair"}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Confirm Password</label>
              <div className="relative">
                <ShieldCheck className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${passwordsMatch ? 'text-green-500' : 'text-gray-500'}`} />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={(e) => setCapsLock(e.getModifierState("CapsLock"))}
                  onKeyUp={(e) => setCapsLock(e.getModifierState("CapsLock"))}
                  required
                  placeholder="Repeat your password"
                  className={`w-full bg-gray-800 border ${confirmPassword && !passwordsMatch ? 'border-red-500/50' : 'border-gray-700'} rounded-xl pl-10 pr-12 py-3.5 text-sm focus:outline-none focus:border-amber-500 transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="text-[10px] text-red-400 font-medium">Passwords do not match</p>
              )}
            </div>

            {capsLock && (
              <p className="text-[10px] text-red-400 font-bold -mt-2 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> CAPS LOCK IS ON
              </p>
            )}

            <button
              id="register-btn"
              type="submit"
              disabled={!canSubmit}
              className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-30 disabled:grayscale text-gray-950 font-bold py-4 rounded-2xl transition-all shadow-lg shadow-amber-500/20 mt-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Create Mastery Account <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

          <div className="mt-8 mb-6 flex items-center">
            <div className="flex-grow border-t border-gray-800"></div>
            <span className="px-4 text-sm text-gray-500">Or continue with</span>
            <div className="flex-grow border-t border-gray-800"></div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback?next=${callbackUrl}` } })}
              className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 rounded-lg border border-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button
              onClick={() => supabase.auth.signInWithOAuth({ provider: 'apple', options: { redirectTo: `${window.location.origin}/auth/callback?next=${callbackUrl}` } })}
              className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 rounded-lg border border-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.24 11.51c0-2.31 1.88-3.41 1.97-3.46-1.07-1.57-2.73-1.79-3.34-1.81-1.42-.14-2.76.84-3.48.84-.71 0-1.82-.82-2.99-.8-1.52.02-2.93.88-3.72 2.25-1.59 2.76-.41 6.85 1.14 9.1.76 1.1 1.66 2.33 2.84 2.29 1.14-.04 1.57-.73 2.95-.73 1.38 0 1.77.73 2.97.71 1.22-.02 2.01-1.12 2.76-2.23.86-1.26 1.22-2.48 1.24-2.54-.03-.01-2.36-.91-2.34-3.62zM14.54 4.88c.63-.76 1.05-1.82.93-2.88-.91.04-2.02.61-2.67 1.37-.58.68-1.09 1.76-.94 2.8.99.08 2.05-.53 2.68-1.29z"/>
              </svg>
              Apple
            </button>
          </div>

          <p className="text-center text-gray-500 text-sm mt-8">
            Already have an account?{" "}
            <Link href="/login" className="text-amber-500 hover:text-amber-400 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>}>
      <RegisterForm />
    </Suspense>
  );
}
