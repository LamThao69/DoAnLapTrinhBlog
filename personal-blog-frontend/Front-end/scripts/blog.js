const API_BASE_URL = 'http://localhost:5000/api';

// Posts array will be loaded from API
let blogPosts = [];

// Helper to map API post to front-end format
function mapApiPostToClient(p) {
    return {
        id: p.id,
        title: p.title,
        author: p.author?.displayName || p.author?.email || 'Unknown',
        date: new Date(p.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase(),
        category: p.category ? [p.category.name] : [],
        image: p.image || '../assets/imgs/anhBlog1.jpg',
        description: p.description || '',
        content: p.content || '',
        slug: p.slug,
        isSaved: p.isSaved || false, // Use the isSaved flag from the API
    };
}

// Render blog posts lên trang
document.addEventListener('DOMContentLoaded', async function() {
    const blogContainer = document.getElementById('blogContainer');

    // Try to load posts from API
    try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        const res = await fetch(`${API_BASE_URL}/posts`, { headers });

        if (!res.ok) throw new Error('Failed to fetch posts');
        const json = await res.json();
        blogPosts = json.posts.map(mapApiPostToClient);
    } catch (err) {
        console.error('Load posts from API failed, falling back to localStorage/static data', err);
        // Fallback: try localStorage
        const stored = localStorage.getItem('blogPosts');
        if (stored) blogPosts = JSON.parse(stored);
    }

    // Check if there's a category query param and filter
    const params = new URLSearchParams(window.location.search);
    const categoryParam = params.get('category');
    if (categoryParam) {
        filterBlogByCategory(categoryParam);
        return;
    }

    if (blogContainer) {
        renderBlogPostsList(blogPosts);
    }
});


// Hàm lưu bài viết qua API
async function saveBlogPost(postId, btn) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Vui lòng đăng nhập để lưu bài viết');
            window.location.href = 'login.html';
            return;
        }

        const isSaved = btn.classList.contains('saved');
        const url = `${API_BASE_URL}/posts/${postId}/save`;
        const method = isSaved ? 'DELETE' : 'POST';

        const response = await fetch(url, {
            method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok) {
            const saved = typeof data.saved === 'boolean' ? data.saved : !isSaved;

            if (saved) {
                btn.classList.add('saved');
                alert('Đã lưu bài viết');
            } else {
                btn.classList.remove('saved');
                alert('Đã bỏ lưu bài viết');
            }
            
            // Update the local post state
            const post = blogPosts.find(p => p.id === postId);
            if(post) {
                post.isSaved = saved;
            }
        } else {
            alert(data.error || 'Lỗi khi lưu bài viết');
        }
    } catch (error) {
        console.error('Save post error:', error);
        alert('Lỗi kết nối đến máy chủ');
    }
}

// Hàm like/unlike bài viết
function likeBlogPost(postId, btn) {
    const post = blogPosts.find(p => p.id === postId);
    if (post) {
        // Lấy bài viết đã like từ localStorage
        let likedPosts = JSON.parse(localStorage.getItem('likedPosts')) || [];
        
        // Kiểm tra xem bài viết đã được like chưa
        const isAlreadyLiked = likedPosts.some(p => p.id === postId);
        
        if (isAlreadyLiked) {
            // Nếu đã like, xóa khỏi danh sách like
            likedPosts = likedPosts.filter(p => p.id !== postId);
            btn.classList.remove('liked');
            btn.querySelector('img').src = '../assets/imgs/heart_null.png';
        } else {
            // Nếu chưa like, thêm vào danh sách like
            likedPosts.push(post);
            btn.classList.add('liked');
            btn.querySelector('img').src = '../assets/imgs/heart.png';
        }
        
        // Lưu vào localStorage
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
        renderBlogPostsList(blogPosts);
    }
}

// Helper function to render blog posts
function renderBlogPostsList(posts) {
    const blogContainer = document.getElementById('blogContainer');
    if (!blogContainer) return;

    if (posts.length === 0) {
        blogContainer.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">Chưa có bài viết nào</p>';
        return;
    }

    blogContainer.innerHTML = '';
    posts.forEach(post => {
        const categoriesHtml = post.category.map(cat => `<span class="blog-category">#${cat}</span>`).join('');
        const savedClass = post.isSaved ? 'saved' : '';

        const blogPostHTML = `
            <article class="blog-post">
                <div class="blog-content">
                    <h2 class="blog-title" onclick="readFullPost('${post.slug}')" style="cursor: pointer;">${post.title}</h2>
                    <p class="blog-meta">Published ${post.date} - By ${post.author}</p>
                    <div class="blog-categories">
                        ${categoriesHtml}
                    </div>
                    <p class="blog-description">${post.description}</p>
                    <div class="blog-actions">
                        <button class="btn-read-more" onclick="readFullPost('${post.slug}');">Đọc toàn bộ bài viết</button>
                        <div class="btn-group">
                            <button type="button" class="btn-like" onclick="likeBlogPost(${post.id}, this)" title="Thích bài viết"><img src="../assets/imgs/heart_null.png" alt="Like" style="width: 20px; height: 20px;"></button>
                            <button type="button" class="btn-save ${savedClass}" onclick="saveBlogPost(${post.id}, this)" title="Lưu bài viết"><img src="../assets/imgs/save.png" alt="Save" style="width: 20px; height: 20px;"></button>
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
    let filteredPosts = blogPosts;
    
    // Nếu category không phải "all", lọc bài viết
    if (category !== 'all') {
        filteredPosts = blogPosts.filter(post => post.category.includes(category));
    }

    if (filteredPosts.length === 0) {
        const blogContainer = document.getElementById('blogContainer');
        if (blogContainer) {
            blogContainer.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">Chưa có bài viết nào trong thể loại này</p>';
        }
        return;
    }

    renderBlogPostsList(filteredPosts);
}

// Hàm search bài viết theo tiêu đề và mô tả
function searchBlog() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.toLowerCase().trim();
    const blogContainer = document.getElementById('blogContainer');
    
    if (!blogContainer) return;
    
    // Nếu search box trống, hiển thị tất cả bài viết
    if (searchTerm === '') {
        renderBlogPostsList(blogPosts);
        return;
    }
    
    // Filter bài viết theo tiêu đề và mô tả
    const filteredPosts = blogPosts.filter(post => 
        post.title.toLowerCase().includes(searchTerm) ||
        post.description.toLowerCase().includes(searchTerm)
    );
    
    // Nếu không có kết quả
    if (filteredPosts.length === 0) {
        blogContainer.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">Không tìm thấy bài viết nào phù hợp với "<strong>' + searchTerm + '</strong>"</p>';
        return;
    }
    
    // Render bài viết tìm được
    renderBlogPostsList(filteredPosts);
}