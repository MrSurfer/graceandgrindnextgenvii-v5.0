const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$queryRawUnsafe(`
    SELECT tablename, 
           (SELECT rowsecurity FROM pg_tables t WHERE t.schemaname = 'public' AND t.tablename = p.tablename) as rls_enabled,
           COUNT(*) as policy_count 
    FROM pg_policies p 
    WHERE schemaname = 'public' 
    GROUP BY tablename 
    ORDER BY tablename
  `);
  console.log('Tables with RLS policies:');
  console.table(result);

  const trigger = await prisma.$queryRawUnsafe(`
    SELECT trigger_name, event_manipulation, action_statement 
    FROM information_schema.triggers 
    WHERE trigger_schema = 'public' OR event_object_schema = 'auth'
  `);
  console.log('\nTriggers:');
  console.table(trigger);
}

main().catch(console.error).finally(() => prisma.$disconnect());
