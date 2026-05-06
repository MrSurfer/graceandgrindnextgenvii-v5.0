import { prisma } from "./prisma";

interface RateLimitConfig {
  points: number; // Max requests
  duration: number; // Duration in seconds
}

export async function checkRateLimit(
  identifier: string,
  action: string,
  config: RateLimitConfig = { points: 5, duration: 60 }
) {
  const key = `${identifier}:${action}`;
  const now = new Date();

  try {
    const limit = await prisma.rateLimit.findUnique({
      where: { key },
    });

    if (!limit) {
      await prisma.rateLimit.create({
        data: {
          key,
          points: 1,
          resetAt: new Date(now.getTime() + config.duration * 1000),
        },
      });
      return { success: true, remaining: config.points - 1 };
    }

    // Check if limit has expired
    if (now > limit.resetAt) {
      await prisma.rateLimit.update({
        where: { key },
        data: {
          points: 1,
          resetAt: new Date(now.getTime() + config.duration * 1000),
        },
      });
      return { success: true, remaining: config.points - 1 };
    }

    // Check if points exceeded
    if (limit.points >= config.points) {
      const waitSeconds = Math.ceil((limit.resetAt.getTime() - now.getTime()) / 1000);
      return { 
        success: false, 
        error: `Too many requests. Please try again in ${waitSeconds} seconds.`,
        waitSeconds
      };
    }

    // Increment points
    const updated = await prisma.rateLimit.update({
      where: { key },
      data: {
        points: { increment: 1 },
      },
    });

    return { success: true, remaining: config.points - updated.points };
  } catch (error) {
    console.error("Rate limit error:", error);
    // Fail open in case of DB error to not block users, but log it
    return { success: true, remaining: 1 };
  }
}

/**
 * Helper to get user IP from headers in Next.js
 */
export function getIP(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0];
  return "anonymous";
}
