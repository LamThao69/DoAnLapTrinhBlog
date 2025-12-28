exports.seed = async function(knex) {
  await knex('categories').del();
  await knex('categories').insert([
    { id: 1, name: 'General', slug: 'general', description: 'Bài viết tổng quan' },
    { id: 2, name: 'Programming', slug: 'programming', description: 'Bài viết về lập trình' },
    { id: 3, name: 'Tutorials', slug: 'tutorials', description: 'Hướng dẫn kỹ thuật' }
  ]);
};
