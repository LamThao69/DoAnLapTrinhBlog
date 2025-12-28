# 🚀 Render Deployment Checklist

## ✅ Files Updated (All Ready)

### Backend
- [x] `knexfile.js` - MySQL → PostgreSQL
- [x] `package.json` - Added `pg` dependency
- [x] `Dockerfile` - postgresql-client instead of mariadb-client
- [x] `entrypoint.sh` - PostgreSQL wait logic
- [x] `backend/.env` - PostgreSQL config
- [x] `src/index.js` - CORS for multiple origins

### Frontend
- [x] `Front-end/config.js` - Dynamic API_BASE URL
- [x] `index.html` - Added config.js script
- [x] `login.html` - Added config.js script
- [x] `register.html` - Added config.js script
- [x] `post-detail.html` - Added config.js script
- [x] `saved-posts.html` - Added config.js script
- [x] `admin.html` - Added config.js script
- [x] `index.js` - Updated all fetch to use `${window.API_BASE}`
- [x] `login.js` - Updated all fetch to use `${window.API_BASE}`
- [x] `blog.js` - Updated all fetch to use `${window.API_BASE}`
- [x] `register.js` - Updated all fetch to use `${window.API_BASE}`
- [x] `post-detail.js` - Updated all fetch to use `${window.API_BASE}`
- [x] `saved-posts.js` - Updated all fetch to use `${window.API_BASE}`
- [x] `admin.js` - Updated all fetch to use `${window.API_BASE}`

### Config Files
- [x] `.env.example` - Template for all variables
- [x] `RENDER_DEPLOYMENT.md` - Detailed guide
- [x] `RENDER_DEPLOY_GUIDE.md` - Step-by-step with Vietnamese

---

## 📝 Quick Deploy Steps

### 1. **Push to GitHub** (1 phút)
```bash
git add -A
git commit -m "Prepare for Render: PostgreSQL + dynamic API config"
git push origin main
```

### 2. **Create PostgreSQL on Render** (5 phút)
- https://render.com → New → PostgreSQL
- Name: blog-db
- User: postgres
- Plan: Free
- **Copy credentials**

### 3. **Deploy Backend** (10 phút)
- https://render.com → New → Web Service
- Select GitHub repo
- Build: `cd backend && npm install`
- Start: `cd backend && npm start`
- Set environment variables (from PostgreSQL + generate JWT_SECRET)
- **Copy backend URL**

### 4. **Deploy Frontend** (5 phút)
- https://render.com → New → Static Site
- Select GitHub repo
- Publish: `Front-end`
- **Copy frontend URL**

### 5. **Update Configs** (2 phút)
- Backend: Set `FRONTEND_URL` environment variable
- Frontend: Update `Front-end/config.js` line 10 with backend URL
- Push changes: `git push`

### 6. **Test** (5 phút)
- Visit https://blog-frontend-xyz.onrender.com
- Register → Login → Create post → Add comment → Save post

**Total time: ~30-45 minutes** ⏱️

---

## 🔐 Important

- **Never commit** `.env` file (has passwords)
- **Generate strong** JWT_SECRET: `openssl rand -base64 32`
- **Update** FRONTEND_URL in backend after frontend deployed
- **Update** API base in frontend after backend deployed
- **Wait 2-3 min** for PostgreSQL creation before using
- **Wait 5-10 min** for backend build/deploy to complete

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Database connection failed | Check DB_HOST, DB_USER, DB_PASSWORD exact match |
| Migrations didn't run | Check Web Service → Logs, verify entrypoint.sh |
| Frontend can't reach backend | Verify FRONTEND_URL in backend, check browser console |
| Slow first load | Normal on free tier (15s cold start), only first time |
| Deployment keeps failing | Check all env vars set, check build logs |

---

## 📊 Cost

| Service | Tier | Cost |
|---------|------|------|
| PostgreSQL | Free | $0 |
| Node.js Backend | Free | $0/month (limited) |
| Static Frontend | Free | $0 |
| **TOTAL** | **Free** | **$0/month** |

**When to upgrade:**
- Traffic exceeds ~500 hours/month
- Need faster cold starts
- Need more database storage (>256MB)

---

## ✨ Result

After deployment:
- Blog accessible at: `https://blog-frontend-xyz.onrender.com`
- Admin panel at: `https://blog-frontend-xyz.onrender.com/admin.html`
- API at: `https://blog-backend-xyz.onrender.com`
- Database: PostgreSQL on Render
- SSL/HTTPS: Automatic
- Auto-redeploy: On every git push

**Your blog is now on the internet!** 🎉

---

*Last updated: Dec 29, 2025*
*Ready for production deployment*
