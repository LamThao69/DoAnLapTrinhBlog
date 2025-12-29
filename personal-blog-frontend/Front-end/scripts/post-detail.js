// Global variable to store current post ID
let currentPostId = null;

// Post Detail Page
document.addEventListener('DOMContentLoaded', async function() {
    // Set active menu item dựa trên trang hiện tại
    setActiveMenu();
    
    const postDetail = document.getElementById('postDetail');
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');

    let selectedPost = null;

    if (slug) {
        // Try to fetch from API
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            const res = await fetch(`http://localhost:5000/api/posts/${encodeURIComponent(slug)}`, { headers });

            if (res.ok) {
                const json = await res.json();
                selectedPost = json.post;
                // Store post ID globally
                currentPostId = selectedPost.id;
                
                // Map fields to expected structure
                selectedPost = {
                    id: selectedPost.id,
                    title: selectedPost.title,
                    author: selectedPost.author?.displayName || selectedPost.author?.email || 'Unknown',
                    date: new Date(selectedPost.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase(),
                    category: selectedPost.category ? [selectedPost.category.name] : [],
                    image: selectedPost.image || '../assets/imgs/anhBlog1.jpg',
                    description: selectedPost.description || '',
                    content: selectedPost.content || '',
                    slug: selectedPost.slug,
                    isSaved: selectedPost.isSaved || false, // Use the isSaved flag from the API
                };
                localStorage.setItem('selectedPost', JSON.stringify(selectedPost));
            } else {
                console.error('Post not found on server');
                postDetail.innerHTML = '<p style="text-align: center; color: #999;">Bài viết không tồn tại hoặc đã bị xóa.</p>';
            }
        } catch (err) {
            console.error('Failed to fetch post from API', err);
            postDetail.innerHTML = '<p style="text-align: center; color: #f00;">Lỗi kết nối đến máy chủ. Vui lòng thử lại sau.</p>';
        }
    }

    if (selectedPost && postDetail) {
        // Render categories
        const categoriesHtml = selectedPost.category.map(cat => `<span class="post-detail-category">#${cat}</span>`).join('');
        const savedClass = selectedPost.isSaved ? 'saved' : '';
        const savedText = selectedPost.isSaved ? 'Đã lưu' : 'Lưu bài viết';

        const postHTML = `
            <h1 class="post-detail-title">${selectedPost.title}</h1>
            <p class="post-detail-meta">
                PUBLISHED ${selectedPost.date} - BY <span class="post-detail-author">${selectedPost.author}</span>
            </p>
            <div class="post-detail-categories">
                ${categoriesHtml}
            </div>
            <div class="post-detail-actions">
                <button id="savePostBtn" class="btn-save-post ${savedClass}">
                    <img src="../assets/imgs/save.png" alt="Save" style="width: 20px; height: 20px;">
                    <span>${savedText}</span>
                </button>
            </div>
            <div class="post-detail-image">
                <img src="${selectedPost.image}" alt="${selectedPost.title}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div class="post-detail-content">
                <p>${selectedPost.description}</p>
                <p>${selectedPost.content}</p>
                <p>
                    Đây là nội dung chi tiết của bài viết "${selectedPost.title}". 
                    Bạn có thể sửa nội dung này trong phần quản lý bài viết hoặc kết nối với database để lưu trữ nội dung thực tế.
                </p>
            </div>
        `;

        postDetail.innerHTML = postHTML;

        // Add save button event listener
        const saveBtn = document.getElementById('savePostBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', async function() {
                await toggleSavePost(selectedPost.id);
            });
        }

        // Update page title
        document.title = selectedPost.title + ' - Green&&Blue';
    } else if (!selectedPost && postDetail) {
        // This handles the case where the slug was present, but the fetch failed
        // and an error message was already printed inside the try/catch.
        // If there was no slug, show a generic 'not found' message.
        if (!slug) {
            postDetail.innerHTML = '<p style="text-align: center; color: #999;">Không tìm thấy bài viết.</p>';
        }
    }
    
    // Render comment form based on login status
    renderCommentForm();
    
    // Handle category filter - navigate to home with category filter
    const categoryFilters = document.querySelectorAll('.category-filter');
    categoryFilters.forEach(filter => {
        filter.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            // Navigate to index.html with category param
            if (category === 'all') {
                window.location.href = 'index.html';
            } else {
                window.location.href = `index.html?category=${encodeURIComponent(category)}`;
            }
        });
    });
    
    // Load comments - use global currentPostId instead of localStorage
    if (currentPostId) {
        loadComments(currentPostId);
    }
});

