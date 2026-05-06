const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const email = 'testparent@gmail.com';
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hashedPassword, role: 'CUSTOMER' },
    create: {
      email,
      name: 'Test Parent',
      password: hashedPassword,
      role: 'CUSTOMER',
      status: 'ACTIVE'
    }
  });
  
  console.log('Test user created:', user.email);
}

main();
