const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// PBAC permission sets (mirrors src/lib/permissions.ts)
const OWNER_PERMISSIONS = [
  "admin:dashboard", "owner:dashboard", "teacher:dashboard",
  "user:view", "user:edit", "user:delete", "user:promote", "user:block", "user:forge",
  "course:create", "course:edit_own", "course:edit_all", "course:delete", "course:publish", "course:view_all",
  "content:approve", "content:reject",
  "analytics:view", "hr:metrics", "audit:view",
  "system:settings",
];

const ROOT_PERMISSIONS = OWNER_PERMISSIONS.filter(p => p !== "owner:dashboard");

async function bootstrap() {
  console.log("🔧 Bootstrapping owner/root accounts...\n");

  // Promote OWNER
  const owner = await prisma.user.updateMany({
    where: { email: "mys.test25@gmail.com" },
    data: { 
      role: "OWNER", 
      permissions: { set: OWNER_PERMISSIONS },
      emailVerified: new Date(),
    },
  });
  console.log(`✅ mys.test25@gmail.com → OWNER (${owner.count} row${owner.count !== 1 ? 's' : ''} updated)`);

  // Promote ROOT
  const root = await prisma.user.updateMany({
    where: { email: "yironet3@gmail.com" },
    data: { 
      role: "ROOT", 
      permissions: { set: ROOT_PERMISSIONS },
      emailVerified: new Date(),
    },
  });
  console.log(`✅ yironet3@gmail.com → ROOT (${root.count} row${root.count !== 1 ? 's' : ''} updated)`);

  // Verify
  const users = await prisma.user.findMany({
    where: { email: { in: ["mys.test25@gmail.com", "yironet3@gmail.com"] } },
    select: { email: true, role: true, permissions: true, emailVerified: true },
  });
  console.log("\n📋 Verification:");
  users.forEach(u => {
    console.log(`   ${u.email}: role=${u.role}, verified=${!!u.emailVerified}, perms=${u.permissions.length}`);
  });
}

bootstrap().catch(console.error).finally(() => prisma.$disconnect());
