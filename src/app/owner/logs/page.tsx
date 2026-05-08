import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import LogsClient from "./LogsClient";

export const dynamic = "force-dynamic";

export default async function EventLogsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const role = (session.user as any).role;
  const userEmail = session.user.email || "";

  // Get whitelists
  const ownerEmails = process.env.OWNER_EMAILS?.split(",").map((e) => e.trim()) || [];
  const superAdminEmails = process.env.SUPER_ADMIN_EMAILS?.split(",").map((e) => e.trim()) || [];

  const isOwner = role === "OWNER" || ownerEmails.includes(userEmail);
  const isSuperAdmin = role === "SUPER_ADMIN" || superAdminEmails.includes(userEmail);

  // Only ROOT (Super Admin in whitelist/role) and OWNER can view logs
  if (!isOwner && !isSuperAdmin) {
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
