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
        localStorage.clear();
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

async function loadUsers() {
    const usersTableBody = document.getElementById('usersTableBody');
    
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Vui lòng đăng nhập lại');
            window.location.href = 'login.html';
            return;
        }

        const response = await fetch(`${API_BASE_URL}/auth/users`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }

        const data = await response.json();
        const users = data.users || [];

        usersTableBody.innerHTML = '';
        users.forEach((user, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.email}</td>
                <td>${user.displayName || 'N/A'}</td>
                <td>${user.address || 'N/A'}</td>
                <td>${user.phoneNumber || 'N/A'}</td>
                <td>
                    <button class="btn-edit" onclick="editUser(${index})">Sửa</button>
                    <button class="btn-delete" onclick="deleteUser(${index})">Xóa</button>
                </td>
            `;
            usersTableBody.appendChild(row);
        });

        // Lưu vào localStorage để dùng cho search và edit
        localStorage.setItem('allUsers', JSON.stringify(users));

        // Setup search
        const searchBox = document.getElementById('userSearchBox');
        if (searchBox) {
            searchBox.addEventListener('input', function() {
                searchUsers(this.value);
            });
        }
    } catch (error) {
        console.error('Load users error:', error);
        alert('Lỗi khi tải danh sách người dùng');
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

const API_BASE_URL = 'http://localhost:5000/api';

async function loadPosts() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Vui lòng đăng nhập lại');
            window.location.href = 'login.html';
            return;
        }

        const response = await fetch(`${API_BASE_URL}/posts?limit=100`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load posts');
        }

        const data = await response.json();
        const posts = data.posts || [];

        const postsTableBody = document.getElementById('postsTableBody');
        postsTableBody.innerHTML = '';
        
        posts.forEach((post, index) => {
            const row = document.createElement('tr');
            const categoryName = post.category?.name || 'Chưa có';
            const status = post.published ? 'Hiển thị' : 'Ẩn';
            
            row.innerHTML = `
                <td>${post.id}</td>
                <td>${post.title}</td>
                <td>${post.author?.displayName || post.author?.email || 'N/A'}</td>
                <td>${categoryName}</td>
                <td>${status}</td>
                <td>
                    <button class="btn-edit" onclick="editPost(${post.id})">Sửa</button>
                    <button class="btn-toggle" onclick="togglePostVisibility(${post.id}, ${!post.published})">${post.published ? 'Ẩn' : 'Hiện'}</button>
                    <button class="btn-delete" onclick="deletePost(${post.id})">Xóa</button>
                </td>
            `;
            postsTableBody.appendChild(row);
        });

        // Setup search
        const searchBox = document.getElementById('postSearchBox');
        if (searchBox) {
            searchBox.removeEventListener('input', searchPostsHandler);
            searchBox.addEventListener('input', searchPostsHandler);
        }
    } catch (error) {
        console.error('Load posts error:', error);
        alert('Lỗi khi tải danh sách bài viết');
    }
}

function searchPostsHandler() {
    searchPosts(this.value);
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
        await createNewPost();
    };
    
    document.getElementById('postModal').style.display = 'block';
}

async function createNewPost() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Vui lòng đăng nhập lại');
            window.location.href = 'login.html';
            return;
        }

        const title = document.getElementById('postTitle').value;
        const content = document.getElementById('postContent').value;
        const description = document.getElementById('postDescription').value;
        const image = document.getElementById('postImage').value;
        const categoryId = parseInt(document.getElementById('postCategory').value);
        const published = document.getElementById('postVisible').checked;

        if (!title || !content) {
            alert('Vui lòng nhập tiêu đề và nội dung');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title,
                content,
                description: description || content.substring(0, 200),
                image: image || null,
                categoryId: categoryId || null,
                published
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Tạo bài viết thất bại');
        }

        closePostModal();
        await loadPosts();
        alert('Thêm bài viết thành công!');
    } catch (error) {
        console.error('Create post error:', error);
        alert('Lỗi: ' + error.message);
    }
}

async function editPost(postId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Vui lòng đăng nhập lại');
            window.location.href = 'login.html';
            return;
        }

        // Get post details
        const response = await fetch(`${API_BASE_URL}/posts?limit=100`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load post');
        }

        const data = await response.json();
        const post = data.posts.find(p => p.id === postId);

        if (!post) {
            alert('Không tìm thấy bài viết');
            return;
        }
        
        document.getElementById('postModalTitle').textContent = 'Sửa bài viết';
        document.getElementById('postTitle').value = post.title;
        document.getElementById('postAuthor').value = post.author?.displayName || post.author?.email || '';
        document.getElementById('postImage').value = post.image || '';
        document.getElementById('postDescription').value = post.description || '';
        document.getElementById('postContent').value = post.content;
        document.getElementById('postVisible').checked = post.published !== false;
        
        await loadCategoryOptions();
        if (post.category?.id) {
            document.getElementById('postCategory').value = post.category.id;
        }
        
        document.getElementById('postForm').onsubmit = async function(e) {
            e.preventDefault();
            await updateExistingPost(postId);
        };
        
        document.getElementById('postModal').style.display = 'block';
    } catch (error) {
        console.error('Load post error:', error);
        alert('Lỗi khi tải bài viết');
    }
}

async function updateExistingPost(postId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Vui lòng đăng nhập lại');
            window.location.href = 'login.html';
            return;
        }

        const title = document.getElementById('postTitle').value;
        const content = document.getElementById('postContent').value;
        const description = document.getElementById('postDescription').value;
        const image = document.getElementById('postImage').value;
        const categoryValue = document.getElementById('postCategory').value;
        const categoryId = categoryValue ? parseInt(categoryValue) : null;
        const published = document.getElementById('postVisible').checked;

        if (!title || !content) {
            alert('Vui lòng nhập tiêu đề và nội dung');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title,
                content,
                description: description || null,
                image: image || null,
                categoryId: categoryId,
                published
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Cập nhật bài viết thất bại');
        }

        closePostModal();
        await loadPosts();
        alert('Cập nhật bài viết thành công!');
    } catch (error) {
        console.error('Update post error:', error);
        alert('Lỗi: ' + error.message);
    }
}

async function deletePost(postId) {
    if (!confirm('Bạn có chắc muốn xóa bài viết này?')) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Vui lòng đăng nhập lại');
            window.location.href = 'login.html';
            return;
        }

        const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Xóa bài viết thất bại');
        }

        await loadPosts();
        alert('Xóa bài viết thành công!');
    } catch (error) {
        console.error('Delete post error:', error);
        alert('Lỗi: ' + error.message);
    }
}

async function togglePostVisibility(postId, newPublishedState) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Vui lòng đăng nhập lại');
            window.location.href = 'login.html';
            return;
        }

        // Get current post data first
        const getResponse = await fetch(`${API_BASE_URL}/posts?limit=100`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!getResponse.ok) {
            throw new Error('Failed to load post');
        }

        const getData = await getResponse.json();
        const post = getData.posts.find(p => p.id === postId);

        if (!post) {
            throw new Error('Không tìm thấy bài viết');
        }

        // Update post with new published state
        const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title: post.title,
                content: post.content,
                published: newPublishedState,
                categoryId: post.category?.id || null,
                image: post.image || null
            })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Thay đổi trạng thái thất bại');
        }

        await loadPosts();
    } catch (error) {
        console.error('Toggle visibility error:', error);
        alert('Lỗi: ' + error.message);
    }
}

function closePostModal() {
    document.getElementById('postModal').style.display = 'none';
}

// ===== CATEGORIES MANAGEMENT =====

async function loadCategories() {
    const categoriesTableBody = document.getElementById('categoriesTableBody');
    
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        if (!response.ok) {
            throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        const categories = data.categories || [];
        
        // Lưu vào localStorage để dùng cho dropdown
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
    } catch (error) {
        console.error('Load categories error:', error);
        alert('Lỗi khi tải danh mục');
    }
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
        option.value = category.id;  // Dùng ID thay vì name
        option.textContent = category.name;
        categorySelect.appendChild(option);
    });
}

// ===== ADMINS MANAGEMENT =====

async function loadAdmins() {
    const adminsTableBody = document.getElementById('adminsTableBody');
    
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            adminsTableBody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #f00;">Vui lòng đăng nhập</td></tr>';
            return;
        }

        const response = await fetch('http://localhost:5000/api/auth/users', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load users');
        }

        const data = await response.json();
        const admins = data.users.filter(user => user.role === 'ADMIN');

        adminsTableBody.innerHTML = '';
        if (admins.length === 0) {
            adminsTableBody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #999;">Chưa có admin nào</td></tr>';
            return;
        }

        admins.forEach((admin) => {
            const createdDate = new Date(admin.createdAt).toLocaleDateString('vi-VN');
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${admin.email}</td>
                <td>${createdDate}</td>
                <td>
                    <button class="btn-delete" onclick="deleteAdmin(${admin.id}, '${admin.email}')">Xóa</button>
                </td>
            `;
            adminsTableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Load admins error:', error);
        adminsTableBody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #f00;">Lỗi khi tải danh sách admin</td></tr>';
    }
}

