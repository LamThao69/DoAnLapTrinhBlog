const express = require('express');
const knex = require('../db/knex');
const { requireAuth } = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

const router = express.Router();

// Public: list categories
router.get('/', async (req, res) => {
  const cats = await knex('categories').select('id','name','slug','description').orderBy('name');
  res.json(cats);
});

// Public: get by id
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  const cat = await knex('categories').where({ id }).first();
  if (!cat) return res.status(404).json({ message: 'Not found' });
  res.json(cat);
});

// Admin: create
router.post('/', requireAuth, isAdmin, async (req, res) => {
  const { name, slug, description } = req.body;
  if (!name || !slug) return res.status(400).json({ message: 'Missing fields' });
  try {
    const [id] = await knex('categories').insert({ name, slug, description });
    res.json({ id });
  } catch (err) {
    res.status(500).json({ message: 'Error creating category', error: err.message });
  }
});

// Admin: update
router.put('/:id', requireAuth, isAdmin, async (req, res) => {
  const id = req.params.id;
  const { name, slug, description } = req.body;
  await knex('categories').where({ id }).update({ name, slug, description });
  res.json({ ok: true });
});

// Admin: delete
router.delete('/:id', requireAuth, isAdmin, async (req, res) => {
  const id = req.params.id;
  await knex('categories').where({ id }).del();
  res.json({ ok: true });
});

module.exports = router;
