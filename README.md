# Green && Blue Blog - Full Stack Application

A modern blog platform built with **Node.js + Express** backend, **MySQL** database, and vanilla **JavaScript** frontend, deployed via **Docker Compose**.

## Features

✅ **User Authentication**
- Register & login with email/password
- HttpOnly cookie-based JWT authentication
- Password hashing with bcrypt

✅ **Blog Management**
- View published posts with pagination & search
- Read full post details
- Add/view comments on posts
- Save/bookmark favorite posts

✅ **Admin Dashboard**
- Manage posts (create, edit, delete)
- Manage categories
- Control post visibility (published/draft)
- Admin-only access protection

✅ **Database**
- MySQL with structured schema
- Posts, categories, users, comments, saved posts
- Automated migrations & seeding

## Quick Start

### Prerequisites
- Docker & Docker Compose installed
- Port 80 (nginx), 4000 (backend), 3307 (MySQL host access) available

### Installation & Run

1. **Clone & navigate to project:**
   ```bash
   cd DoAnLapTrinhBlog
   ```

2. **Configure environment (optional):**
   - Copy `backend/.env.example` → `backend/.env`
   - Default credentials:
     - Admin email: `admin@example.com`
     - Admin password: `Admin@123`
     - Default DB: `blog_db` on MySQL 8.0

3. **Start the stack:**
   ```bash
   docker compose up -d --build
   ```

4. **Access the application:**
   - Frontend: http://localhost (port 80)
   - Backend API: http://localhost:4000
   - Adminer (DB UI): http://localhost:8080
   - Admin dashboard: http://localhost/admin.html

### Shutdown
```bash
docker compose down
```

## Architecture

### Services
- **db**: MySQL 8.0 - Blog database
- **backend**: Node.js 18 + Express - REST API server
- **nginx**: Web server - Serves frontend & proxies API requests
- **adminer**: Database management UI (optional)

### Directory Structure
```
DoAnLapTrinhBlog/
├── Front-end/          # Static HTML/CSS/JS frontend
│   ├── index.html      # Home page with blog list
│   ├── admin.html      # Admin dashboard
│   ├── post-detail.html # Post detail & comments
│   ├── saved-posts.html # Saved posts list
│   ├── login.html      # Login page
│   ├── register.html   # Registration page
│   └── *.js/*.css      # Supporting scripts & styles
├── backend/            # Node.js Express server
│   ├── src/
│   │   ├── index.js    # Main app entry
│   │   ├── routes/     # API endpoints (auth, posts, categories, saved, admin)
│   │   ├── middleware/ # Auth & admin middleware
│   │   └── db/         # Knex database config
│   ├── migrations/     # DB schema migrations
│   ├── seeds/          # Initial data seeding
│   ├── package.json
│   ├── .env            # Environment variables
│   └── Dockerfile      # Backend image
├── database/           # DB schema & seeds reference
├── nginx/              # Nginx configuration
├── docker-compose.yml  # Orchestration
└── README.md           # This file
```

## API Endpoints

### Auth
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login & get JWT cookie
- `GET /auth/me` - Get current user (requires cookie)
- `POST /auth/logout` - Logout (clear cookie)

### Posts
- `GET /posts/` - List published posts (with search & pagination)
- `GET /posts/:id` - Get post detail + comments
- `POST /posts/:id/comments` - Add comment (requires auth)
- `POST /posts/` - Create post (admin only)
- `PUT /posts/:id` - Update post (admin only)
- `DELETE /posts/:id` - Delete post (admin only)

### Categories
- `GET /categories` - List all categories
- `GET /categories/:id` - Get category by ID
- `POST /categories` - Create category (admin only)
- `PUT /categories/:id` - Update category (admin only)
- `DELETE /categories/:id` - Delete category (admin only)

### Saved Posts
- `GET /saved/me` - List user's saved posts (requires auth)
- `POST /saved/posts/:id/save` - Save post (requires auth)
- `DELETE /saved/posts/:id/save` - Unsave post (requires auth)

