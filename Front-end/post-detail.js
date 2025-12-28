// Post Detail Page
document.addEventListener('DOMContentLoaded', function() {
    // Set active menu item dựa trên trang hiện tại
    setActiveMenu();
    
    const query = new URLSearchParams(window.location.search);
    const id = query.get('id');
    const postDetail = document.getElementById('postDetail');
    if (!id || !postDetail) {
        if (postDetail) postDetail.innerHTML = '<p style="text-align:center;color:#999;">Không tìm thấy bài viết</p>';
        return;
    }

    // Fetch post detail from backend
    try {
        const resp = await fetch(`${window.API_BASE}/posts/${id}`);
        if (!resp.ok) {
            postDetail.innerHTML = '<p style="text-align:center;color:#999;">Không tìm thấy bài viết</p>';
            return;
        }
        const data = await resp.json();
        const selectedPost = data.post;
        const comments = data.comments || [];

        const categoriesHtml = selectedPost.category ? (Array.isArray(selectedPost.category) ? selectedPost.category.map(cat => `<span class="post-detail-category">#${cat}</span>`).join('') : `<span class="post-detail-category">#${selectedPost.category}</span>`) : '';

        const postHTML = `
            <h1 class="post-detail-title">${selectedPost.title}</h1>
            <p class="post-detail-meta">
                PUBLISHED ${new Date(selectedPost.published_at || Date.now()).toLocaleDateString('en-US').toUpperCase()} - BY <span class="post-detail-author">${selectedPost.author || ''}</span>
            </p>
            <div class="post-detail-categories">
                ${categoriesHtml}
            </div>
            <div class="post-detail-image">
                <img src="imgs/anhBlog1.jpg" alt="${selectedPost.title}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div class="post-detail-content">
                <p>${selectedPost.excerpt || ''}</p>
                <p>${selectedPost.content || ''}</p>
            </div>
        `;

        postDetail.innerHTML = postHTML;
        document.title = selectedPost.title + ' - Green&&Blue';

        // Render comments
        const commentsList = document.getElementById('commentsList');
        if (commentsList) {
            localRenderComments(comments);
        }

        // Bind comment submit
        const commentForm = document.getElementById('commentForm');
        if (commentForm) {
            commentForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                const textarea = document.querySelector('.comment-form textarea');
                const content = textarea.value.trim();
                if (!content) { alert('Vui lòng nhập bình luận'); return; }
                try {
                    const r = await fetch(`${window.API_BASE}/posts/${id}/comments`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }) });
                    if (!r.ok) {
                        const err = await r.json().catch(()=>({}));
                        alert(err.message || 'Gửi bình luận thất bại');
                        return;
                    }
                    textarea.value = '';
                    // reload comments
                    const refreshed = await fetch(`${window.API_BASE}/posts/${id}`);
                    const newData = await refreshed.json();
                    localRenderComments(newData.comments || []);
                    alert('Bình luận đã được gửi!');
                } catch (err) {
                    console.error(err);
                    alert('Lỗi mạng, thử lại');
                }
            });
        }

    } catch (err) {
        console.error('Post load error', err);
        postDetail.innerHTML = '<p style="text-align:center;color:#999;">Không tải được bài viết</p>';
    }

    function localRenderComments(comments) {
        const commentsList = document.getElementById('commentsList');
        if (!commentsList) return;
        if (!comments || comments.length === 0) {
            commentsList.innerHTML = '<p style="color: #999; text-align: center;">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>';
            return;
        }
        commentsList.innerHTML = '';
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        comments.forEach((c, index) => {
            const isCommentAuthor = currentUser && currentUser.id === c.user_id;
            const commentHTML = `
                <div class="comment-item">
                    <div class="comment-header">
                        <img src="imgs/account.png" alt="${c.user_id}" class="comment-avatar" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;">
                        <div class="comment-info">
                            <div class="comment-author">${c.user_id}</div>
                            <div class="comment-date">${new Date(c.created_at).toLocaleString()}</div>
                        </div>
                        ${isCommentAuthor ? `<button class="btn-delete-comment" onclick="deleteComment(${c.id})" title="Xóa bình luận">×</button>` : ''}
                    </div>
                    <div class="comment-text">${c.content}</div>
                </div>
            `;
            commentsList.innerHTML += commentHTML;
        });
    }
    
    // Handle comment form
    const commentForm = document.getElementById('commentForm');
    if (commentForm) {
        commentForm.addEventListener('submit', function(e) {
            // handled above in the main DOMContentLoaded
        });
    }
    
    // Handle category filter
    const categoryFilters = document.querySelectorAll('.category-filter');
    categoryFilters.forEach(filter => {
        filter.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            filterBlogByCategory(category);
        });
    });
});

// Hàm xóa bình luận qua API
async function deleteComment(commentId) {
    if (!confirm('Bạn có chắc muốn xóa bình luận này?')) return;
    try {
        const query = new URLSearchParams(window.location.search);
        const postId = query.get('id');
        const r = await fetch(`${window.API_BASE}/posts/${postId}/comments/${commentId}`, { method: 'DELETE', credentials: 'include' });
        if (!r.ok) {
            const err = await r.json().catch(()=>({}));
            alert(err.message || 'Xóa thất bại');
            return;
        }
        // Reload comments
        const refreshed = await fetch(`${window.API_BASE}/posts/${postId}`);
        const newData = await refreshed.json();
        const commentsList = document.getElementById('commentsList');
        if (commentsList) {
            localRenderComments(newData.comments || []);
        }
        alert('Bình luận đã được xóa!');
    } catch (err) {
        console.error('Delete comment error', err);
        alert('Lỗi mạng, thử lại');
    }
}

// Helper render comments (reusable)
function localRenderComments(comments) {
    const commentsList = document.getElementById('commentsList');
    if (!commentsList) return;
    if (!comments || comments.length === 0) {
        commentsList.innerHTML = '<p style="color: #999; text-align: center;">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>';
        return;
    }
    commentsList.innerHTML = '';
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    comments.forEach((c, index) => {
        const isCommentAuthor = currentUser && currentUser.id === c.user_id;
        const commentHTML = `
            <div class="comment-item">
                <div class="comment-header">
                    <img src="imgs/account.png" alt="${c.user_id}" class="comment-avatar" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;">
                    <div class="comment-info">
                        <div class="comment-author">${c.user_id}</div>
                        <div class="comment-date">${new Date(c.created_at).toLocaleString()}</div>
                    </div>
                    ${isCommentAuthor ? `<button class="btn-delete-comment" onclick="deleteComment(${c.id})" title="Xóa bình luận">×</button>` : ''}
                </div>
                <div class="comment-text">${c.content}</div>
            </div>
        `;
        commentsList.innerHTML += commentHTML;
    });
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
