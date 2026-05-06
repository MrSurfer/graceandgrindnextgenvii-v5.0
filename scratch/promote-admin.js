const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function promote() {
  const email = "mys.test25@gmail.com"; 
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: "SUPER_ADMIN" }
    });
    console.log(`🚀 Success! User ${user.email} is now a SUPER_ADMIN.`);
  } catch (err) {
    console.error("❌ Error: Could not find user with that email. Make sure you've registered first!");
  }
}

promote().catch(console.error).finally(() => prisma.$disconnect());
