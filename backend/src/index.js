require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const knex = require('./db/knex');

const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');

const app = express();
app.use(helmet());

// Configure CORS to allow credentials (cookies) from frontend
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost';
const allowedOrigins = [
  'http://localhost',
  'http://localhost:3000',
  'http://localhost:5173',
  'https://blog-frontend-qd12.onrender.com',
  FRONTEND_URL
].filter(url => url !== 'http://localhost' || FRONTEND_URL === 'http://localhost');

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true }));

// Temporary endpoint to run migrations and seeds (call once, then remove)
app.get('/admin/setup-db', async (req, res) => {
  try {
    const knexConfig = require('../knexfile');
    const knexInstance = require('knex')(knexConfig);
    
    // Run migrations
    await knexInstance.migrate.latest();
    
    // Run seeds
    await knexInstance.seed.run();
    
    await knexInstance.destroy();
    
    res.json({ success: true, message: 'Database setup complete: migrations and seeds ran successfully' });
  } catch (error) {
    console.error('Setup DB error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.use('/auth', authRoutes);
app.use('/posts', postsRoutes);
app.use('/categories', require('./routes/categories'));
app.use('/saved', require('./routes/saved'));
app.use('/admin', require('./routes/admin'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
