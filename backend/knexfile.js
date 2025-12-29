require('dotenv').config();

const isProd = process.env.NODE_ENV === 'production';

const connection = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'blog'
};

// Render PostgreSQL requires SSL for external connections
if (isProd) {
  connection.ssl = { rejectUnauthorized: false };
}

module.exports = {
  client: 'pg',
  connection,
  migrations: {
    directory: './migrations'
  },
  seeds: {
    directory: './seeds'
  }
};
