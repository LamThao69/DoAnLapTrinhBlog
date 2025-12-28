// Load and render posts from backend API
let blogPosts = [];

async function loadPostsFromAPI() {
    try {
        const resp = await fetch(`${window.API_BASE}/posts/`);
        if (!resp.ok) throw new Error('Failed to fetch posts');
        const posts = await resp.json();
        // Map backend shape to frontend shape
        blogPosts = posts.map((p, idx) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            author: p.author || 'Unknown',
            date: new Date(p.published_at || Date.now()).toLocaleDateString('en-US').toUpperCase(),
            category: p.category ? [p.category] : [],
            image: `imgs/anhBlog${(idx % 4) + 1}.jpg`, // fallback local images
            description: p.excerpt || '',
            content: p.content || ''
        }));
        renderBlogPosts();
    } catch (err) {
        console.error('Error loading posts', err);
        const blogContainer = document.getElementById('blogContainer');
        if (blogContainer) blogContainer.innerHTML = '<p style="text-align:center;color:#999;padding:40px;">Không tải được bài viết, thử tải lại</p>';
    }
}

// Render blog posts on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    loadPostsFromAPI();
});

// Hàm xem bài viết đầy đủ
function readFullPost(postId) {
    window.location.href = `post-detail.html?id=${postId}`;
}

// Hàm lưu bài viết (gọi backend saved endpoints). btn is the button element
async function saveBlogPost(postId, btn) {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
        alert('Vui lòng đăng nhập để lưu bài viết');
        return;
    }
    try {
        // Toggle: try to save, if already saved endpoint will ignore, but we need to check current saved state
        // For simplicity, call GET /saved/me to decide
        const savedResp = await fetch(`${window.API_BASE}/saved/me`, { credentials: 'include' });
        let saved = [];
        if (savedResp.ok) saved = await savedResp.json();
        const isSaved = saved.some(s => s.id === postId);
        if (isSaved) {
            await fetch(`${window.API_BASE}/saved/posts/${postId}/save`, { method: 'DELETE', credentials: 'include' });
            btn.classList.remove('saved');
            alert('Đã xóa khỏi danh sách lưu');
        } else {
            await fetch(`${window.API_BASE}/saved/posts/${postId}/save`, { method: 'POST', credentials: 'include' });
            btn.classList.add('saved');
            alert('Đã lưu bài viết');
        }
    } catch (err) {
        console.error('Save post error', err);
        alert('Lưu bài thất bại, thử lại');
    }
}

// Hàm like/unlike bài viết (client-side only - không cần backend)
function likeBlogPost(postId, btn) {
    const post = blogPosts.find(p => p.id === postId);
    if (post) {
        let likedPosts = JSON.parse(localStorage.getItem('likedPosts')) || [];
        const isAlreadyLiked = likedPosts.some(p => p.id === postId);
        
        if (isAlreadyLiked) {
            likedPosts = likedPosts.filter(p => p.id !== postId);
            btn.classList.remove('liked');
            btn.querySelector('img').src = 'imgs/heart_null.png';
        } else {
            likedPosts.push(post);
            btn.classList.add('liked');
            btn.querySelector('img').src = 'imgs/heart.png';
        }
        
        localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
    }
}

// Hàm thêm bài viết mới (cho admin sau)
function addBlogPost(post) {
    blogPosts.push(post);
    // Lưu vào localStorage
    localStorage.setItem('blogPosts', JSON.stringify(blogPosts));
    // Không reload trang tự động, render lại thay vì
    renderBlogPosts();
}

// Hàm xóa bài viết (cho admin sau)
function deleteBlogPost(postId) {
    const index = blogPosts.findIndex(p => p.id === postId);
    if (index > -1) {
        blogPosts.splice(index, 1);
        localStorage.setItem('blogPosts', JSON.stringify(blogPosts));
        renderBlogPosts();
    }
}

// Hàm render lại bài viết
function renderBlogPosts() {
    const blogContainer = document.getElementById('blogContainer');
    if (blogContainer) {
        blogContainer.innerHTML = '';
        blogPosts.forEach(post => {
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
                                <button type="button" class="btn-save" onclick="saveBlogPost(${post.id}, this)" title="Lưu bài viết"><img src="imgs/save.png" alt="Save" style="width: 20px; height: 20px;"></button>
                            </div>
                        </div>
                    </div>
                    <div class="blog-image">
                        <img src="${post.image}" alt="${post.title}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                </article>
            `;
            blogContainer.innerHTML += blogPostHTML;
        });
    }
}

// Load blog posts từ localStorage nếu có
function loadBlogPostsFromStorage() {
    const stored = localStorage.getItem('blogPosts');
    if (stored) {
        return JSON.parse(stored);
    }
    return blogPosts;
}

// Hàm lọc bài viết theo thể loại
function filterBlogByCategory(category) {
    const blogContainer = document.getElementById('blogContainer');
    if (!blogContainer) return;
    
    let filteredPosts = blogPosts;
    
    // Nếu category không phải "all", lọc bài viết
    if (category !== 'all') {
        filteredPosts = blogPosts.filter(post => post.category.includes(category));
    }
    
    // Xóa các bài viết cũ
    blogContainer.innerHTML = '';
    
    // Render bài viết đã lọc
    if (filteredPosts.length === 0) {
        blogContainer.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">Chưa có bài viết nào trong thể loại này</p>';
        return;
    }
    
    filteredPosts.forEach(post => {
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
                            <button type="button" class="btn-save" onclick="saveBlogPost(${post.id}, this)" title="Lưu bài viết"><img src="imgs/save.png" alt="Save" style="width: 20px; height: 20px;"></button>
                        </div>
                    </div>
                </div>
                <div class="blog-image">
                    <img src="${post.image}" alt="${post.title}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
            </article>
        `;
        blogContainer.innerHTML += blogPostHTML;
    });
}
// Hàm search bài viết
function searchBlog() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.toLowerCase().trim();
    const blogContainer = document.getElementById('blogContainer');
    
    if (!blogContainer) return;
    
    // Nếu search box trống, hiển thị tất cả bài viết
    if (searchTerm === '') {
        renderBlogPosts();
        return;
    }
    
    // Filter bài viết theo tiêu đề
    const filteredPosts = blogPosts.filter(post => 
        post.title.toLowerCase().includes(searchTerm)
    );
    
    blogContainer.innerHTML = '';
    
    // Nếu không có kết quả
    if (filteredPosts.length === 0) {
        blogContainer.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">Không tìm thấy bài viết nào phù hợp với "<strong>' + searchTerm + '</strong>"</p>';
        return;
    }
    
    // Render bài viết tìm được
    filteredPosts.forEach(post => {
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
                            <button type="button" class="btn-save" onclick="saveBlogPost(${post.id}, this)" title="Lưu bài viết"><img src="imgs/save.png" alt="Save" style="width: 20px; height: 20px;"></button>
                        </div>
                    </div>
                </div>
                <div class="blog-image">
                    <img src="${post.image}" alt="${post.title}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
            </article>
        `;
        blogContainer.innerHTML += blogPostHTML;
    });
}