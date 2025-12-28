const express = require('express');
const knex = require('../db/knex');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Save a post
router.post('/posts/:id/save', requireAuth, async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.userId;
  try {
    await knex('saved_posts').insert({ user_id: userId, post_id: postId }).onConflict(['user_id','post_id']).ignore();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Error saving post', error: err.message });
  }
});

// Unsave a post
router.delete('/posts/:id/save', requireAuth, async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.userId;
  await knex('saved_posts').where({ user_id: userId, post_id: postId }).del();
  res.json({ ok: true });
});

// Get user's saved posts
router.get('/me', requireAuth, async (req, res) => {
  const userId = req.user.userId;
  const rows = await knex('saved_posts')
    .where('saved_posts.user_id', userId)
    .join('posts','saved_posts.post_id','posts.id')
    .select('posts.id','posts.title','posts.slug','posts.excerpt','saved_posts.saved_at')
    .orderBy('saved_posts.saved_at','desc');
  res.json(rows);
});

module.exports = router;
