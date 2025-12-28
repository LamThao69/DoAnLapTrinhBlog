const bcrypt = require('bcrypt');

exports.seed = async function(knex) {
  // use ADMIN_PASSWORD env var if provided
  const adminPass = process.env.ADMIN_PASSWORD || 'Admin@123';
  const hash = await bcrypt.hash(adminPass, 10);

  // clean users table only for the seeded ones (be careful in prod)
  await knex('users').whereIn('email', ['admin@example.com','user1@example.com']).del();

  await knex('users').insert([
    { id: 1, email: 'admin@example.com', password_hash: hash, full_name: 'Administrator', role: 'admin' },
    { id: 2, email: 'user1@example.com', password_hash: await bcrypt.hash('user123',10), full_name: 'User One', role: 'user' }
  ]);

  // example posts
  // Insert posts but ignore if slug already exists (idempotent seed)
  await knex('posts')
    .insert([
      { author_id: 2, category_id: 2, title: 'Làm quen với React', slug: 'lam-quen-voi-react', excerpt: 'React basics', content: 'Nội dung bài viết về React...', status: 'published', published_at: knex.fn.now() },
      { author_id: 2, category_id: 3, title: 'Hướng dẫn cài đặt Node.js', slug: 'huong-dan-cai-dat-node', excerpt: 'Cài Node', content: 'Hướng dẫn cài Node.js ...', status: 'published', published_at: knex.fn.now() }
    ])
    .onConflict('slug')
    .ignore();

  // example comments
  await knex('comments').insert([
    { post_id: 1, user_id: 2, content: 'Bài viết rất hữu ích, cảm ơn bạn!' },
    { post_id: 1, user_id: 2, content: 'Một bình luận khác.' }
  ]);
};
