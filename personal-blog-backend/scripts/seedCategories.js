const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const categories = [
  { name: 'Đời sống', slug: 'doi-song' },
  { name: 'Lối sống', slug: 'loi-song' },
  { name: 'Khoa học', slug: 'khoa-hoc' },
  { name: 'Sức khỏe', slug: 'suc-khoe' },
  { name: 'Công nghệ', slug: 'cong-nghe' },
  { name: 'Kiến thức', slug: 'kien-thuc' },
  { name: 'Tâm lý', slug: 'tam-ly' }
];

async function seedCategories() {
  console.log('🌱 Đang tạo categories...');
  
  for (const category of categories) {
    const existing = await prisma.category.findUnique({
      where: { slug: category.slug }
    });
    
    if (!existing) {
      await prisma.category.create({
        data: category
      });
      console.log(`✅ Đã tạo category: ${category.name}`);
    } else {
      console.log(`⏭️  Đã tồn tại: ${category.name}`);
    }
  }
  
  const allCategories = await prisma.category.findMany();
  console.log('\n📋 Tất cả categories:');
  console.log(JSON.stringify(allCategories, null, 2));
  
  await prisma.$disconnect();
  console.log('\n✨ Hoàn tất!');
}

seedCategories().catch(async (e) => {
  console.error('❌ Lỗi:', e);
  await prisma.$disconnect();
  process.exit(1);
});
