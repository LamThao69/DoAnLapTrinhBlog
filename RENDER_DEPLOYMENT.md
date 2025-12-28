# Deploy to Render (Free Tier)

Hướng dẫn chi tiết deploy blog lên Render miễn phí.

## ⚠️ Important: Database Options

Render free tier cung cấp PostgreSQL miễn phí, **KHÔNG** có MySQL. Bạn có 3 lựa chọn:

### Option 1: Switch to PostgreSQL (Recommended ✅)
- Miễn phí trên Render
- Cùng chức năng như MySQL
- Không cần setup thêm

### Option 2: Keep MySQL (External Host)
- PlanetScale: Free tier MySQL (nhưng limited features)
- AWS RDS free tier (1 năm)
- Render + external MySQL elsewhere

### Option 3: Use Railway Instead
- Railway hỗ trợ MySQL native
- $5/tháng free credits
- Easier migration path

**Recommend: Option 1 (Switch to PostgreSQL)** - Mình sẽ hướng dẫn cách này.

---

## 1. Prepare Backend for PostgreSQL

### Step 1: Install PostgreSQL package

```bash
cd backend
npm install pg
```

### Step 2: Update database configuration

File: `backend/src/db/knex.js`

```javascript
const knex = require('knex');

const knexInstance = knex({
  client: 'pg',  // ← Change from 'mysql2' to 'pg'
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,  // ← PostgreSQL default port
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'blog'
  },
  migrations: {
    directory: './migrations'
  },
  seeds: {
    directory: './seeds'
  }
});

module.exports = knexInstance;
```

### Step 3: Update migrations for PostgreSQL syntax

File: `backend/migrations/20251228_init_schema.js`

Replace the exports.up function:

```javascript
exports.up = async (knex) => {
  // Users table
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('email').unique().notNullable();
    table.string('password_hash').notNullable();
    table.string('full_name');
    table.enum('role', ['user', 'admin']).defaultTo('user');
    table.timestamps(true, true);
  });

  // Categories table
  await knex.schema.createTable('categories', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('slug').unique().notNullable();
    table.text('description');
    table.timestamps(true, true);
  });

  // Posts table
  await knex.schema.createTable('posts', (table) => {
    table.increments('id').primary();
    table.string('title').notNullable();
    table.string('slug').unique().notNullable();
    table.text('excerpt').notNullable();
    table.text('content').notNullable();
    table.integer('author_id').unsigned().notNullable();
    table.integer('category_id').unsigned();
    table.enum('status', ['draft', 'published']).defaultTo('draft');
    table.timestamp('published_at');
    table.timestamps(true, true);
    
    table.foreign('author_id').references('users.id').onDelete('CASCADE');
    table.foreign('category_id').references('categories.id').onDelete('SET NULL');
  });

  // Comments table
  await knex.schema.createTable('comments', (table) => {
    table.increments('id').primary();
    table.integer('post_id').unsigned().notNullable();
    table.integer('user_id').unsigned().notNullable();
    table.text('content').notNullable();
    table.boolean('is_approved').defaultTo(true);
    table.timestamps(true, true);
    
    table.foreign('post_id').references('posts.id').onDelete('CASCADE');
    table.foreign('user_id').references('users.id').onDelete('CASCADE');
  });

  // Saved posts table
  await knex.schema.createTable('saved_posts', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.integer('post_id').unsigned().notNullable();
    table.timestamps(true, true);
    
    table.unique(['user_id', 'post_id']);
    table.foreign('user_id').references('users.id').onDelete('CASCADE');
    table.foreign('post_id').references('posts.id').onDelete('CASCADE');
  });

  // Password resets table
  await knex.schema.createTable('password_resets', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.string('token').unique().notNullable();
    table.timestamp('expires_at');
    table.timestamps(true, true);
    
    table.foreign('user_id').references('users.id').onDelete('CASCADE');
  });
};
```

