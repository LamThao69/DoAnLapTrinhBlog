// Trang Bài viết đã lưu
document.addEventListener('DOMContentLoaded', function() {
    // Set active menu item dựa trên trang hiện tại
    setActiveMenu();
    
    // Load các bài viết đã lưu
    loadSavedPosts();
});

// Hàm load bài viết đã lưu
function loadSavedPosts() {
    const savedPostsContainer = document.getElementById('savedPostsContainer');
    const savedPosts = JSON.parse(localStorage.getItem('savedPosts')) || [];
    
    if (savedPosts.length === 0) {
        savedPostsContainer.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">Bạn chưa lưu bài viết nào. Hãy lưu bài viết yêu thích của bạn!</p>';
        return;
    }
    
    savedPostsContainer.innerHTML = '';
    
    savedPosts.forEach(post => {
        // Render categories
        const categoriesHtml = post.category.map(cat => `<span class="blog-category">#${cat}</span>`).join('');
        
        const blogPostHTML = `
            <article class="blog-post">
                <div class="blog-content">
                    <h2 class="blog-title" onclick="readFullPost(${post.id})" style="cursor: pointer;">${post.title}</h2>
                    <p class="blog-meta">Published ${post.date} - By ${post.author}</p>
                    <div class="blog-categories">
                        ${categoriesHtml}
                    </div>
                    <p class="blog-description">${post.description}</p>
                    <div class="blog-actions">
                        <a href="#" class="btn-read-more" onclick="readFullPost(${post.id}); return false;">Đọc toàn bộ bài viết</a>
                        <div class="btn-group">
                            <button type="button" class="btn-like" onclick="likeBlogPost(${post.id}, this)" title="Thích bài viết"><img src="imgs/heart_null.png" alt="Like" style="width: 20px; height: 20px;"></button>
                            <button type="button" class="btn-save" onclick="removeSavedPost(${post.id}, this)" title="Xóa bài viết"><img src="imgs/save.png" alt="Remove" style="width: 20px; height: 20px;"></button>
                        </div>
                    </div>
                </div>
                <div class="blog-image">
                    <img src="${post.image}" alt="${post.title}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
            </article>
        `;
        savedPostsContainer.innerHTML += blogPostHTML;
    });
}

// Hàm xóa bài viết đã lưu
function removeSavedPost(postId, btn) {
    let savedPosts = JSON.parse(localStorage.getItem('savedPosts')) || [];
    const post = savedPosts.find(p => p.id === postId);
    
    if (post) {
        savedPosts = savedPosts.filter(p => p.id !== postId);
        localStorage.setItem('savedPosts', JSON.stringify(savedPosts));
        btn.classList.remove('saved');
        alert(`Đã xóa bài: "${post.title}" khỏi danh sách lưu`);
        // Reload trang
        loadSavedPosts();
    }
}
