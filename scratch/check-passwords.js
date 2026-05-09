const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkPasswords() {
  const users = await prisma.user.findMany({
    select: { email: true, password: true }
  });
  users.forEach(u => {
    console.log(`${u.email}: ${u.password ? 'HAS PASSWORD' : 'NO PASSWORD'}`);
  });
  await prisma.$disconnect();
}

checkPasswords().catch(console.error);
