// Trang Bài viết đã lưu
document.addEventListener('DOMContentLoaded', async function() {
    // Set active menu item dựa trên trang hiện tại
    setActiveMenu();
    
    // Load các bài viết đã lưu
    await loadSavedPosts();
    
    // Handle category filter
    const categoryFilters = document.querySelectorAll('.category-filter');
    categoryFilters.forEach(filter => {
        filter.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            if (category === 'all') {
                window.location.href = 'saved-posts.html';
            } else {
                window.location.href = `saved-posts.html?category=${encodeURIComponent(category)}`;
            }
        });
    });
});

// Load bài viết đã lưu từ API
async function loadSavedPosts() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            document.getElementById('savedPostsContainer').innerHTML = 
                '<p style="text-align: center; color: #999; padding: 40px;">Vui lòng <a href="login.html">đăng nhập</a> để xem bài viết đã lưu</p>';
            return;
        }

        const response = await fetch('http://localhost:5000/api/posts/saved', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch saved posts');
        }

        const { posts } = await response.json();

        if (posts.length === 0) {
            document.getElementById('savedPostsContainer').innerHTML = 
                '<p style="text-align: center; color: #999; padding: 40px;">Bạn chưa lưu bài viết nào. <a href="index.html">Khám phá bài viết mới</a></p>';
            return;
        }

        renderSavedPosts(posts);
    } catch (error) {
        console.error('Load saved posts error:', error);
        document.getElementById('savedPostsContainer').innerHTML = 
            '<p style="text-align: center; color: #999; padding: 40px;">Lỗi khi tải bài viết đã lưu</p>';
    }
}

// Render saved posts
function renderSavedPosts(posts) {
    const container = document.getElementById('savedPostsContainer');
    container.innerHTML = '';

    posts.forEach(post => {
        const date = new Date(post.createdAt);
        const formattedDate = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
        const categoryHtml = post.category ? `<span class="blog-category">#${post.category.name}</span>` : '';

        const blogPostHTML = `
            <article class="blog-post">
                <div class="blog-content">
                    <h2 class="blog-title" onclick="readFullPost('${post.slug}')" style="cursor: pointer;">${post.title}</h2>
                    <p class="blog-meta">Published ${formattedDate} - By ${post.author?.displayName || post.author?.email || 'Unknown'}</p>
                    <div class="blog-categories">
                        ${categoryHtml}
                    </div>
                    <p class="blog-description">${post.description || ''}</p>
                    <div class="blog-actions">
                        <button class="btn-read-more" onclick="readFullPost('${post.slug}');">Đọc toàn bộ bài viết</button>
                        <div class="btn-group">
                            <button type="button" class="btn-save saved" onclick="removeSavedPost(${post.id}, this)" title="Xóa bài viết">
                                <img src="../assets/imgs/save.png" alt="Saved" style="width: 20px; height: 20px;">
                            </button>
                        </div>
                    </div>
                </div>
                <div class="blog-image">
                    <img src="${post.image || '../assets/imgs/anhBlog1.jpg'}" alt="${post.title}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
            </article>
        `;
        container.innerHTML += blogPostHTML;
    });
}

// Xóa bài viết đã lưu
async function removeSavedPost(postId, btn) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/posts/${postId}/save`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            alert('Đã xóa bài viết khỏi danh sách lưu');
            await loadSavedPosts();
        } else {
            alert('Lỗi khi xóa bài viết');
        }
    } catch (error) {
        console.error('Remove saved post error:', error);
        alert('Lỗi khi xóa bài viết');
    }
}

// Read full post
function readFullPost(slug) {
    localStorage.setItem('selectedPost', JSON.stringify({ slug }));
    window.location.href = `post-detail.html?slug=${encodeURIComponent(slug)}`;
}

// Set active menu item
function setActiveMenu() {
    const menuItems = document.querySelectorAll('.menu li[data-page]');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    menuItems.forEach(item => {
        item.classList.remove('active');
    });
    
    menuItems.forEach(item => {
        if (item.getAttribute('data-page') === currentPage) {
            item.classList.add('active');
        }
    });

    // Fallback: nếu không tìm thấy, set Trang chủ
    const anyActive = Array.from(menuItems).some(item => item.classList.contains('active'));
    if (!anyActive) {
        menuItems.forEach(item => {
            if (item.getAttribute('data-page') === 'index.html') {
                item.classList.add('active');
            }
        });
    }
}
