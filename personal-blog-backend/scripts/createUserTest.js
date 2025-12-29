const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.create({
      data: {
        email: `unique_test_${Date.now()}@example.com`,
        password: 'Password123!',
      }
    });
    console.log('Created user:', user);
  } catch (e) {
    console.error('Create error:', e);
    if (e && e.meta) console.error('Error meta:', e.meta);
  } finally {
    await prisma.$disconnect();
  }
}

main();
