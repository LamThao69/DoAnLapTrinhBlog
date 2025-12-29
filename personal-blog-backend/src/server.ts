import app from './app';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
  console.log(`📝 API endpoints:`);
  console.log(`   === AUTH ===`);
  console.log(`   POST /api/auth/register - Đăng ký`);
  console.log(`   POST /api/auth/login - Đăng nhập`);
  console.log(`   GET  /api/auth/me - Lấy thông tin user (cần token)`);
  console.log(`   PUT  /api/auth/me - Cập nhật profile (cần token)`);
  console.log(`   PUT  /api/auth/change-password - Đổi mật khẩu (cần token)`);
  console.log(`   === POSTS ===`);
  console.log(`   GET    /api/posts - Lấy danh sách bài viết`);
  console.log(`   GET    /api/posts/:slug - Lấy chi tiết bài viết`);
  console.log(`   POST   /api/posts - Tạo bài viết mới (cần token)`);
  console.log(`   PUT    /api/posts/:id - Cập nhật bài viết (cần token)`);
  console.log(`   DELETE /api/posts/:id - Xóa bài viết (cần token)`);
  console.log(`   POST   /api/posts/:id/save - Lưu bài viết (cần token)`);
  console.log(`   DELETE /api/posts/:id/save - Bỏ lưu bài viết (cần token)`);
  console.log(`   GET    /api/posts/saved - Lấy bài viết đã lưu (cần token)`);
});

