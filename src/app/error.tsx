// src/app/error.tsx
"use client";

import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { logError } from "./actions/logger";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Boundary:", error);
    logError({
      message: error.message,
      stack: error.stack,
      digest: error.digest,
    }, { url: window.location.href });
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
        <AlertCircle className="w-10 h-10 text-red-500" />
      </div>
      
      <h1 className="text-3xl font-extrabold mb-2 tracking-tight">Something went wrong</h1>
      <p className="text-gray-400 max-w-md mb-10">
        We encountered an unexpected error. Our team has been notified and we're working to fix it.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => reset()}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors"
        >
          <RefreshCcw className="w-4 h-4" /> Try Again
        </button>
        <Link
          href="/"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white font-bold rounded-lg border border-gray-800 hover:border-gray-700 transition-colors"
        >
          <Home className="w-4 h-4" /> Back Home
        </Link>
      </div>

      {process.env.NODE_ENV !== "production" && (
        <div className="mt-12 p-4 bg-gray-900/50 border border-red-900/20 rounded-lg text-left max-w-2xl overflow-auto">
          <p className="text-red-400 font-mono text-xs mb-2">Debug Info:</p>
          <pre className="text-gray-500 font-mono text-[10px] whitespace-pre-wrap">
            {error.message || "Unknown error"}
            {error.digest && `\nDigest: ${error.digest}`}
          </pre>
        </div>
      )}
    </div>
  );
}
