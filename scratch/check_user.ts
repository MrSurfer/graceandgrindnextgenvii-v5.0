import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'mys.test25@gmail.com';
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, role: true, status: true, emailVerified: true }
  });
  console.log(JSON.stringify(user, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