### Step 4: Update .env.example

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=blog
PORT=4000
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
ADMIN_PASSWORD=Admin@123
FRONTEND_URL=http://localhost
COOKIE_SECURE=false
NODE_ENV=development
```

---

## 2. Setup Render Account & Database

### Step 1: Create Render Account
1. Go to [https://render.com](https://render.com)
2. Sign up with GitHub (easier for deployment)
3. Verify email

### Step 2: Create PostgreSQL Database
1. Dashboard → **New +** → **PostgreSQL**
2. Fill in:
   - **Name**: `blog-db` (or any name)
   - **Database**: `blog`
   - **User**: `postgres`
   - **Region**: Singapore or closest to you
   - **Plan**: Free
3. Click **Create Database**
4. Wait 2-3 minutes for database to be ready
5. **Copy connection string** (you'll need it in Step 4)

---

## 3. Prepare GitHub Repository

### Step 1: Commit all changes
```bash
git add .
git commit -m "Prepare for Render deployment with PostgreSQL"
git push origin main
```

### Step 2: Create Dockerfile updates

File: `backend/Dockerfile`

```dockerfile
FROM node:18-alpine

# Install bash and postgresql client (for migrations)
RUN apk add --no-cache bash postgresql-client

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN chmod +x entrypoint.sh

EXPOSE 4000

CMD ["./entrypoint.sh"]
```

### Step 3: Update entrypoint.sh for PostgreSQL

File: `backend/entrypoint.sh`

```bash
#!/bin/bash

echo "=== Starting Render Deployment ==="

# Wait for database
echo "Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
  if psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT 1" > /dev/null 2>&1; then
    echo "PostgreSQL is ready!"
    break
  fi
  echo "Attempt $i/30: Waiting for database..."
  sleep 2
done

# Run migrations
echo "Running migrations..."
npm run migrate

# Run seeds
echo "Running seeds..."
npm run seed

# Start server
echo "Starting Node.js server..."
node src/index.js
```

### Step 4: Update package.json scripts

File: `backend/package.json`

```json
"scripts": {
  "start": "node src/index.js",
  "dev": "nodemon src/index.js",
  "migrate": "knex migrate:latest",
  "seed": "knex seed:run"
}
```

---

## 4. Deploy Backend to Render

### Step 1: Create Web Service
1. Render Dashboard → **New +** → **Web Service**
2. Connect your GitHub repository
3. Fill in details:
   - **Name**: `blog-backend` (or your choice)
   - **Runtime**: Node
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free
4. Click **Create Web Service**

### Step 2: Configure Environment Variables
1. Go to Web Service Settings → **Environment**
2. Add these variables:

```
DB_HOST=<copy from PostgreSQL connection details - hostname>
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=<copy from PostgreSQL connection details - password>
DB_NAME=blog
JWT_SECRET=<generate strong random string - e.g., openssl rand -base64 32>
ADMIN_PASSWORD=Admin@123
FRONTEND_URL=https://<your-render-domain>.onrender.com
COOKIE_SECURE=true
NODE_ENV=production
```

**Where to find PostgreSQL credentials:**
- Go to your PostgreSQL service in Render dashboard
- Click on it
- Copy Host, Password from the connection details

### Step 3: Deploy
1. Save environment variables
2. Render auto-deploys from git push
3. Or manually: **Dashboard** → Web Service → **Manual Deploy** → **Deploy latest commit**
4. Wait for build to complete (3-5 minutes)
5. Once deployed, copy your **service URL** (e.g., https://blog-backend-xyz.onrender.com)

---

## 5. Deploy Frontend to Render

### Step 1: Create Static Site Service
1. Render Dashboard → **New +** → **Static Site**
2. Connect GitHub repository
3. Fill in:
   - **Name**: `blog-frontend`
   - **Build Command**: `cd Front-end && npm install` (if you have build step, otherwise leave empty)
   - **Publish Directory**: `Front-end`
   - **Plan**: Free
4. Click **Create Static Site**

### Step 2: Update Frontend API URLs

File: `Front-end/index.js` (update API base URL)

Add at the top:
```javascript
const API_BASE = 'https://blog-backend-xyz.onrender.com'; // Replace with your backend URL
```

Then update all fetch calls:
```javascript
// Example
fetch(`${API_BASE}/auth/me`, { credentials: 'include' })
```

Or create a config file:

File: `Front-end/config.js`

```javascript
const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:4000' 
  : 'https://blog-backend-xyz.onrender.com'; // Replace with your actual backend URL

