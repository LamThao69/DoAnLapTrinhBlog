// Trang Bài viết đã lưu
document.addEventListener('DOMContentLoaded', function() {
    // Set active menu item dựa trên trang hiện tại
    setActiveMenu();
    
    // Load các bài viết đã lưu
    loadSavedPosts();
});

// Hàm load bài viết đã lưu
async function loadSavedPosts() {
    const savedPostsContainer = document.getElementById('savedPostsContainer');
    try {
        const resp = await fetch(`${window.API_BASE}/saved/me`, { credentials: 'include' });
        if (!resp.ok) {
            savedPostsContainer.innerHTML = '<p style="text-align:center;color:#999;padding:40px;">Không tải được danh sách đã lưu</p>';
            return;
        }
        const saved = await resp.json();
        if (!saved || saved.length === 0) {
            savedPostsContainer.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">Bạn chưa lưu bài viết nào. Hãy lưu bài viết yêu thích của bạn!</p>';
            return;
        }
        savedPostsContainer.innerHTML = '';
        saved.forEach(post => {
            const blogPostHTML = `
                <article class="blog-post">
                    <div class="blog-content">
                        <h2 class="blog-title" onclick="readFullPost(${post.id})" style="cursor: pointer;">${post.title}</h2>
                        <p class="blog-meta">Published ${new Date(post.published_at || Date.now()).toLocaleDateString('en-US').toUpperCase()} - By ${post.author || ''}</p>
                        <p class="blog-description">${post.excerpt || ''}</p>
                        <div class="blog-actions">
                            <a href="#" class="btn-read-more" onclick="readFullPost(${post.id}); return false;">Đọc toàn bộ bài viết</a>
                            <div class="btn-group">
                                <button type="button" class="btn-like" onclick="likeBlogPost(${post.id}, this)" title="Thích bài viết"><img src="imgs/heart_null.png" alt="Like" style="width: 20px; height: 20px;"></button>
                                <button type="button" class="btn-save" onclick="removeSavedPost(${post.id}, this)" title="Xóa bài viết"><img src="imgs/save.png" alt="Remove" style="width: 20px; height: 20px;"></button>
                            </div>
                        </div>
                    </div>
                    <div class="blog-image">
                        <img src="imgs/anhBlog1.jpg" alt="${post.title}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                </article>
            `;
            savedPostsContainer.innerHTML += blogPostHTML;
        });
    } catch (err) {
        console.error('Load saved error', err);
        savedPostsContainer.innerHTML = '<p style="text-align:center;color:#999;padding:40px;">Lỗi mạng, thử lại sau</p>';
    }
}

// Hàm xóa bài viết đã lưu
async function removeSavedPost(postId, btn) {
    try {
        const resp = await fetch(`${window.API_BASE}/saved/posts/${postId}/save`, { method: 'DELETE', credentials: 'include' });
        if (!resp.ok) throw new Error('Failed to remove');
        alert('Đã xóa bài khỏi danh sách lưu');
        await loadSavedPosts();
    } catch (err) {
        console.error('Remove saved error', err);
        alert('Xóa thất bại');
    }
}
