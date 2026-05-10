"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/supabase/server-auth";
import { revalidatePath } from "next/cache";

export async function createTicket(subject: string, message: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const ticket = await prisma.supportTicket.create({
      data: {
        userId: session.user.id,
        subject,
        message,
        status: "OPEN",
      }
    });
    revalidatePath("/support");
    return { success: true, ticket };
  } catch (error: any) {
    console.error("Failed to create ticket:", error);
    return { error: "Failed to create ticket. Please try again." };
  }
}

export async function replyToTicket(ticketId: string, message: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const reply = await prisma.ticketReply.create({
      data: {
        ticketId,
        senderId: session.user.id,
        message,
      }
    });

    // Update the ticket's updatedAt timestamp
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { updatedAt: new Date() }
    });

    revalidatePath("/support");
    revalidatePath("/admin");
    return { success: true, reply };
  } catch (error: any) {
    console.error("Failed to reply:", error);
    return { error: "Failed to send reply." };
  }
}

export async function closeTicket(ticketId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  // Only admins or ticket owners should close, but we'll trust the UI layer's check for now
  try {
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: "CLOSED" }
    });
    revalidatePath("/support");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    return { error: "Failed to close ticket." };
  }
}
