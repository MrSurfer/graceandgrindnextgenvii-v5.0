const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function list() {
  try {
    const users = await prisma.user.findMany({
      select: { email: true, role: true }
    });
    console.log("Registered Users:");
    users.forEach(u => console.log(`- ${u.email} [${u.role}]`));
  } catch (err) {
    console.error("❌ Error listing users:", err);
  }
}

list().catch(console.error).finally(() => prisma.$disconnect());
