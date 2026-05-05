"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap, Mail, ArrowRight, Loader2, CheckCircle } from "lucide-react";
import { requestPasswordReset } from "./actions";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setSuccess(true);
    } catch (e) {
      console.error(e);
      // We still show success for security to avoid email enumeration
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center">
              <Zap className="text-gray-950 w-6 h-6" />
            </div>
            <span className="font-bold text-2xl tracking-tight">GraceAndGrind</span>
          </Link>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Check your email</h1>
              <p className="text-gray-400 mb-8">
                If an account exists for <span className="text-gray-200 font-medium">{email}</span>, we've sent instructions on how to reset your password.
              </p>
              <Link
                href="/login"
                className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition-colors"
              >
                Return to log in
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-2">Reset your password</h1>
              <p className="text-gray-400 mb-8 text-sm">
                Enter your email address and we'll send you a link to reset your password.
              </p>

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

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-gray-950 font-bold py-3 rounded-lg transition-colors"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>Send Reset Link <ArrowRight className="w-5 h-5" /></>
                  )}
                </button>
              </form>

              <p className="text-center text-gray-500 text-sm mt-6">
                Remembered your password?{" "}
                <Link href="/login" className="text-amber-500 hover:text-amber-400 font-medium">
                  Log in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
