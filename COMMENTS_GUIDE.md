# Hướng dẫn sử dụng chức năng Bình luận

## Tổng quan
Hệ thống bình luận cho phép người dùng đã đăng nhập tạo, xem và xóa bình luận trên các bài viết.

## Cấu trúc Database

### Model Comment
```prisma
model Comment {
  id        Int       @id @default(autoincrement())
  content   String    @db.NVarChar(500)
  createdAt DateTime  @default(now())
  post      Post      @relation(fields: [postId], references: [id], onDelete: Cascade)
  postId    Int
  author    User      @relation(fields: [authorId], references: [id])
  authorId  Int
}
```

- **Relationship**: 
  - 1 bài viết (`Post`) có thể có nhiều bình luận (`Comment`)
  - 1 người dùng (`User`) có thể có nhiều bình luận
  - Khi bài viết bị xóa, tất cả bình luận liên quan cũng bị xóa (onDelete: Cascade)

## API Endpoints

### 1. Tạo bình luận mới
```http
POST /api/posts/:id/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Nội dung bình luận"
}
```

**Response Success (201):**
```json
{
  "comment": {
    "id": 1,
    "content": "Nội dung bình luận",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "postId": 1,
    "authorId": 1,
    "author": {
      "id": 1,
      "email": "user@example.com",
      "displayName": "Tên người dùng",
      "avatar": "url_to_avatar"
    }
  }
}
```

**Validation:**
- Nội dung không được để trống
- Nội dung không được vượt quá 500 ký tự
- Phải đăng nhập (có token)
- Bài viết phải tồn tại

### 2. Lấy danh sách bình luận
```http
GET /api/posts/:id/comments
```

**Response Success (200):**
```json
{
  "comments": [
    {
      "id": 1,
      "content": "Nội dung bình luận",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "authorId": 1,
      "author": {
        "id": 1,
        "email": "user@example.com",
        "displayName": "Tên người dùng",
        "avatar": "url_to_avatar"
      }
    }
  ]
}
```

**Notes:**
- Không cần đăng nhập
- Bình luận được sắp xếp theo thời gian mới nhất trước
- Bao gồm thông tin tác giả: id, email, displayName, avatar

### 3. Xóa bình luận
```http
DELETE /api/posts/:id/comments/:commentId
Authorization: Bearer <token>
```

**Response Success (200):**
```json
{
  "message": "Comment deleted successfully"
}
```

**Authorization:**
- Chỉ tác giả bình luận hoặc admin mới có thể xóa
- Phải đăng nhập (có token)
- Bình luận phải thuộc về bài viết được chỉ định

## Frontend Implementation

### 1. Hiển thị form bình luận
File: `personal-blog-frontend/Front-end/pages/post-detail.html`

```html
<section class="comments-section">
    <h2>Để lại bình luận</h2>
    <form id="commentForm" class="comment-form">
        <textarea placeholder="Nhập bình luận của bạn..." required></textarea>
        <button type="submit" class="btn-submit-comment">Gửi bình luận</button>
    </form>
    <div id="commentsList" class="comments-list"></div>
</section>
```

### 2. JavaScript Functions
File: `personal-blog-frontend/Front-end/scripts/post-detail.js`

**Gửi bình luận:**
```javascript
async function addComment() {
    const textarea = document.querySelector('.comment-form textarea');
    const commentText = textarea.value.trim();
    
    // Validation và gửi request tới API
    const response = await fetch(`http://localhost:5000/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: commentText })
    });
}
```

**Load bình luận:**
```javascript
async function loadComments(postId) {
    const response = await fetch(`http://localhost:5000/api/posts/${postId}/comments`);
    const data = await response.json();
    // Render danh sách bình luận
}
```

**Xóa bình luận:**
```javascript
async function deleteComment(postId, commentId) {
    const response = await fetch(
        `http://localhost:5000/api/posts/${postId}/comments/${commentId}`,
        {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        }
    );
}
```

## Quyền truy cập

### Người dùng chưa đăng nhập
- ✅ Xem danh sách bình luận
- ❌ Tạo bình luận mới
- ❌ Xóa bình luận

### Người dùng đã đăng nhập
- ✅ Xem danh sách bình luận
- ✅ Tạo bình luận mới
- ✅ Xóa bình luận của chính mình
- ❌ Xóa bình luận của người khác

### Admin
- ✅ Xem danh sách bình luận
- ✅ Tạo bình luận mới
- ✅ Xóa bất kỳ bình luận nào

## Kiểm tra chức năng

### 1. Kiểm tra tạo bình luận
1. Đăng nhập vào hệ thống
2. Mở một bài viết
3. Nhập nội dung vào ô bình luận
4. Click "Gửi bình luận"
5. Bình luận mới xuất hiện trong danh sách

### 2. Kiểm tra xem bình luận
1. Mở bất kỳ bài viết nào (có thể chưa đăng nhập)
2. Cuộn xuống phần bình luận
3. Xem danh sách bình luận hiển thị với:
   - Tên/email người dùng
   - Nội dung bình luận
   - Thời gian đăng

### 3. Kiểm tra xóa bình luận
1. Đăng nhập
2. Tìm bình luận của chính mình hoặc đăng nhập bằng admin
3. Click nút "×" trên bình luận
4. Xác nhận xóa
5. Bình luận biến mất khỏi danh sách

## Lưu ý

1. **Giới hạn nội dung**: Bình luận không được vượt quá 500 ký tự
2. **Xác thực**: Luôn kiểm tra token trước khi tạo/xóa bình luận
3. **Cascade Delete**: Khi xóa bài viết, tất cả bình luận cũng bị xóa
4. **Thời gian**: Bình luận hiển thị theo thứ tự mới nhất trước
5. **Authorization**: Kiểm tra quyền xóa bình luận (chỉ tác giả hoặc admin)

## Troubleshooting

### Lỗi "401 Unauthorized"
- Kiểm tra token trong localStorage
- Đăng nhập lại nếu cần

### Lỗi "403 Forbidden" khi xóa
- Bạn không phải tác giả bình luận
- Bạn không phải admin

### Lỗi "404 Not Found"
- Bài viết không tồn tại
- Comment ID không đúng

### Lỗi "400 Bad Request"
- Nội dung bình luận trống
- Nội dung quá dài (>500 ký tự)
- postId hoặc commentId không hợp lệ
