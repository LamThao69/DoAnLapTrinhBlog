// ===== ADMIN LOGIN CHECKING =====

// Check if admin is already logged in
document.addEventListener('DOMContentLoaded', function() {
    const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
    const adminCheckScreen = document.getElementById('adminCheckScreen');
    const adminDashboard = document.getElementById('adminDashboard');

    if (isAdminLoggedIn) {
        adminCheckScreen.style.display = 'none';
        adminDashboard.style.display = 'block';
        initializeDashboard();
    } else {
        adminCheckScreen.style.display = 'block';
        adminDashboard.style.display = 'none';
    }
});

// Admin Logout Handler
function adminLogout() {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        localStorage.removeItem('isAdminLoggedIn');
        localStorage.removeItem('adminEmail');
        window.location.href = 'login.html';
    }
}

// ===== DASHBOARD INITIALIZATION =====

function initializeDashboard() {
    // Set admin user info
    document.getElementById('adminUserInfo').textContent = localStorage.getItem('adminEmail') || 'Admin';

    // Initialize tabs
    setupTabNavigation();

    // Load initial data
    loadUsers();
    loadPosts();
    loadCategories();
    loadAdmins();
    
    // Setup image upload handler
    setupImageUpload();
}

// Handle image file upload
function setupImageUpload() {
    const fileInput = document.getElementById('postImageFile');
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    document.getElementById('postImage').value = event.target.result;
                    document.getElementById('postImage').style.borderColor = '#28a745';
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

// ===== TAB NAVIGATION =====

function setupTabNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const tabs = document.querySelectorAll('.admin-tab');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const tabName = this.getAttribute('data-tab');
            
            // Remove active from all
            navLinks.forEach(l => l.classList.remove('active'));
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active to clicked
            this.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });
}

// ===== USERS MANAGEMENT =====

