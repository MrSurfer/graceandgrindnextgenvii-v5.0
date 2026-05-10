import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const OWNER_PERMISSIONS = [
    "admin:dashboard", "owner:dashboard", "teacher:dashboard",
    "user:view", "user:edit", "user:delete", "user:promote", "user:block", "user:forge",
    "course:create", "course:edit_own", "course:edit_all", "course:delete", "course:publish", "course:view_all",
    "content:approve", "content:reject",
    "analytics:view", "hr:metrics", "audit:view",
    "system:settings",
  ];

  const ROOT_PERMISSIONS = OWNER_PERMISSIONS.filter(p => p !== "owner:dashboard");

  const owner = await prisma.user.updateMany({
    where: { email: "mys.test25@gmail.com" },
    data: { role: "OWNER", permissions: { set: OWNER_PERMISSIONS }, emailVerified: new Date() },
  });

  const root = await prisma.user.updateMany({
    where: { email: "yironet3@gmail.com" },
    data: { role: "ROOT", permissions: { set: ROOT_PERMISSIONS }, emailVerified: new Date() },
  });

  return NextResponse.json({ owner, root });
}
