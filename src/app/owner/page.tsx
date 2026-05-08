import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import OwnerClient from "./OwnerClient";
import { getCEOMetrics } from "./actions";

export const dynamic = "force-dynamic";

export default async function OwnerDashboard() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const ownerWhitelist = (process.env.OWNER_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
  const userEmail = session.user.email?.toLowerCase();
  const userRole = (session.user as any).role;
  const isOwner = (userEmail && ownerWhitelist.includes(userEmail)) || userRole === "OWNER";

  if (!isOwner) {
    console.log(`Access Denied to /owner: User ${session.user.email} with role ${userRole}. Whitelist:`, ownerWhitelist);
    redirect("/");
  }

  const data = await getCEOMetrics();
  if (data.error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500 font-bold">
        Error loading CEO Hub: {data.error}
      </div>
    );
  }

  return <OwnerClient initialData={data.metrics} />;
}