function loadUsers() {
    const usersTableBody = document.getElementById('usersTableBody');
    let users = JSON.parse(localStorage.getItem('allUsers')) || [];

    // Add default admin user if no users exist
    if (users.length === 0) {
        users = [
            {
                email: 'admin@gmail.com',
                name: 'Admin',
                address: 'Hà Nội',
                phone: '0123456789'
            },
            {
                email: 'user@gmail.com',
                name: 'Người dùng',
                address: 'Thành phố Hồ Chí Minh',
                phone: '0987654321'
            }
        ];
        localStorage.setItem('allUsers', JSON.stringify(users));
    }

    usersTableBody.innerHTML = '';
    users.forEach((user, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.email}</td>
            <td>${user.name || 'N/A'}</td>
            <td>${user.address || 'N/A'}</td>
            <td>${user.phone || 'N/A'}</td>
            <td>
                <button class="btn-edit" onclick="editUser(${index})">Sửa</button>
                <button class="btn-delete" onclick="deleteUser(${index})">Xóa</button>
            </td>
        `;
        usersTableBody.appendChild(row);
    });

    // Setup search
    const searchBox = document.getElementById('userSearchBox');
    if (searchBox) {
        searchBox.addEventListener('input', function() {
            searchUsers(this.value);
        });
    }
}

function searchUsers(query) {
    const usersTableBody = document.getElementById('usersTableBody');
    const rows = usersTableBody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
    });
}

function editUser(index) {
    const users = JSON.parse(localStorage.getItem('allUsers')) || [];
    const user = users[index];
    
    document.getElementById('editUserEmail').value = user.email;
    document.getElementById('editUserName').value = user.name || '';
    document.getElementById('editUserAddress').value = user.address || '';
    document.getElementById('editUserPhone').value = user.phone || '';
    
    document.getElementById('userModal').style.display = 'block';
    document.getElementById('userForm').onsubmit = function(e) {
        e.preventDefault();
        users[index] = {
            email: user.email,
            name: document.getElementById('editUserName').value,
            address: document.getElementById('editUserAddress').value,
            phone: document.getElementById('editUserPhone').value
        };
        localStorage.setItem('allUsers', JSON.stringify(users));
        closeUserModal();
        loadUsers();
        alert('Cập nhật thông tin thành công!');
    };
}

function deleteUser(index) {
    if (confirm('Bạn có chắc muốn xóa người dùng này?')) {
        let users = JSON.parse(localStorage.getItem('allUsers')) || [];
        users.splice(index, 1);
        localStorage.setItem('allUsers', JSON.stringify(users));
        loadUsers();
        alert('Xóa người dùng thành công!');
    }
}

function closeUserModal() {
    document.getElementById('userModal').style.display = 'none';
}

// ===== POSTS MANAGEMENT =====

function loadPosts() {
    const postsTableBody = document.getElementById('postsTableBody');
    let posts = JSON.parse(localStorage.getItem('blogPosts')) || [];

    postsTableBody.innerHTML = '';
    posts.forEach((post, index) => {
        const row = document.createElement('tr');
        const category = Array.isArray(post.category) ? post.category[0] : post.category;
        const status = post.visible !== false ? 'Hiển thị' : 'Ẩn';
        
        row.innerHTML = `
            <td>${post.id}</td>
            <td>${post.title}</td>
            <td>${post.author}</td>
            <td>${category}</td>
            <td>${status}</td>
            <td>
                <button class="btn-edit" onclick="editPost(${index})">Sửa</button>
                <button class="btn-toggle" onclick="togglePostVisibility(${index})">${post.visible !== false ? 'Ẩn' : 'Hiện'}</button>
                <button class="btn-delete" onclick="deletePost(${index})">Xóa</button>
            </td>
        `;
        postsTableBody.appendChild(row);
    });

    // Setup search
    const searchBox = document.getElementById('postSearchBox');
    if (searchBox) {
        searchBox.addEventListener('input', function() {
            searchPosts(this.value);
        });
    }
}

function searchPosts(query) {
    const postsTableBody = document.getElementById('postsTableBody');
    const rows = postsTableBody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
    });
}

function openAddPostModal() {
    document.getElementById('postModalTitle').textContent = 'Thêm bài viết mới';
    document.getElementById('postForm').reset();
    document.getElementById('postTitle').value = '';
    document.getElementById('postAuthor').value = '';
    document.getElementById('postCategory').value = '';
    document.getElementById('postImage').value = '';
    document.getElementById('postDescription').value = '';
    document.getElementById('postContent').value = '';
    document.getElementById('postVisible').checked = true;
    
    loadCategoryOptions();
    
    document.getElementById('postForm').onsubmit = function(e) {
        e.preventDefault();
        let posts = JSON.parse(localStorage.getItem('blogPosts')) || [];
        const newPost = {
            id: posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1,
            title: document.getElementById('postTitle').value,
            author: document.getElementById('postAuthor').value,
            category: [document.getElementById('postCategory').value],
            image: document.getElementById('postImage').value,
            date: new Date().toLocaleDateString('vi-VN').toUpperCase(),
            description: document.getElementById('postDescription').value,
            content: document.getElementById('postContent').value,
            visible: document.getElementById('postVisible').checked
        };
        posts.push(newPost);
        localStorage.setItem('blogPosts', JSON.stringify(posts));
        closePostModal();
        loadPosts();
        alert('Thêm bài viết thành công!');
    };
    
    document.getElementById('postModal').style.display = 'block';
}

function editPost(index) {
    const posts = JSON.parse(localStorage.getItem('blogPosts')) || [];
    const post = posts[index];
    
    document.getElementById('postModalTitle').textContent = 'Sửa bài viết';
    document.getElementById('postTitle').value = post.title;
    document.getElementById('postAuthor').value = post.author;
    document.getElementById('postImage').value = post.image;
    document.getElementById('postDescription').value = post.description;
    document.getElementById('postContent').value = post.content;
    document.getElementById('postVisible').checked = post.visible !== false;
    
    loadCategoryOptions();
    document.getElementById('postCategory').value = Array.isArray(post.category) ? post.category[0] : post.category;
    
    document.getElementById('postForm').onsubmit = function(e) {
        e.preventDefault();
        posts[index] = {
            ...post,
            title: document.getElementById('postTitle').value,
            author: document.getElementById('postAuthor').value,
            category: [document.getElementById('postCategory').value],
            image: document.getElementById('postImage').value,
            description: document.getElementById('postDescription').value,
            content: document.getElementById('postContent').value,
            visible: document.getElementById('postVisible').checked
        };
        localStorage.setItem('blogPosts', JSON.stringify(posts));
        closePostModal();
        loadPosts();
        alert('Cập nhật bài viết thành công!');
    };
    
    document.getElementById('postModal').style.display = 'block';
}

function deletePost(index) {
    if (confirm('Bạn có chắc muốn xóa bài viết này?')) {
        let posts = JSON.parse(localStorage.getItem('blogPosts')) || [];
        posts.splice(index, 1);
        localStorage.setItem('blogPosts', JSON.stringify(posts));
        loadPosts();
        alert('Xóa bài viết thành công!');
    }
}

function togglePostVisibility(index) {
    let posts = JSON.parse(localStorage.getItem('blogPosts')) || [];
    posts[index].visible = posts[index].visible !== false ? false : true;
    localStorage.setItem('blogPosts', JSON.stringify(posts));
    loadPosts();
}

function closePostModal() {
    document.getElementById('postModal').style.display = 'none';
}

// ===== CATEGORIES MANAGEMENT =====

function loadCategories() {
    const categoriesTableBody = document.getElementById('categoriesTableBody');
    let categories = JSON.parse(localStorage.getItem('allCategories')) || [
        { id: 1, name: 'DoiSong' },
        { id: 2, name: 'LoiSong' },
        { id: 3, name: 'KhoaHoc' },
        { id: 4, name: 'SucKhoe' },
        { id: 5, name: 'CongNghe' },
        { id: 6, name: 'KienThuc' },
        { id: 7, name: 'TamLy' }
    ];
    localStorage.setItem('allCategories', JSON.stringify(categories));

    categoriesTableBody.innerHTML = '';
    categories.forEach((category, index) => {
        const postCount = JSON.parse(localStorage.getItem('blogPosts') || '[]')
            .filter(p => {
                const cats = Array.isArray(p.category) ? p.category : [p.category];
                return cats.includes(category.name);
            }).length;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${category.id}</td>
            <td>${category.name}</td>
            <td>${postCount}</td>
            <td>
                <button class="btn-edit" onclick="editCategory(${index})">Sửa</button>
                <button class="btn-delete" onclick="deleteCategory(${index})">Xóa</button>
            </td>
        `;
        categoriesTableBody.appendChild(row);
    });
}

