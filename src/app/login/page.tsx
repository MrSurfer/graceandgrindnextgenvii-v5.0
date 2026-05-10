"use client";

import { useState, Suspense, useEffect } from "react";
import { useSession } from "@/components/providers/SupabaseProvider";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Heart, Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, ShieldCheck, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/courses";
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: session, status } = useSession();
  const userRole = (session?.user as any)?.role;

  useEffect(() => {
    if (status === "authenticated") {
      const explicitCallback = searchParams.get("callbackUrl");
      const isAuthPage = explicitCallback?.includes("/login") || explicitCallback?.includes("/register") || explicitCallback?.includes("/verify-email");
      
      if (explicitCallback && !isAuthPage) {
        router.push(explicitCallback);
        return;
      }

      if (userRole === "OWNER") {
        router.push("/owner");
      } else if (userRole === "ADMIN" || userRole === "SUPER_ADMIN" || userRole === "ROOT") {
        router.push("/admin");
      } else if (userRole === "TEACHER") {
        router.push("/dashboard/teacher");
      } else {
        router.push("/courses");
      }
    }
  }, [status, userRole, router, searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message || "Invalid email or password.");
      setLoading(false);
    } else {
      router.refresh();
      const { getCurrentSession } = await import("@/app/actions/auth");
      const serverSession = await getCurrentSession();
      const permissions = serverSession?.user?.permissions || [];
      const { hasPermission } = await import("@/lib/permissions");
      
      const cb = searchParams.get("callbackUrl");
      const isAuthPage = cb?.includes("/login") || cb?.includes("/register") || cb?.includes("/verify-email");
      
      if (cb && !isAuthPage) {
        window.location.assign(cb);
      } else if (hasPermission(permissions, "owner:dashboard")) {
        window.location.assign("/owner");
      } else if (hasPermission(permissions, "admin:dashboard")) {
        window.location.assign("/admin");
      } else if (hasPermission(permissions, "teacher:dashboard")) {
        window.location.assign("/dashboard/teacher");
      } else {
        window.location.assign("/courses");
      }
    }
  }

  return (
    <>
      <div className="flex justify-center mb-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center">
            <Heart className="text-gray-950 w-6 h-6" />
          </div>
          <span className="font-bold text-2xl tracking-tight">GraceAndGrind</span>
        </Link>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
        <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
        <p className="text-gray-400 mb-8 text-sm">Sign in to access your courses.</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
                placeholder="••••••••"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-12 py-3.5 text-sm focus:outline-none focus:border-amber-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {capsLock && (
              <p className="text-[10px] text-red-400 font-bold mt-1.5 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> CAPS LOCK IS ON
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-amber-500 focus:ring-amber-500 focus:ring-offset-gray-900" 
              />
              <span className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">Remember me</span>
            </label>
            <Link href="/forgot-password" className="text-xs text-amber-500/80 hover:text-amber-400 font-medium transition-colors">
              Forgot password?
            </Link>
          </div>

          <button
            id="login-btn"
            type="submit"
            disabled={loading || !email || !password}
            className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-30 disabled:grayscale text-gray-950 font-bold py-4 rounded-2xl transition-all shadow-lg shadow-amber-500/20 mt-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>Sign In to Mastery <ArrowRight className="w-5 h-5" /></>
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
          No account?{" "}
          <Link href="/register" className="text-amber-500 hover:text-amber-400 font-medium">
            Create one free
          </Link>
          <br/><br/>
          <Link href="/forgot-password" className="text-gray-400 hover:text-gray-300 transition-colors">
            Forgot your password?
          </Link>
        </p>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Suspense fallback={<div className="flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
