import { auth } from "@/lib/supabase/server-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import SupportClient from "./SupportClient";

export const dynamic = "force-dynamic";

export default async function SupportPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, role: true }
  });

  if (!user) {
    redirect("/login");
  }

  const tickets = await prisma.supportTicket.findMany({
    where: { userId: session.user.id },
    include: {
      replies: {
        include: { sender: { select: { name: true, role: true, image: true } } },
        orderBy: { createdAt: 'asc' }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-12 py-16 min-h-screen">
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">Help & Support</h1>
      <p className="text-gray-400 mb-8">Create a ticket to get assistance from our support team.</p>
      
      <SupportClient initialTickets={tickets} userId={session.user.id} userName={user.name || "Student"} />
    </div>
  );
}