function openAddCategoryModal() {
    document.getElementById('categoryModalTitle').textContent = 'Thêm danh mục mới';
    document.getElementById('categoryForm').reset();
    
    document.getElementById('categoryForm').onsubmit = function(e) {
        e.preventDefault();
        let categories = JSON.parse(localStorage.getItem('allCategories')) || [];
        const newCategory = {
            id: categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1,
            name: document.getElementById('categoryName').value
        };
        categories.push(newCategory);
        localStorage.setItem('allCategories', JSON.stringify(categories));
        closeCategoryModal();
        loadCategories();
        alert('Thêm danh mục thành công!');
    };
    
    document.getElementById('categoryModal').style.display = 'block';
}

function editCategory(index) {
    const categories = JSON.parse(localStorage.getItem('allCategories')) || [];
    const category = categories[index];
    
    document.getElementById('categoryModalTitle').textContent = 'Sửa danh mục';
    document.getElementById('categoryName').value = category.name;
    
    document.getElementById('categoryForm').onsubmit = function(e) {
        e.preventDefault();
        categories[index].name = document.getElementById('categoryName').value;
        localStorage.setItem('allCategories', JSON.stringify(categories));
        closeCategoryModal();
        loadCategories();
        alert('Cập nhật danh mục thành công!');
    };
    
    document.getElementById('categoryModal').style.display = 'block';
}

