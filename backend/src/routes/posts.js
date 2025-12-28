const express = require('express');
const knex = require('../db/knex');
const { requireAuth } = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

const router = express.Router();

// List published posts with optional search and pagination
// Query: q (search), page, per_page
router.get('/', async (req, res) => {
  const q = req.query.q;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const perPage = Math.min(Math.max(parseInt(req.query.per_page) || 10, 1), 100);

  try {
    // Build base query for counting
    let countQuery = knex('posts').where({ status: 'published' }).count('*', { as: 'cnt' });
    
    // Build base query for selecting
    let selectQuery = knex('posts').where({ status: 'published' })
      .leftJoin('categories', 'posts.category_id', 'categories.id')
      .leftJoin('users', 'posts.author_id', 'users.id')
      .select('posts.id','posts.title','posts.slug','posts.excerpt','posts.content','posts.published_at','posts.view_count','categories.name as category','users.full_name as author')
      .orderBy('posts.published_at','desc');

    if (q) {
      countQuery.andWhere(function() {
        this.where('posts.title', 'like', `%${q}%`).orWhere('posts.excerpt', 'like', `%${q}%`).orWhere('posts.content', 'like', `%${q}%`);
      });
      selectQuery.andWhere(function() {
        this.where('posts.title', 'like', `%${q}%`).orWhere('posts.excerpt', 'like', `%${q}%`).orWhere('posts.content', 'like', `%${q}%`);
      });
    }

    const totalRow = await countQuery.first();
    const total = totalRow.cnt || 0;
    const rows = await selectQuery.limit(perPage).offset((page-1)*perPage);
    res.json({ total, page, perPage, posts: rows });
  } catch (err) {
    console.error('List posts error', err);
    res.status(500).json({ message: 'Error listing posts', error: err.message });
  }
});

// Post detail
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  const post = await knex('posts').where({ 'posts.id': id }).leftJoin('users','posts.author_id','users.id')
    .select('posts.*','users.full_name as author').first();
  if (!post) return res.status(404).json({ message: 'Not found' });
  const comments = await knex('comments').where({ post_id: id }).orderBy('created_at','asc');
  res.json({ post, comments });
});

// Add comment (auth required)
router.post('/:id/comments', requireAuth, async (req, res) => {
  const postId = req.params.id;
  const { content, parent_comment_id } = req.body;
  if (!content) return res.status(400).json({ message: 'Missing content' });
  const [id] = await knex('comments').insert({ post_id: postId, user_id: req.user.userId, parent_comment_id, content });
  res.json({ id });
});

// ADMIN: create post
router.post('/', requireAuth, isAdmin, async (req, res) => {
  console.log('Create post body:', JSON.stringify(req.body));
  const { title, slug, excerpt, content, category_id, status, published_at } = req.body;
  if (!title || !content) return res.status(400).json({ message: 'Missing title or content' });
  const newSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');

  // sanitize & validate category_id
  let catId = null;
  if (category_id !== undefined && category_id !== null && category_id !== '') {
    const parsed = parseInt(category_id);
    if (Number.isNaN(parsed)) return res.status(400).json({ message: 'Invalid category_id' });
    catId = parsed;
  }

  try {
    const insertObj = { author_id: req.user.userId, category_id: catId, title, slug: newSlug, excerpt, content, status: status || 'published' };
    if (published_at) insertObj.published_at = published_at;

    const [id] = await knex('posts').insert(insertObj);
    const created = await knex('posts').where({ id }).first();
    res.json({ id, post: created });
  } catch (err) {
    console.error('Create post error', err);
    res.status(500).json({ message: 'Error creating post', error: err.message });
  }
});

// ADMIN: update post
router.put('/:id', requireAuth, isAdmin, async (req, res) => {
  const id = req.params.id;
  const { title, slug, excerpt, content, category_id, status, published_at } = req.body;

  // sanitize category_id
  let catId = null;
  if (category_id !== undefined && category_id !== null && category_id !== '') {
    const parsed = parseInt(category_id);
    if (Number.isNaN(parsed)) return res.status(400).json({ message: 'Invalid category_id' });
    catId = parsed;
  }

  const updateObj = { title, slug, excerpt, content, category_id: catId, status, published_at };
  try {
    await knex('posts').where({ id }).update(updateObj);
    const updated = await knex('posts').where({ id }).first();
    res.json({ ok: true, post: updated });
  } catch (err) {
    console.error('Update post error', err);
    res.status(500).json({ message: 'Error updating post', error: err.message });
  }
});

// ADMIN: delete post
router.delete('/:id', requireAuth, isAdmin, async (req, res) => {
  const id = req.params.id;
  await knex('posts').where({ id }).del();
  res.json({ ok: true });
});

module.exports = router;