export { API_BASE };
```

Then in each JS file:
```javascript
import { API_BASE } from './config.js';

// Use it
fetch(`${API_BASE}/auth/me`, { credentials: 'include' })
```

### Step 3: Update CORS in Backend

File: `backend/src/index.js`

```javascript
const cors = require('cors');

const allowedOrigins = [
  'http://localhost',
  'http://localhost:3000',
  'https://blog-frontend-xyz.onrender.com' // Add your frontend URL
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
```

### Step 4: Commit and Push
```bash
git add .
git commit -m "Deploy to Render: PostgreSQL + frontend"
git push origin main
```

Frontend auto-deploys. Check your Render dashboard for URL.

---

## 6. Verify Deployment

### Test Backend
```bash
curl https://blog-backend-xyz.onrender.com/auth/me
```

Should return: `{"message":"Unauthorized"}` or user object if logged in.

### Test Frontend
Visit: `https://blog-frontend-xyz.onrender.com`

Should load your blog homepage.

### Test Full Flow
1. Register new account
2. Login
3. View posts
4. Add comment
5. Save post
6. Check admin panel

---

## 7. Troubleshooting

### "Database connection failed"
- Check PostgreSQL service is deployed in Render
- Verify DB_HOST, DB_USER, DB_PASSWORD in environment variables
- Check migrations ran (view logs)

### "API call returns 404"
- Verify FRONTEND_URL and CORS origins in backend
- Check API_BASE URL in frontend config matches backend URL
- Clear browser cache

### "Slow first load (spin-up)"
- Render free tier spins down after 15 min inactivity
- First request takes 15-30 seconds to spin up again
- Normal behavior on free tier

### "Service keeps crashing"
- Check logs: Dashboard → Web Service → **Logs**
- Look for errors in migrations or seeds
- Verify all environment variables are set

### "PostgreSQL migration failed"
- SSH into backend service
- Run migrations manually:
  ```bash
  npm run migrate
  npm run seed
  ```

---

## 8. Next Steps

### Scale up (if traffic grows)
1. Upgrade to paid plan
2. Add more instances
3. Use Render's PostgreSQL paid tier

### Custom domain
1. Go to Web Service Settings → **Custom Domain**
2. Add your domain
3. Follow DNS setup instructions

### Backups
Render auto-backups PostgreSQL every day on paid plans.
For free tier, manually export:
```bash
pg_dump -h <host> -U postgres -d blog > backup.sql
```

### Monitoring
- Render Dashboard shows CPU, memory, disk usage
- Check logs regularly for errors
- Set up email notifications in Render settings

---

## 9. Cost Summary

| Service | Free Tier | Cost/month |
|---------|-----------|-----------|
| PostgreSQL | 256MB storage | Free (auto-pause) |
| Web Service (Backend) | Shared resources | Free (spins down after 15 min) |
| Static Site (Frontend) | 100GB bandwidth | Free |
| **Total** | | **$0/month** ✅ |

**Trade-off**: 15 second cold start when idle. For production use, upgrade to paid ($7/month for Backend + $15/month for Database).

---

## 10. Quick Reference

**Backend URL**: https://blog-backend-xyz.onrender.com
**Frontend URL**: https://blog-frontend-xyz.onrender.com
**Database**: PostgreSQL (Render managed)
**Admin panel**: https://blog-frontend-xyz.onrender.com/admin.html
**Default admin**: admin@example.com / Admin@123
**Adminer**: N/A on Render (use DB management tools)

---

**Done! Your blog is now live on the internet! 🚀**

Next time someone visits, it'll be on your real domain.
