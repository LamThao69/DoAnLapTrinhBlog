const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const knex = require('../db/knex');

const router = express.Router();

// Return current user based on cookie or Authorization header
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  let token = null;
  if (authHeader && authHeader.startsWith('Bearer ')) token = authHeader.split(' ')[1];
  if (!token && req.cookies && req.cookies.token) token = req.cookies.token;
  if (!token) return res.status(200).json({ user: null });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await knex('users').where({ id: payload.userId }).first();
    if (!user) return res.status(200).json({ user: null });
    res.json({ user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role } });
  } catch (err) {
    res.status(200).json({ user: null });
  }
});

// Logout - clear cookie
router.post('/logout', (req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: process.env.COOKIE_SECURE === 'true' });
  res.json({ ok: true });
});
router.post('/register', async (req, res) => {
  const { email, password, full_name } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Missing email or password' });
  const existing = await knex('users').where({ email }).first();
  if (existing) return res.status(409).json({ message: 'Email already used' });
  const hash = await bcrypt.hash(password, 10);
  const [id] = await knex('users').insert({ email, password_hash: hash, full_name });

  // Auto-login after register using cookie
  const token = jwt.sign({ userId: id, role: 'user' }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
  const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.COOKIE_SECURE === 'true',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };
  res.cookie('token', token, cookieOptions);

  res.json({ id, email, full_name });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await knex('users').where({ email }).first();
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

  const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.COOKIE_SECURE === 'true',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };

  res.cookie('token', token, cookieOptions);
  res.json({ user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role } });
});

module.exports = router;
