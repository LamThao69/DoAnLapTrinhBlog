# ✅ Render Deployment Ready - PostgreSQL Edition

Bạn ơi! Mình vừa hoàn toàn update project để sẵn sàng deploy lên **Render** với **PostgreSQL** miễn phí! 🚀

## 📋 What Changed (Những thay đổi)

### 1. **Database: MySQL → PostgreSQL** 
- `knexfile.js`: Changed `client: 'mysql2'` → `client: 'pg'`
- `package.json`: Changed `mysql2` → `pg` dependency
- `migrations/20251228_init_schema.js`: Uses PostgreSQL syntax
- `.env`: Changed `DB_PORT` from 3306 → 5432
- `Dockerfile`: Changed `mariadb-client` → `postgresql-client`
- `entrypoint.sh`: Changed MySQL wait to `psql` check

### 2. **Frontend: Dynamic API Configuration**
- Created `Front-end/config.js` - tự động detect API base URL:
  - **Dev**: http://localhost:4000
  - **Production on Render**: https://blog-backend-xyz.onrender.com
- Updated ALL HTML files to load `config.js` first
- Updated ALL JS files (index.js, login.js, blog.js, register.js, post-detail.js, saved-posts.js, admin.js):
  - Changed `/auth/me` → `${window.API_BASE}/auth/me`
  - Changed `/posts/` → `${window.API_BASE}/posts/`
  - Changed `/categories` → `${window.API_BASE}/categories`
  - And all other endpoints...

### 3. **CORS Configuration**
- Updated `backend/src/index.js` to support multiple origins (localhost, 127.0.0.1, and frontend URL)

### 4. **Environment Files**
- `.env.example` - Template with all required variables
- `backend/.env` - Updated with PostgreSQL config

## 🎯 Next Steps để Deploy (Chi tiết)

### **Step 1: Push to GitHub**

```bash
cd d:\GitHubDesktop\DoAnLapTrinhBlog
git add -A
git commit -m "Prepare for Render deployment: PostgreSQL + dynamic API config"
git push origin main
```

### **Step 2: Create Render Account**

Go to https://render.com
- Sign up with GitHub (để dễ dàng deploy)
- Verify email

### **Step 3: Create PostgreSQL Database**

1. Click **New +** → **PostgreSQL**
2. Fill:
   - **Name**: `blog-db`
   - **Database**: `blog`
   - **User**: `postgres`
   - **Region**: Singapore (hoặc gần Việt Nam nhất)
   - **Plan**: Free ✅
3. Click **Create**
4. **Wait 2-3 minutes** cho DB ready
5. **Copy lại:**
   - **Hostname** (e.g., `dpg-xxx.c.render.com`)
   - **Port** (5432)
   - **User** (postgres)
   - **Password** (copy lại từ dashboard)

### **Step 4: Deploy Backend**

1. Click **New +** → **Web Service**
2. Select GitHub repo → `DoAnLapTrinhBlog`
3. Fill:
   - **Name**: `blog-backend`
   - **Runtime**: Node
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free
4. **Don't click deploy yet** - cần set environment variables trước!

### **Step 5: Configure Environment Variables**

1. Trên Render dashboard → **Settings** → **Environment**
2. Add variables:

```
DB_HOST=dpg-xxx.c.render.com                    (← từ PostgreSQL step)
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password_here                  (← từ PostgreSQL step)
DB_NAME=blog
JWT_SECRET=your-super-secret-key-here           (← generate: openssl rand -base64 32)
ADMIN_PASSWORD=Admin@123
FRONTEND_URL=https://blog-frontend-xyz.onrender.com  (← sẽ cập nhật sau)
COOKIE_SECURE=true
NODE_ENV=production
```

3. Click **Deploy** → Chờ 5-10 phút build xong
4. Copy **Service URL** (e.g., `https://blog-backend-xyz.onrender.com`)

### **Step 6: Deploy Frontend**

1. Click **New +** → **Static Site**
2. Select GitHub repo → `DoAnLapTrinhBlog`
3. Fill:
   - **Name**: `blog-frontend`
   - **Build Command**: (leave empty - no build needed)
   - **Publish Directory**: `Front-end`
   - **Plan**: Free
4. Click **Create**
5. Copy **URL** (e.g., `https://blog-frontend-xyz.onrender.com`)

### **Step 7: Update Backend FRONTEND_URL**

1. Go back to **blog-backend** Web Service
2. **Settings** → **Environment**
3. Update `FRONTEND_URL=https://blog-frontend-xyz.onrender.com` (← từ Step 6)
4. Click **Save** → Auto-redeploy

### **Step 8: Update Frontend API Config**

File: `Front-end/config.js` - Line 10:

```javascript
const renderBackendUrl = 'https://blog-backend-xyz.onrender.com'; // ← UPDATE THIS
```

Replace `blog-backend-xyz` với actual backend service name từ Render.

### **Step 9: Push Changes**

```bash
git add Front-end/config.js
git commit -m "Update Render backend URL in frontend config"
git push origin main
```

Frontend auto-redeploy từ Render!

### **Step 10: Test**

Visit: `https://blog-frontend-xyz.onrender.com`

1. **Register** new account
2. **Login**
3. **Create post** (admin)
4. **View posts**
5. **Add comment**
6. **Save post**

All should work! ✅

## ⚙️ Important Notes

### **Cold Start (15s spin-up)**
- Render free tier "sleeps" after 15 phút không dùng
- First request sẽ chậm ~15s khi spin up
- This is normal on free tier - đó là trade-off cho miễn phí

### **Database Credentials**
- Keep password safe! Don't commit `.env` to GitHub
- Render `.env` variables are encrypted

### **Auto-Redeploy**
- Every `git push` → Render auto-builds and deploys
- Takes 3-5 phút

### **Monitoring**
- Go to Web Service → **Logs** để xem errors
- Check PostgreSQL health in Database dashboard

### **Upgrade to Paid (if needed)**
- Free tier có limits: 256MB DB, ~500h runtime/month
- Click **Upgrade** in Render dashboard để scale up

## 🔗 Useful Links

- Render Dashboard: https://dashboard.render.com
- PostgreSQL Docs: https://www.postgresql.org/docs/
- Node.js with Render: https://render.com/docs/deploy-node-express-app

## 📱 What if something goes wrong?

**Backend won't start?**
- Check logs: Web Service → Logs
- Common issues:
  - Database not connected: verify DB_HOST, DB_PASSWORD
  - Missing migrations: check entrypoint.sh ran migrations
  - Port conflict: change PORT in env vars

**Frontend can't reach backend?**
- Check network tab in browser DevTools
- Verify FRONTEND_URL in backend matches frontend domain
- Check CORS errors in console
- Verify `window.API_BASE` in browser console

**Database connection error?**
- Verify PostgreSQL service status in Render
- Check credentials exact match
- Try database query tool in Render dashboard

## 🎊 Result

Bạn sẽ có:
- ✅ Blog live on internet (miễn phí)
- ✅ PostgreSQL database (miễn phí)
- ✅ Node.js backend (miễn phí, với 15s cold start)
- ✅ Static frontend (miễn phí)
- ✅ SSL/HTTPS tự động
- ✅ Auto-redeploy từ git push

**Total cost: $0/month** 💰

---

**Bạn cần help chỗ nào không? Mình sẵn sàng assist!** 🚀