### Admin
- `GET /admin/posts` - List all posts for admin (admin only)
- `GET /admin/users` - List all users (admin only)

## Default Data

Seeded on startup:
- **Admin user**: `admin@example.com` / `Admin@123`
- **Sample posts**: 2 blog posts (React, Node.js)
- **Sample categories**: General, Programming, Tutorials

## Environment Variables

**Backend** (`.env`):
```
DB_HOST=db
DB_PORT=3306
DB_USER=root
DB_PASSWORD=rootpassword
DB_NAME=blog_db
PORT=4000
JWT_SECRET=your-secret-key
ADMIN_PASSWORD=Admin@123
FRONTEND_URL=http://localhost
COOKIE_SECURE=false
```

## Development

### Backend Development
```bash
cd backend
npm install
npm start   # Requires running MySQL

# Or use Docker
docker compose up -d db backend
docker compose logs -f backend
```

### Frontend Development
- Open `Front-end/index.html` in browser
- Backend must be running on http://localhost:4000

## Testing

### API Testing
```bash
# Login as admin
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin@123"}' \
  -c cookies.txt

# List posts
curl http://localhost:4000/posts/ -b cookies.txt

# Create post
curl -X POST http://localhost:4000/posts \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"title":"Test","excerpt":"Test","content":"Test content","category_id":1,"status":"published"}'
```

## Production Deployment

### Pre-deployment Checklist
1. Set `COOKIE_SECURE=true` in `backend/.env` (requires HTTPS)
2. Change `JWT_SECRET` to a strong random value
3. Update `FRONTEND_URL` to your domain
4. Configure HTTPS in nginx
5. Use strong database password (not `rootpassword`)

### Deployment with Docker Compose
```bash
# Build production images
docker compose -f docker-compose.yml build

# Start services
docker compose up -d

# View logs
docker compose logs -f

# Perform database backup
docker compose exec db mysqldump -u root -prootpassword blog_db > backup.sql

# Restore from backup
docker compose exec -T db mysql -u root -prootpassword blog_db < backup.sql
```

### Using Environment Files
Create `backend/.env` in production with secure values:
```
DB_HOST=db
DB_PORT=3306
DB_USER=root
DB_PASSWORD=<strong-password>
DB_NAME=blog_db
PORT=4000
JWT_SECRET=<strong-random-secret>
ADMIN_PASSWORD=<strong-admin-password>
FRONTEND_URL=https://yourdomain.com
COOKIE_SECURE=true
NODE_ENV=production
```

## Troubleshooting

### Backend won't start
```bash
# Check logs
docker compose logs backend

# Rebuild
docker compose up -d --build backend
```

### Database connection error
```bash
# Ensure db service is healthy
docker compose exec db mysql -u root -prootpassword -e "SELECT 1"

# Check network
docker network ls
```

### Posts not loading
- Ensure backend is running: `docker compose ps`
- Check CORS: Frontend URL must match `FRONTEND_URL` env var
- Verify cookies are enabled in browser

### Admin panel access denied
- Login with admin account: `admin@example.com` / `Admin@123`
- Check browser console for auth errors
- Clear cookies and retry login

## Performance Notes

- Posts list is paginated (default 10/page)
- Search filters by title, excerpt, content
- Database indexes on `posts.status`, `users.email`
- Migrations auto-run on backend startup
- Seeds are idempotent (safe to re-run)

## Security

- Passwords hashed with bcrypt (rounds: 10)
- JWTs signed with HS256
- HttpOnly cookies prevent XSS token theft
- CORS configured for specific origin
- SQL injection protection via parameterized queries (Knex)
- Admin routes protected with middleware

## License

Personal project - Educational use

## Support

For issues or questions, check:
1. Docker logs: `docker compose logs`
2. Backend console for errors
3. Browser developer tools for network requests
4. Adminer (http://localhost:8080) for database inspection

---

**Status**: ✅ Fully functional & ready for deployment
