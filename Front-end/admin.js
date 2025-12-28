// ===== ADMIN LOGIN CHECKING =====

// Check if admin is already logged in
document.addEventListener('DOMContentLoaded', async function() {
    const adminCheckScreen = document.getElementById('adminCheckScreen');
    const adminDashboard = document.getElementById('adminDashboard');

    try {
        const resp = await fetch(`${window.API_BASE}/auth/me`, { credentials: 'include' });
        if (!resp.ok) throw new Error('not-allowed');
        const data = await resp.json();
        if (data.user && data.user.role === 'admin') {
            adminCheckScreen.style.display = 'none';
            adminDashboard.style.display = 'block';
            initializeDashboard();
            // store current user for UI
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            localStorage.setItem('isLoggedIn', 'true');
        } else {
            adminCheckScreen.style.display = 'block';
            adminDashboard.style.display = 'none';
        }
    } catch (err) {
        adminCheckScreen.style.display = 'block';
        adminDashboard.style.display = 'none';
    }
});

// Admin Logout Handler
async function adminLogout() {
    if (!confirm('Bạn có chắc muốn đăng xuất?')) return;
    try {
        await fetch(`${window.API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch (err) { }
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
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

// Helper: set form pending state (disable submit + change text)
function setFormPending(formOrId, pending) {
    const form = typeof formOrId === 'string' ? document.getElementById(formOrId) : formOrId;
    if (!form) return;
    const btn = form.querySelector('button[type="submit"], .btn-save');
    if (!btn) return;
    if (pending) {
        btn.disabled = true;
        btn.dataset.origText = btn.textContent;
        btn.textContent = 'Đang xử lý...';
    } else {
        btn.disabled = false;
        if (btn.dataset.origText) {
            btn.textContent = btn.dataset.origText;
            delete btn.dataset.origText;
        }
    }
}

// Helper: show inline error (fallback to alert)
function showError(message) {
    // You can later replace this with an inline UI element
    alert(message);
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

async function loadPosts() {
    const postsTableBody = document.getElementById('postsTableBody');
    postsTableBody.innerHTML = '';
    try {
        const resp = await fetch(`${window.API_BASE}/admin/posts`, { credentials: 'include' });
        if (!resp.ok) {
            postsTableBody.innerHTML = '<tr><td colspan="6">Không tải được danh sách bài viết</td></tr>';
            return;
        }
        const posts = await resp.json();
        posts.forEach((post) => {
            const row = document.createElement('tr');
            const category = (post.categories && post.categories.map(c => c.name).join(', ')) || post.category || '';
            const status = post.status || 'published';
            row.innerHTML = `
                <td>${post.id}</td>
                <td>${post.title}</td>
                <td>${post.author || ''}</td>
                <td>${category}</td>
                <td>${status}</td>
                <td>
                    <button class="btn-edit" onclick="editPost(${post.id})">Sửa</button>
                    <button class="btn-delete" onclick="deletePost(${post.id})">Xóa</button>
                </td>
            `;
            postsTableBody.appendChild(row);
        });
    } catch (err) {
        console.error('Load posts error', err);
        postsTableBody.innerHTML = '<tr><td colspan="6">Lỗi mạng</td></tr>';
    }

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

async function openAddPostModal() {
    document.getElementById('postModalTitle').textContent = 'Thêm bài viết mới';
    document.getElementById('postForm').reset();
    document.getElementById('postTitle').value = '';
    document.getElementById('postAuthor').value = '';
    document.getElementById('postCategory').value = '';
    document.getElementById('postImage').value = '';
    document.getElementById('postDescription').value = '';
    document.getElementById('postContent').value = '';
    document.getElementById('postVisible').checked = true;

    await loadCategoryOptions();

    document.getElementById('postForm').onsubmit = async function(e) {
        e.preventDefault();
        const title = document.getElementById('postTitle').value.trim();
        const excerpt = document.getElementById('postDescription').value.trim();
        const content = document.getElementById('postContent').value.trim();
        const category = document.getElementById('postCategory').value;
        if (!title) return showError('Vui lòng nhập tiêu đề');
        if (!excerpt) return showError('Vui lòng nhập mô tả');
        if (!content) return showError('Vui lòng nhập nội dung');
        if (!category) return showError('Vui lòng chọn danh mục');

        const payload = {
            title,
            excerpt,
            content,
            category_id: parseInt(category) || null,
            status: document.getElementById('postVisible').checked ? 'published' : 'draft'
        };
        setFormPending('postForm', true);
        try {
            const resp = await fetch(`${window.API_BASE}/posts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) });
            if (!resp.ok) {
                const err = await resp.json().catch(()=>({}));
                showError(err.message || 'Thêm bài thất bại');
                setFormPending('postForm', false);
                return;
            }
            closePostModal();
            alert('Thêm bài viết thành công!');
            loadPosts();
        } catch (err) {
            console.error('Add post error', err);
            showError('Lỗi mạng, thử lại');
        } finally {
            setFormPending('postForm', false);
        }
    }; 

    document.getElementById('postModal').style.display = 'block';
}

