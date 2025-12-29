# Personal Blog Frontend

## Cách chạy Frontend

Có nhiều cách để test frontend của bạn:

### Cách 1: Sử dụng Python (Đơn giản nhất)

1. Mở Terminal/PowerShell
2. Di chuyển vào thư mục `Front-end`:
   ```bash
   cd personal-blog-frontend/Front-end
   ```
3. Chạy lệnh:
   ```bash
   cd pages
   python -m http.server 8080
   ```
4. Mở trình duyệt và truy cập: `http://localhost:8080`

### Cách 2: Sử dụng Node.js (http-server)

1. Cài đặt http-server (nếu chưa có):
   ```bash
   npm install -g http-server
   ```
2. Chạy lệnh:
   ```bash
   cd pages
   http-server -p 8080 -o
   ```
   Hoặc sử dụng npx (không cần cài đặt):
   ```bash
   npx http-server pages -p 8080 -o
   ```

### Cách 3: Sử dụng npm script

1. Chạy lệnh:
   ```bash
   npm start
   ```
   Hoặc:
   ```bash
   npm run dev
   ```

### Cách 4: Sử dụng script tự động (Windows)

1. Double-click vào file `start-server.bat`
2. Hoặc chạy trong PowerShell:
   ```powershell
   .\start-server.ps1
   ```

### Cách 5: Sử dụng VS Code Live Server Extension

1. Cài đặt extension "Live Server" trong VS Code
2. Click chuột phải vào file `pages/index.html`
3. Chọn "Open with Live Server"

### Cách 6: Sử dụng PHP (nếu đã cài)

```bash
cd pages
php -S localhost:8080
```

## Lưu ý

- Đảm bảo bạn truy cập từ thư mục `pages/` vì các file HTML nằm trong đó
- Port mặc định là 8080, bạn có thể thay đổi nếu port này đã được sử dụng
- Sau khi server chạy, mở trình duyệt và truy cập: `http://localhost:8080/index.html`

## Cấu trúc thư mục

```
Front-end/
├── pages/          # Các file HTML (điểm bắt đầu)
├── styles/         # Các file CSS
├── scripts/        # Các file JavaScript
└── assets/         # Các file tĩnh (hình ảnh, etc.)
    └── imgs/
```




