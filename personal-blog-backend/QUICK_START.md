# Quick Start Guide - Backend

## Bước 1: Cài đặt dependencies
```bash
cd personal-blog-backend
npm install
```

## Bước 2: Cấu hình Database

Tạo file `.env` trong thư mục `personal-blog-backend/`:

```env
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/personal_blog?schema=public"
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

**Lưu ý:** Thay đổi `DATABASE_URL` theo cấu hình database của bạn.

## Bước 3: Setup Prisma Database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations (tạo database tables)
npx prisma migrate dev --name init
```

## Bước 4: Chạy Backend

```bash
npm run dev
```

Backend sẽ chạy tại: **http://localhost:5000**

## Kiểm tra Backend có chạy không:

Mở trình duyệt hoặc dùng curl:
```
http://localhost:5000/health
```

Nếu thấy `{"status":"OK","message":"Server is running"}` thì backend đã chạy thành công!

## Troubleshooting

### Lỗi: "Cannot find module"
- Chạy: `npm install`

### Lỗi: "Prisma Client not generated"
- Chạy: `npx prisma generate`

### Lỗi: "Database connection"
- Kiểm tra file `.env` có đúng `DATABASE_URL` không
- Đảm bảo database server đang chạy

### Lỗi: "Port 5000 already in use"
- Thay đổi PORT trong file `.env` hoặc
- Tắt ứng dụng đang dùng port 5000