// Hàm render form bình luận dựa trên trạng thái đăng nhập
function renderCommentForm() {
    const commentFormContainer = document.getElementById('commentFormContainer');
    if (!commentFormContainer) return;
    
    const token = localStorage.getItem('token');
    
    if (token) {
        // User is logged in - show comment form
        commentFormContainer.innerHTML = `
            <form id="commentForm" class="comment-form">
                <textarea placeholder="Nhập bình luận của bạn..." required></textarea>
                <button type="submit" class="btn-submit-comment">Gửi bình luận</button>
            </form>
        `;
        
        // Add event listener for form submission
        const commentForm = document.getElementById('commentForm');
        if (commentForm) {
            commentForm.addEventListener('submit', function(e) {
                e.preventDefault();
                addComment();
            });
        }
    } else {
        // User is not logged in - show login prompt
        commentFormContainer.innerHTML = `
            <div class="login-prompt">
                <p style="text-align: center; color: #666; margin: 20px 0;">
                    <img src="../assets/imgs/account.png" alt="Login" style="width: 40px; height: 40px; opacity: 0.5; margin-bottom: 10px;">
                    <br>
                    Vui lòng <a href="login.html" style="color: #2196F3; font-weight: 600;">đăng nhập</a> để bình luận
                </p>
            </div>
        `;
    }
}

// Hàm thêm bình luận
async function addComment() {
    const textarea = document.querySelector('.comment-form textarea');
    const commentText = textarea.value.trim();
    
    if (!commentText) {
        alert('Vui lòng nhập bình luận');
        return;
    }
    
    // Check login
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Vui lòng đăng nhập để bình luận');
        window.location.href = 'login.html';
        return;
    }
    
    // Use global currentPostId instead of localStorage
    if (!currentPostId) {
        alert('Không tìm thấy bài viết');
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:5000/api/posts/${currentPostId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content: commentText })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Reset form
            textarea.value = '';
            // Reload comments
            loadComments(currentPostId);
            alert('Bình luận đã được gửi!');
        } else {
            alert(data.error || 'Lỗi khi gửi bình luận');
        }
    } catch (error) {
        console.error('Comment error:', error);
        alert('Lỗi kết nối đến máy chủ');
    }
}

