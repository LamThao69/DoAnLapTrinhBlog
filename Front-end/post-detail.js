// Post Detail Page
document.addEventListener('DOMContentLoaded', function() {
    // Set active menu item dựa trên trang hiện tại
    setActiveMenu();
    
    const selectedPost = JSON.parse(localStorage.getItem('selectedPost'));
    const postDetail = document.getElementById('postDetail');
    
    if (selectedPost && postDetail) {
        // Render categories
        const categoriesHtml = selectedPost.category.map(cat => `<span class="post-detail-category">#${cat}</span>`).join('');
        
        const postHTML = `
            <h1 class="post-detail-title">${selectedPost.title}</h1>
            <p class="post-detail-meta">
                PUBLISHED ${selectedPost.date} - BY <span class="post-detail-author">${selectedPost.author}</span>
            </p>
            <div class="post-detail-categories">
                ${categoriesHtml}
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
        
        // Update page title
        document.title = selectedPost.title + ' - Green&&Blue';
    } else {
        postDetail.innerHTML = '<p style="text-align: center; color: #999;">Không tìm thấy bài viết</p>';
    }
    
    // Handle comment form
    const commentForm = document.getElementById('commentForm');
    if (commentForm) {
        commentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addComment();
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
    
    // Load comments
    loadComments();
});

// Hàm thêm bình luận
function addComment() {
    const textarea = document.querySelector('.comment-form textarea');
    const commentText = textarea.value.trim();
    
    if (!commentText) {
        alert('Vui lòng nhập bình luận');
        return;
    }
    
    // Lấy user info
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const userEmail = currentUser ? currentUser.email : 'Anonymous';
    const userAvatar = localStorage.getItem('userAvatar') || 'imgs/account.png';
    const userName = currentUser ? (currentUser.name || userEmail.split('@')[0]) : 'Anonymous';
    
    // Tạo comment object
    const comment = {
        id: Date.now(),
        author: userName,
        email: userEmail,
        avatar: userAvatar,
        text: commentText,
        date: new Date().toLocaleString('vi-VN'),
        likes: []
    };
    
    // Lưu comment vào localStorage
    const selectedPost = JSON.parse(localStorage.getItem('selectedPost'));
    let comments = JSON.parse(localStorage.getItem(`comments_${selectedPost.id}`)) || [];
    comments.push(comment);
    localStorage.setItem(`comments_${selectedPost.id}`, JSON.stringify(comments));
    
    // Reset form
    textarea.value = '';
    
    // Reload comments
    loadComments();
    alert('Bình luận đã được gửi!');
}

// Hàm load bình luận
function loadComments() {
    const selectedPost = JSON.parse(localStorage.getItem('selectedPost'));
    const commentsList = document.getElementById('commentsList');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!selectedPost || !commentsList) return;
    
    const comments = JSON.parse(localStorage.getItem(`comments_${selectedPost.id}`)) || [];
    
    if (comments.length === 0) {
        commentsList.innerHTML = '<p style="color: #999; text-align: center;">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>';
        return;
    }
    
    commentsList.innerHTML = '';
    comments.forEach((comment, index) => {
        const isCommentAuthor = currentUser && currentUser.email === comment.email;
        const commentLikesCount = comment.likes ? comment.likes.length : 0;
        const isLiked = comment.likes && currentUser && comment.likes.includes(currentUser.email);
        
        const commentHTML = `
            <div class="comment-item">
                <div class="comment-header">
                    <img src="${comment.avatar}" alt="${comment.author}" class="comment-avatar" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;">
                    <div class="comment-info">
                        <div class="comment-author">${comment.author}</div>
                        <div class="comment-date">${comment.date}</div>
                    </div>
                    ${isCommentAuthor ? `<button class="btn-delete-comment" onclick="deleteComment(${index})" title="Xóa bình luận">×</button>` : ''}
                </div>
                <div class="comment-text">${comment.text}</div>
                <div class="comment-actions">
                    <button class="btn-like-comment ${isLiked ? 'liked' : ''}" onclick="likeComment(${index})">
                        ❤️ ${commentLikesCount > 0 ? commentLikesCount : ''}
                    </button>
                </div>
            </div>
        `;
        commentsList.innerHTML += commentHTML;
    });
}

// Hàm xóa bình luận
function deleteComment(commentIndex) {
    const selectedPost = JSON.parse(localStorage.getItem('selectedPost'));
    let comments = JSON.parse(localStorage.getItem(`comments_${selectedPost.id}`)) || [];
    
    comments.splice(commentIndex, 1);
    localStorage.setItem(`comments_${selectedPost.id}`, JSON.stringify(comments));
    
    loadComments();
    alert('Bình luận đã được xóa!');
}

// Hàm like/unlike bình luận
function likeComment(commentIndex) {
    const selectedPost = JSON.parse(localStorage.getItem('selectedPost'));
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        alert('Vui lòng đăng nhập để like bình luận');
        return;
    }
    
    let comments = JSON.parse(localStorage.getItem(`comments_${selectedPost.id}`)) || [];
    const comment = comments[commentIndex];
    
    if (!comment.likes) {
        comment.likes = [];
    }
    
    const likeIndex = comment.likes.indexOf(currentUser.email);
    
    if (likeIndex > -1) {
        // Nếu đã like, xóa like
        comment.likes.splice(likeIndex, 1);
    } else {
        // Nếu chưa like, thêm like
        comment.likes.push(currentUser.email);
    }
    
    localStorage.setItem(`comments_${selectedPost.id}`, JSON.stringify(comments));
    loadComments();
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
