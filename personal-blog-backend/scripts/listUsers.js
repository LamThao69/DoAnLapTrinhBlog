const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, email: true, phoneNumber: true, createdAt: true } });
  console.log('Users:', users);
}

main()
  .catch(e => {
    console.error('Error listing users:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
