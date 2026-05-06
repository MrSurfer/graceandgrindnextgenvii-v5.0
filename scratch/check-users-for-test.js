const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { email: true, name: true }
  });
  console.log('Admins:', users);
  
  const teachers = await prisma.user.findMany({
    where: { role: 'TEACHER' },
    select: { email: true, name: true }
  });
  console.log('Teachers:', teachers);

  const courses = await prisma.course.findMany({
    select: { id: true, title: true, slug: true, published: true }
  });
  console.log('Courses:', courses);
}

main();