async function editPost(postId) {
    try {
        const resp = await fetch(`${window.API_BASE}/posts/${postId}`, { credentials: 'include' });
        if (!resp.ok) return alert('Không thể tải bài viết');
        const post = await resp.json();

        document.getElementById('postModalTitle').textContent = 'Sửa bài viết';
        document.getElementById('postTitle').value = post.title || '';
        document.getElementById('postAuthor').value = post.author || '';
        document.getElementById('postImage').value = post.image || '';
        document.getElementById('postDescription').value = post.excerpt || '';
        document.getElementById('postContent').value = post.content || '';
        document.getElementById('postVisible').checked = post.status === 'published';

        await loadCategoryOptions();
        document.getElementById('postCategory').value = (post.categories && post.categories[0] && post.categories[0].id) || '';

        document.getElementById('postForm').onsubmit = async function(e) {
            e.preventDefault();
            const title = document.getElementById('postTitle').value.trim();
            const excerpt = document.getElementById('postDescription').value.trim();
            const content = document.getElementById('postContent').value.trim();
            const category = document.getElementById('postCategory').value;
            if (!title) return showError('Vui lòng nhập tiêu đề');
            if (!excerpt) return showError('Vui lòng nhập mô tả');
            if (!content) return showError('Vui lòng nhập nội dung');
            if (!category) return showError('Vui lòng chọn danh mục');

            const payload = {
                title,
                excerpt,
                content,
                category_id: parseInt(category) || null,
                status: document.getElementById('postVisible').checked ? 'published' : 'draft'
            };
            setFormPending('postForm', true);
            try {
                const res = await fetch(`${window.API_BASE}/posts/${postId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) });
                if (!res.ok) {
                    const err = await res.json().catch(()=>({}));
                    showError(err.message || 'Cập nhật thất bại');
                    setFormPending('postForm', false);
                    return;
                }
                closePostModal();
                alert('Cập nhật bài viết thành công!');
                loadPosts();
            } catch (err) {
                console.error('Update post error', err);
                showError('Lỗi mạng, thử lại');
            } finally {
                setFormPending('postForm', false);
            }
        }; 

        document.getElementById('postModal').style.display = 'block';
    } catch (err) {
        console.error('Load post error', err);
        alert('Lỗi tải bài viết');
    }
}

async function deletePost(postId) {
    if (!confirm('Bạn có chắc muốn xóa bài viết này?')) return;
    try {
        const res = await fetch(`${window.API_BASE}/posts/${postId}`, { method: 'DELETE', credentials: 'include' });
        if (!res.ok) {
            const err = await res.json().catch(()=>({}));
            alert(err.message || 'Xóa thất bại');
            return;
        }
        alert('Xóa bài viết thành công!');
        loadPosts();
    } catch (err) {
        console.error('Delete post error', err);
        alert('Lỗi mạng, thử lại');
    }
}

async function togglePostVisibility(postId) {
    try {
        const resp = await fetch(`${window.API_BASE}/posts/${postId}`, { method: 'GET' });
        if (!resp.ok) return alert('Không thể tải bài viết');
        const post = await resp.json();
        const newStatus = post.status === 'published' ? 'draft' : 'published';
        const payload = {
            title: post.title,
            excerpt: post.excerpt || '',
            content: post.content || '',
            category_id: (post.categories && post.categories[0] && post.categories[0].id) || null,
            status: newStatus
        };
        const res = await fetch(`${window.API_BASE}/posts/${postId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) });
        if (!res.ok) {
            const err = await res.json().catch(()=>({}));
            alert(err.message || 'Cập nhật thất bại');
            return;
        }
        loadPosts();
    } catch (err) {
        console.error('Toggle visibility error', err);
        alert('Lỗi mạng, thử lại');
    }
}

function closePostModal() {
    document.getElementById('postModal').style.display = 'none';
}

// ===== CATEGORIES MANAGEMENT =====

async function loadCategories() {
    const categoriesTableBody = document.getElementById('categoriesTableBody');
    categoriesTableBody.innerHTML = '';
    try {
        const resp = await fetch(`${window.API_BASE}/categories`);
        if (!resp.ok) throw new Error('Không lấy được danh mục');
        const categories = await resp.json();

        // Try to fetch admin posts to compute counts (may fail if not admin)
        let posts = [];
        try {
            const p = await fetch(`${window.API_BASE}/admin/posts`, { credentials: 'include' });
            if (p.ok) posts = await p.json();
            else posts = [];
        } catch (e) { posts = []; }

        categories.forEach((category) => {
            const postCount = Array.isArray(posts) ? posts.filter(p => p.category === category.name).length : 0;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${category.id}</td>
                <td>${category.name}</td>
                <td>${postCount}</td>
                <td>
                    <button class="btn-edit" onclick="editCategory(${category.id})">Sửa</button>
                    <button class="btn-delete" onclick="deleteCategory(${category.id})">Xóa</button>
                </td>
            `;
            categoriesTableBody.appendChild(row);
        });
    } catch (err) {
        console.error('Load categories error', err);
        categoriesTableBody.innerHTML = '<tr><td colspan="4">Không tải được danh mục</td></tr>';
    }
}

function openAddCategoryModal() {
    document.getElementById('categoryModalTitle').textContent = 'Thêm danh mục mới';
    document.getElementById('categoryForm').reset();

    document.getElementById('categoryForm').onsubmit = async function(e) {
        e.preventDefault();
        const name = document.getElementById('categoryName').value.trim();
        if (!name) return showError('Vui lòng nhập tên danh mục');
        const slug = name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9\-]/g,'');
        setFormPending('categoryForm', true);
        try {
            const resp = await fetch(`${window.API_BASE}/categories`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ name, slug }) });
            if (!resp.ok) {
                const err = await resp.json().catch(()=>({}));
                showError(err.message || 'Thêm thất bại');
                setFormPending('categoryForm', false);
                return;
            }
            closeCategoryModal();
            alert('Thêm danh mục thành công!');
            loadCategories();
        } catch (err) {
            console.error('Create category error', err);
            showError('Lỗi mạng, thử lại');
        } finally {
            setFormPending('categoryForm', false);
        }
    };

    document.getElementById('categoryModal').style.display = 'block';
}

async function editCategory(categoryId) {
    try {
        const resp = await fetch(`${window.API_BASE}/categories/${categoryId}`);
        if (!resp.ok) return alert('Không thể tải danh mục');
        const category = await resp.json();

        document.getElementById('categoryModalTitle').textContent = 'Sửa danh mục';
        document.getElementById('categoryName').value = category.name || '';

        document.getElementById('categoryForm').onsubmit = async function(e) {
            e.preventDefault();
            const name = document.getElementById('categoryName').value.trim();
            if (!name) return showError('Vui lòng nhập tên danh mục');
            const slug = name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9\-]/g,'');
            setFormPending('categoryForm', true);
            try {
                const res = await fetch(`${window.API_BASE}/categories/${categoryId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ name, slug }) });
                if (!res.ok) {
                    const err = await res.json().catch(()=>({}));
                    showError(err.message || 'Cập nhật thất bại');
                    setFormPending('categoryForm', false);
                    return;
                }
                closeCategoryModal();
                alert('Cập nhật danh mục thành công!');
                loadCategories();
            } catch (err) {
                console.error('Update category error', err);
                showError('Lỗi mạng, thử lại');
            } finally {
                setFormPending('categoryForm', false);
            }
        };

        document.getElementById('categoryModal').style.display = 'block';
    } catch (err) {
        console.error('Load category error', err);
        alert('Lỗi tải danh mục');
    }
}

async function deleteCategory(categoryId) {
    if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return;
    try {
        const res = await fetch(`${window.API_BASE}/categories/${categoryId}`, { method: 'DELETE', credentials: 'include' });
        if (!res.ok) {
            const err = await res.json().catch(()=>({}));
            alert(err.message || 'Xóa thất bại');
            return;
        }
        alert('Xóa danh mục thành công!');
        loadCategories();
    } catch (err) {
        console.error('Delete category error', err);
        alert('Lỗi mạng, thử lại');
    }
}

function closeCategoryModal() {
    document.getElementById('categoryModal').style.display = 'none';
}

async function loadCategoryOptions() {
    const categorySelect = document.getElementById('postCategory');
    categorySelect.innerHTML = '<option value="">-- Chọn danh mục --</option>';
    try {
        const resp = await fetch(`${window.API_BASE}/categories`);
        if (!resp.ok) return;
        const categories = await resp.json();
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    } catch (err) {
        console.error('Load category options error', err);
    }
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
