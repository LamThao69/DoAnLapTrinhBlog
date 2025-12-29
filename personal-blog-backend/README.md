# Personal Blog Backend

## Cấu hình Port

- **Backend API**: Port **5000** (http://localhost:5000)
- **Frontend**: Port **3000** (http://localhost:3000)

## Cài đặt và chạy

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Cấu hình Database
Tạo file `.env` trong thư mục `personal-blog-backend/`:
```env
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/personal_blog?schema=public"
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
```

### 3. Setup Prisma Database
```bash
npx prisma generate
npx prisma migrate dev
```

### 4. Chạy Backend (Development)
```bash
npm run dev
```

Backend sẽ chạy tại: http://localhost:5000

## API Endpoints

- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user (cần token)
- `GET /health` - Health check

## CORS Configuration

Backend đã được cấu hình để cho phép requests từ:
- http://localhost:3000 (Frontend)
- http://127.0.0.1:3000




