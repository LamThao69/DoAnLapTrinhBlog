const express = require('express');
const knex = require('../db/knex');
const { requireAuth } = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

const router = express.Router();

// Get list of users
router.get('/users', requireAuth, isAdmin, async (req, res) => {
  const users = await knex('users').select('id','email','full_name','role','is_active','created_at');
  res.json(users);
});

// Admin: list all posts (for dashboard)
router.get('/posts', requireAuth, isAdmin, async (req, res) => {
  const posts = await knex('posts')
    .leftJoin('users','posts.author_id','users.id')
    .leftJoin('categories','posts.category_id','categories.id')
    .select('posts.id','posts.title','posts.slug','posts.excerpt','posts.status','posts.published_at','users.full_name as author','categories.name as category')
    .orderBy('posts.created_at','desc');
  res.json(posts);
});

// Update user (email, full_name, role, is_active)
router.put('/users/:id', requireAuth, isAdmin, async (req, res) => {
  const id = req.params.id;
  const { email, full_name, role, is_active } = req.body;
  await knex('users').where({ id }).update({ email, full_name, role, is_active });
  res.json({ ok: true });
});

// Delete user
router.delete('/users/:id', requireAuth, isAdmin, async (req, res) => {
  const id = req.params.id;
  await knex('users').where({ id }).del();
  res.json({ ok: true });
});

// Admin can change a user's password
router.post('/users/:id/reset-password', requireAuth, isAdmin, async (req, res) => {
  const id = req.params.id;
  const { password } = req.body;
  if (!password) return res.status(400).json({ message: 'Missing password' });
  const bcrypt = require('bcrypt');
  const hash = await bcrypt.hash(password, 10);
  await knex('users').where({ id }).update({ password_hash: hash });
  res.json({ ok: true });
});

module.exports = router;
