const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function slugify(str) {
  return str
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function main() {
  // Use existing user as author (fallback to first user)
  const author = await prisma.user.findFirst();
  if (!author) {
    throw new Error('No users found in database. Please create a user first.');
  }

  const categories = ['DoiSong', 'KienThuc', 'CongNghe', 'SucKhoe', 'TamLy'];

  const categoryMap = {};
  for (const name of categories) {
    const up = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name, slug: slugify(name) },
    });
    categoryMap[name] = up;
  }

  const samplePosts = [
    {
      title: 'Hướng dẫn tạo thói quen đọc sách',
      description: 'Bí quyết để đọc sách mỗi ngày và tận dụng tối đa thời gian.',
      content: 'Nội dung chi tiết về cách tạo thói quen đọc sách hiệu quả... (sample content)',
      image: '../assets/imgs/anhBlog1.jpg',
      category: 'KienThuc',
      published: true,
    },
    {
      title: '5 Bước để bắt đầu tập thể dục mỗi sáng',
      description: 'Tập luyện buổi sáng giúp tinh thần sảng khoái.',
      content: 'Hướng dẫn chi tiết các bài tập và lịch trình tập luyện... (sample content)',
      image: '../assets/imgs/anhBlog2.jpg',
      category: 'SucKhoe',
      published: true,
    },
    {
      title: 'Xu hướng công nghệ 2026: AI & Automation',
      description: 'Những công nghệ nổi bật và tác động tới cuộc sống.',
      content: 'Phân tích xu hướng AI và các ứng dụng thực tế... (sample content)',
      image: '../assets/imgs/anhBlog3.jpg',
      category: 'CongNghe',
      published: true,
    },
  ];

  for (const p of samplePosts) {
    const slug = slugify(p.title) + '-' + Date.now().toString().slice(-4);
    const post = await prisma.post.create({
      data: {
        title: p.title,
        description: p.description,
        content: p.content,
        image: p.image,
        slug,
        published: p.published,
        author: { connect: { id: author.id } },
        category: { connect: { id: categoryMap[p.category].id } },
      },
    });
    console.log('Created post:', post.title, 'slug=', post.slug);
  }
}

main()
  .catch(e => {
    console.error('Seed failed:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
