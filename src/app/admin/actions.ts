"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateUserRole(userId: string, newRole: string) {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  // Ensure we are not demoting the last admin
  if (newRole !== "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.role === "ADMIN" && adminCount <= 1) {
      throw new Error("Cannot demote the last remaining admin.");
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
  });

  revalidatePath("/admin");
  return { success: true };
}

export async function deleteUser(userId: string) {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  // Ensure we don't delete ourselves
  if (userId === session.user.id) {
    throw new Error("You cannot delete your own account.");
  }

  // Ensure we don't delete the last admin
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.role === "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) {
      throw new Error("Cannot delete the last remaining admin.");
    }
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  revalidatePath("/admin");
  return { success: true };
}

export async function deleteCourse(courseId: string) {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.course.delete({ where: { id: courseId } });

  revalidatePath("/admin");
  revalidatePath("/courses");
  return { success: true };
}

export async function updateUserStatus(userId: string, newStatus: string) {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  // Ensure we don't block ourselves
  if (userId === session.user.id && newStatus === "BLOCKED") {
    throw new Error("You cannot block your own account.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { status: newStatus },
  });

  revalidatePath("/admin");
  return { success: true };
}

export async function reviewTeacherApplication(applicationId: string, status: "APPROVED" | "REJECTED") {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const application = await prisma.teacherApplication.findUnique({
    where: { id: applicationId },
  });

  if (!application) throw new Error("Application not found.");

  // Update application status
  await prisma.teacherApplication.update({
    where: { id: applicationId },
    data: { status },
  });

  // If approved, upgrade user role
  if (status === "APPROVED") {
    await prisma.user.update({
      where: { id: application.userId },
      data: { role: "TEACHER" },
    });
  }

  revalidatePath("/admin");
  revalidatePath("/profile");
  return { success: true };
}
