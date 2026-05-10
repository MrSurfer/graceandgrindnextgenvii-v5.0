const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Check all users in the DB
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, status: true, supabaseAuthId: true, permissions: true, emailVerified: true, createdAt: true }
  });
  console.log('=== ALL USERS IN public.User ===');
  console.table(users);

  // Check if trigger is working - do we have supabaseAuthId linked?
  const ownerUser = users.find(u => u.email === 'mys.test25@gmail.com');
  if (ownerUser) {
    console.log('\n=== OWNER ACCOUNT DETAILS ===');
    console.log(JSON.stringify(ownerUser, null, 2));
    console.log('supabaseAuthId linked:', !!ownerUser.supabaseAuthId);
    console.log('Current role:', ownerUser.role);
    console.log('Permissions array:', ownerUser.permissions);
  } else {
    console.log('\n❌ mys.test25@gmail.com NOT FOUND in public.User table!');
    console.log('This means the trigger did NOT fire or failed.');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
