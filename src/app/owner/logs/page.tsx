import { auth } from "@/lib/supabase/server-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import LogsClient from "./LogsClient";

export const dynamic = "force-dynamic";

export default async function EventLogsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const permissions = (session.user as any).permissions || [];
  const { hasPermission } = await import("@/lib/permissions");

  // Only users with audit:view permission can view logs
  if (!hasPermission(permissions, "audit:view")) {
    redirect("/");
  }

  const logs = await prisma.eventLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 500, // Fetch the last 500 logs for the UI
    include: {
      actor: { select: { name: true, email: true, role: true } },
    },
  });

  return <LogsClient logs={logs} />;
}