function deleteCategory(index) {
    if (confirm('Bạn có chắc muốn xóa danh mục này?')) {
        let categories = JSON.parse(localStorage.getItem('allCategories')) || [];
        categories.splice(index, 1);
        localStorage.setItem('allCategories', JSON.stringify(categories));
        loadCategories();
        alert('Xóa danh mục thành công!');
    }
}

function closeCategoryModal() {
    document.getElementById('categoryModal').style.display = 'none';
}

function loadCategoryOptions() {
    const categorySelect = document.getElementById('postCategory');
    const categories = JSON.parse(localStorage.getItem('allCategories')) || [];
    
    categorySelect.innerHTML = '<option value="">-- Chọn danh mục --</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        categorySelect.appendChild(option);
    });
}

// ===== ADMINS MANAGEMENT =====

function loadAdmins() {
    const adminsTableBody = document.getElementById('adminsTableBody');
    let admins = JSON.parse(localStorage.getItem('allAdmins')) || [
        {
            email: 'admin@gmail.com',
            createdDate: '2025-01-01'
        }
    ];
    localStorage.setItem('allAdmins', JSON.stringify(admins));

    adminsTableBody.innerHTML = '';
    admins.forEach((admin, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${admin.email}</td>
            <td>${admin.createdDate}</td>
            <td>
                ${admin.email !== 'admin@gmail.com' ? `
                    <button class="btn-delete" onclick="deleteAdmin(${index})">Xóa</button>
                ` : '<span>Admin chính</span>'}
            </td>
        `;
        adminsTableBody.appendChild(row);
    });
}

function openAddAdminModal() {
    document.getElementById('adminModalTitle').textContent = 'Thêm tài khoản Admin';
    document.getElementById('adminForm').reset();
    
    document.getElementById('adminForm').onsubmit = function(e) {
        e.preventDefault();
        const email = document.getElementById('newAdminEmail').value;
        const password = document.getElementById('newAdminPassword').value;
        
        let admins = JSON.parse(localStorage.getItem('allAdmins')) || [];
        
        // Check if email exists
        if (admins.some(a => a.email === email)) {
            alert('Email admin này đã tồn tại!');
            return;
        }
        
        const newAdmin = {
            email: email,
            password: password,
            createdDate: new Date().toLocaleDateString('vi-VN')
        };
        admins.push(newAdmin);
        localStorage.setItem('allAdmins', JSON.stringify(admins));
        closeAdminModal();
        loadAdmins();
        alert('Thêm admin thành công!');
    };
    
    document.getElementById('adminModal').style.display = 'block';
}

function deleteAdmin(index) {
    if (confirm('Bạn có chắc muốn xóa admin này?')) {
        let admins = JSON.parse(localStorage.getItem('allAdmins')) || [];
        if (admins[index].email === 'admin@gmail.com') {
            alert('Không thể xóa admin chính!');
            return;
        }
        admins.splice(index, 1);
        localStorage.setItem('allAdmins', JSON.stringify(admins));
        loadAdmins();
        alert('Xóa admin thành công!');
    }
}

function closeAdminModal() {
    document.getElementById('adminModal').style.display = 'none';
}

// ===== MODAL HANDLING =====

// Close modal when clicking outside
window.onclick = function(event) {
    const userModal = document.getElementById('userModal');
    const postModal = document.getElementById('postModal');
    const categoryModal = document.getElementById('categoryModal');
    const adminModal = document.getElementById('adminModal');
    
    if (event.target === userModal) {
        userModal.style.display = 'none';
    }
    if (event.target === postModal) {
        postModal.style.display = 'none';
    }
    if (event.target === categoryModal) {
        categoryModal.style.display = 'none';
    }
    if (event.target === adminModal) {
        adminModal.style.display = 'none';
    }
};