function openAddAdminModal() {
    document.getElementById('adminModalTitle').textContent = 'Thêm tài khoản Admin';
    document.getElementById('adminForm').reset();
    
    document.getElementById('adminForm').onsubmit = async function(e) {
        e.preventDefault();
        const email = document.getElementById('newAdminEmail').value;
        const password = document.getElementById('newAdminPassword').value;
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Vui lòng đăng nhập');
                return;
            }

            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    role: 'ADMIN'
                })
            });

            const data = await response.json();

            if (response.ok) {
                closeAdminModal();
                loadAdmins();
                alert('Thêm admin thành công!');
            } else {
                alert(data.error || 'Lỗi khi thêm admin');
            }
        } catch (error) {
            console.error('Add admin error:', error);
            alert('Lỗi kết nối đến máy chủ');
        }
    };
    
    document.getElementById('adminModal').style.display = 'block';
}

async function deleteAdmin(adminId, adminEmail) {
    if (!confirm(`Bạn có chắc muốn xóa admin "${adminEmail}"?`)) {
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Vui lòng đăng nhập');
            return;
        }

        // Call delete user API (you need to create this endpoint in backend)
        const response = await fetch(`http://localhost:5000/api/auth/users/${adminId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            loadAdmins();
            alert('Xóa admin thành công!');
        } else {
            alert(data.error || 'Lỗi khi xóa admin');
        }
    } catch (error) {
        console.error('Delete admin error:', error);
        alert('Lỗi kết nối đến máy chủ');
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
