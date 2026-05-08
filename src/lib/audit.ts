import { prisma } from "./prisma";

export async function logAdminEvent(
  actorId: string,
  action: string,
  targetId?: string,
  details?: string | Record<string, any>
) {
  try {
    const detailsStr = typeof details === "object" ? JSON.stringify(details) : details;
    await prisma.eventLog.create({
      data: {
        actorId,
        action,
        targetId,
        details: detailsStr,
      },
    });
  } catch (error) {
    console.error("Failed to log admin event:", error);
  }
}
