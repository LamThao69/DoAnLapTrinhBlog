// Kiểm tra user đã đăng nhập hay chưa
document.addEventListener('DOMContentLoaded', function() {
    // Set active menu item dựa trên trang hiện tại
    setActiveMenu();
    
    // Kiểm tra xem có category được chọn từ các trang khác không
    const selectedCategory = localStorage.getItem('selectedCategory');
    if (selectedCategory) {
        // Xóa selectedCategory khỏi localStorage
        localStorage.removeItem('selectedCategory');
        // Lọc bài viết theo category
        filterBlogByCategory(selectedCategory);
    }
    
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const loginBtn = document.querySelector('.login-btn');
    const notificationBell = document.querySelector('.notification-bell');
    
    // Handle category filter
    const categoryFilters = document.querySelectorAll('.category-filter');
    categoryFilters.forEach(filter => {
        filter.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            filterBlogByCategory(category);
        });
    });
    
    if (isLoggedIn === 'true' && currentUser) {
        // User đã đăng nhập
        const userEmail = currentUser.email;
        const userAvatar = localStorage.getItem('userAvatar');
        
        // Thay đổi nút login thành user icon
        if (userAvatar) {
            // Nếu có ảnh avatar, hiển thị ảnh đó
            loginBtn.innerHTML = `<img src="${userAvatar}" alt="User" width="44" height="44" class="user-icon" style="border-radius: 50%; object-fit: cover;">`;
        } else {
            // Nếu không có ảnh, hiển thị ảnh mặc định
            loginBtn.innerHTML = `<img src="imgs/account.png" alt="User" width="44" height="44" class="user-icon">`;
        }
        
        loginBtn.classList.add('user-logged-in');
        loginBtn.onclick = null;
        
        // Thêm menu dropdown khi click vào user
        loginBtn.style.cursor = 'pointer';
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showUserMenu();
        });
        
        // Hiển thị notification bell
        if (notificationBell) {
            notificationBell.style.display = 'flex';
            notificationBell.addEventListener('click', function(e) {
                e.preventDefault();
                showNotifications();
            });
        }
    }
});

// Hiển thị menu người dùng
function showUserMenu() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) return;
    
    // Kiểm tra menu đã tồn tại chưa
    let menu = document.querySelector('.user-menu');
    
    if (menu) {
        menu.remove();
        return;
    }
    
    // Tạo menu
    menu = document.createElement('div');
    menu.className = 'user-menu';
    // Hiển thị username nếu có, nếu không thì hiển thị email
    const displayName = currentUser.name || currentUser.email;
    menu.innerHTML = `
        <div class="menu-user-info">
            <img src="imgs/account.png" alt="User" class="menu-icon" width="20">
            <span>${displayName}</span>
        </div>
        <a href="account.html" class="menu-item">
            <img src="imgs/user_info.png" alt="User" class="menu-icon" width="20">
            <span>Trang cá nhân</span>
        </a>
        <a href="saved-posts.html" class="menu-item">
            <img src="imgs/save.png" alt="Bookmark" class="menu-icon" width="20">
            <span>Bài viết theo dõi</span>
        </a>
        <a href="#" class="menu-item logout" onclick="logout(event)">
            <img src="imgs/logout.png" alt="Logout" class="menu-icon" width="20">
            <span>Đăng xuất</span>
        </a>
    `;
    
    const loginBtn = document.querySelector('.login-btn');
    loginBtn.parentElement.appendChild(menu);
    
    // Đóng menu khi click ra ngoài
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.login-btn') && !e.target.closest('.user-menu')) {
            menu.remove();
        }
    });
}

// Hàm đăng xuất
function logout(event) {
    event.preventDefault();
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    alert('Đăng xuất thành công!');
    window.location.reload();
}

// Hiển thị thông báo
function showNotifications() {
    let notifPanel = document.querySelector('.notification-panel');
    
    if (notifPanel) {
        notifPanel.remove();
        return;
    }
    
    // Tạo panel thông báo
    notifPanel = document.createElement('div');
    notifPanel.className = 'notification-panel';
    notifPanel.innerHTML = `
        <div class="notification-header">
            <h3>Thông báo</h3>
            <a href="#" class="clear-all">Xóa tất cả</a>
        </div>
        <div class="notification-list">
            <div class="notification-item">
                <div class="notification-avatar">👤</div>
                <div class="notification-content">
                    <p><strong>Người dùng A</strong> đã theo dõi bạn</p>
                    <small>5 phút trước</small>
                </div>
            </div>
            <div class="notification-item">
                <div class="notification-avatar">❤️</div>
                <div class="notification-content">
                    <p><strong>Người dùng B</strong> đã thích bài viết của bạn</p>
                    <small>1 giờ trước</small>
                </div>
            </div>
            <div class="notification-item">
                <div class="notification-avatar">💬</div>
                <div class="notification-content">
                    <p><strong>Người dùng C</strong> đã bình luận trên bài viết</p>
                    <small>3 giờ trước</small>
                </div>
            </div>
        </div>
        <div class="notification-footer">
            <a href="#">Xem tất cả thông báo</a>
        </div>
    `;
    
    const header = document.querySelector('header');
    header.appendChild(notifPanel);
    
    // Đóng panel khi click ra ngoài
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.notification-bell') && !e.target.closest('.notification-panel')) {
            notifPanel.remove();
        }
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