// Hàm load bình luận
async function loadComments(postId) {
    const commentsList = document.getElementById('commentsList');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!postId || !commentsList) return;
    
    try {
        const response = await fetch(`http://localhost:5000/api/posts/${postId}/comments`);
        const data = await response.json();
        
        if (!response.ok) {
            commentsList.innerHTML = '<p style="color: #f00; text-align: center;">Lỗi khi tải bình luận</p>';
            return;
        }
        
        const comments = data.comments || [];
        
        if (comments.length === 0) {
            commentsList.innerHTML = '<p style="color: #999; text-align: center;">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>';
            return;
        }
        
        commentsList.innerHTML = '';
        comments.forEach(comment => {
            const isCommentAuthor = currentUser && currentUser.id === comment.authorId;
            const isAdmin = currentUser && currentUser.role === 'ADMIN';
            const canDelete = isCommentAuthor || isAdmin;
            
            const authorName = comment.author?.displayName || comment.author?.email?.split('@')[0] || 'Anonymous';
            // Handle avatar: use from API or default, avoid loading from wrong URL
            let authorAvatar = '../assets/imgs/account.png';
            if (comment.author?.avatar) {
                // Check if it's a base64 image or a valid URL
                if (comment.author.avatar.startsWith('data:image') || 
                    comment.author.avatar.startsWith('http://') || 
                    comment.author.avatar.startsWith('https://')) {
                    authorAvatar = comment.author.avatar;
                }
            }
            const commentDate = new Date(comment.createdAt).toLocaleString('vi-VN');
            
            const commentHTML = `
                <div class="comment-item" data-comment-id="${comment.id}">
                    <div class="comment-header">
                        <img src="${authorAvatar}" alt="${authorName}" class="comment-avatar" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;" onerror="this.src='../assets/imgs/account.png'">
                        <div class="comment-info">
                            <div class="comment-author">${authorName}</div>
                            <div class="comment-date">${commentDate}</div>
                        </div>
                        ${canDelete ? `<button class="btn-delete-comment" onclick="deleteComment(${postId}, ${comment.id})" title="Xóa bình luận">×</button>` : ''}
                    </div>
                    <div class="comment-text">${comment.content}</div>
                </div>
            `;
            commentsList.innerHTML += commentHTML;
        });
    } catch (error) {
        console.error('Load comments error:', error);
        commentsList.innerHTML = '<p style="color: #f00; text-align: center;">Lỗi kết nối đến máy chủ</p>';
    }
}

// Hàm xóa bình luận
async function deleteComment(postId, commentId) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Vui lòng đăng nhập');
        return;
    }
    
    if (!confirm('Bạn có chắc muốn xóa bình luận này?')) {
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:5000/api/posts/${postId}/comments/${commentId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            loadComments(postId);
            alert('Bình luận đã được xóa!');
        } else {
            alert(data.error || 'Lỗi khi xóa bình luận');
        }
    } catch (error) {
        console.error('Delete comment error:', error);
        alert('Lỗi kết nối đến máy chủ');
    }
}

// Hàm set active menu item dựa trên trang hiện tại
function setActiveMenu() {
    const menuItems = document.querySelectorAll('.menu li[data-page]');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Xóa active class từ tất cả menu items
    menuItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // Set active cho menu item phù hợp
    let activeMenu = null;
    
    // Nếu đang ở post-detail hoặc account, set Trang chủ là active
    let pageToMatch = currentPage;
    if (currentPage === 'post-detail.html' || currentPage === 'account.html') {
        pageToMatch = 'index.html';
    }
    
    // Tìm menu item có data-page trùng với trang hiện tại
    menuItems.forEach(item => {
        if (item.getAttribute('data-page') === pageToMatch) {
            activeMenu = item;
        }
    });
    
    // Thêm active class
    if (activeMenu) {
        activeMenu.classList.add('active');
    } else {
        // Fallback: nếu không tìm được, set Trang chủ
        menuItems.forEach(item => {
            if (item.getAttribute('data-page') === 'index.html') {
                item.classList.add('active');
            }
        });
    }
}
// Hàm toggle save post
async function toggleSavePost(postId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Vui lòng đăng nhập để lưu bài viết');
            window.location.href = 'login.html';
            return;
        }

        const saveBtn = document.getElementById('savePostBtn');
        const isSaved = saveBtn.classList.contains('saved');

        const url = `http://localhost:5000/api/posts/${postId}/save`;
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
            const textSpan = saveBtn.querySelector('span');

            if (saved) {
                saveBtn.classList.add('saved');
                if(textSpan) textSpan.textContent = 'Đã lưu';
            } else {
                saveBtn.classList.remove('saved');
                if(textSpan) textSpan.textContent = 'Lưu bài viết';
            }
        } else {
            const error = data || {};
            alert(error.error || 'Lỗi khi lưu bài viết');
        }
    } catch (error) {
        console.error('Save post error:', error);
        alert('Lỗi khi lưu bài viết');
    }
}