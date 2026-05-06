"use server";

/**
 * Structured logger for production tracking.
 * In a real production app, this would send to Sentry, Axiom, or Datadog.
 */
export async function logError(error: any, context?: any) {
  const timestamp = new Date().toISOString();
  const errorPayload = {
    timestamp,
    message: error.message || error,
    stack: error.stack,
    digest: error.digest,
    context,
  };

  // On Vercel, this structured JSON will be easily searchable in logs.
  console.error("🚨 [PRODUCTION_ERROR]", JSON.stringify(errorPayload, null, 2));

  return { success: true };
}

export async function logInfo(message: string, context?: any) {
  const timestamp = new Date().toISOString();
  console.log(`ℹ️ [INFO] [${timestamp}] ${message}`, context ? JSON.stringify(context) : "");
}
