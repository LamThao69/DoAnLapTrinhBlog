// Account Page - Chỉ cho phép người dùng đã đăng nhập
const API_BASE_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', async function() {
    // Kiểm tra đăng nhập ngay khi trang load
    const token = localStorage.getItem('token');
    if (!token) {
        // Xóa tất cả dữ liệu user cũ
        clearAllUserData();
        alert('Vui lòng đăng nhập để xem trang cá nhân');
        window.location.href = 'login.html';
        return;
    }

    // Clear dữ liệu cũ trước khi load mới từ backend
    // Điều này đảm bảo không hiển thị data của user khác
    clearFormData();

    // Load thông tin user từ backend (KHÔNG dùng localStorage)
    const isLoggedIn = await loadAccountInfo();
    if (!isLoggedIn) {
        return; // Đã redirect trong loadAccountInfo
    }

    // Setup menu navigation
    setupMenuNavigation();

    // Setup form handlers
    setupFormHandlers();

    // Setup avatar upload
    setupAvatarUpload();
});

// Xóa tất cả dữ liệu user trong localStorage
function clearAllUserData() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userAvatar');
}

// Clear form data để không hiển thị data cũ
function clearFormData() {
    const fields = ['email', 'username', 'address', 'phone', 'birthYear'];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    
    // Bỏ chọn tất cả gender
    const genderRadios = document.querySelectorAll('input[name="gender"]');
    genderRadios.forEach(radio => radio.checked = false);
    
    // Reset avatar về mặc định
    const avatarImg = document.getElementById('avatarImg');
    if (avatarImg) {
        avatarImg.src = '../assets/imgs/account.png';
    }
}

// Setup menu navigation
function setupMenuNavigation() {
    const menuLinks = document.querySelectorAll('.menu-link');
    const sections = document.querySelectorAll('.account-section');

    menuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const sectionId = this.getAttribute('data-section') + '-section';
            
            menuLinks.forEach(ml => ml.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            this.classList.add('active');
            
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
}

// Setup form handlers
function setupFormHandlers() {
    const accountForm = document.getElementById('accountForm');
    if (accountForm) {
        accountForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveAccountInfo();
        });
    }

    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            changePassword();
        });
    }
}

// Setup avatar upload
function setupAvatarUpload() {
    const btnUpload = document.querySelector('.btn-upload');
    const avatarInput = document.getElementById('avatarInput');
    
    if (btnUpload && avatarInput) {
        btnUpload.addEventListener('click', function() {
            avatarInput.click();
        });

        avatarInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Kiểm tra kích thước file (max 2MB)
                if (file.size > 2 * 1024 * 1024) {
                    alert('Kích thước ảnh không được vượt quá 2MB');
                    return;
                }

                const reader = new FileReader();
                reader.onload = function(event) {
                    const avatarImg = document.getElementById('avatarImg');
                    avatarImg.src = event.target.result;
                    updateHeaderAvatar(event.target.result);
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

// Cập nhật avatar trên header
function updateHeaderAvatar(avatarSrc) {
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        loginBtn.innerHTML = `<img src="${avatarSrc}" alt="User" width="44" height="44" class="user-icon" style="border-radius: 50%; object-fit: cover;">`;
    }
    
    // Lưu avatar vào localStorage để các trang khác dùng
    localStorage.setItem('userAvatar', avatarSrc);
}

// Load account info từ backend
async function loadAccountInfo() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            clearAllUserData();
            window.location.href = 'login.html';
            return false;
        }

        console.log('Loading account info with token...');

        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            // Token hết hạn hoặc không hợp lệ
            clearAllUserData();
            alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            window.location.href = 'login.html';
            return false;
        }

        const data = await response.json();
        console.log('User data from backend:', data);
        
        const user = data.user;
        
        if (!user) {
            console.error('No user data in response');
            clearAllUserData();
            window.location.href = 'login.html';
            return false;
        }
        
        // Điền thông tin vào form - CHỈ dùng data từ backend
        document.getElementById('email').value = user.email || '';
        document.getElementById('username').value = user.displayName || '';
        document.getElementById('address').value = user.address || '';
        document.getElementById('phone').value = user.phoneNumber || '';
        document.getElementById('birthYear').value = user.birthYear || '';
        
        // Set gender - mặc định không chọn nếu chưa có
        const genderRadios = document.querySelectorAll('input[name="gender"]');
        genderRadios.forEach(radio => radio.checked = false);
        
        if (user.gender && user.gender !== 'OTHER') {
            const genderValue = user.gender === 'MALE' ? 'Nam' : user.gender === 'FEMALE' ? 'Nữ' : '';
            if (genderValue) {
                const genderRadio = document.querySelector(`input[name="gender"][value="${genderValue}"]`);
                if (genderRadio) {
                    genderRadio.checked = true;
                }
            }
        }
        
        // Load avatar - dùng ảnh mặc định nếu không có
        const avatarImg = document.getElementById('avatarImg');
        if (user.avatar && user.avatar !== 'null' && user.avatar !== '') {
            avatarImg.src = user.avatar;
        } else {
            avatarImg.src = '../assets/imgs/account.png';
        }

        // Cập nhật header để hiển thị user đã đăng nhập
        updateHeaderForLoggedInUser(user);
        
        console.log('Account info loaded successfully for user:', user.email);
        
        return true;
    } catch (error) {
        console.error('Error loading account info:', error);
        alert('Lỗi kết nối đến server. Vui lòng thử lại.');
        return false;
    }
}

// Cập nhật header cho user đã đăng nhập
function updateHeaderForLoggedInUser(user) {
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        const avatar = user.avatar && user.avatar !== 'null' && user.avatar !== '' 
            ? user.avatar 
            : '../assets/imgs/account.png';
        loginBtn.innerHTML = `<img src="${avatar}" alt="User" width="44" height="44" class="user-icon" style="border-radius: 50%; object-fit: cover;">`;
        loginBtn.onclick = function(e) {
            e.preventDefault();
            // Có thể thêm dropdown menu ở đây
        };
    }
}

// Save account info
async function saveAccountInfo() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Vui lòng đăng nhập lại');
            window.location.href = 'login.html';
            return;
        }

        const displayName = document.getElementById('username').value.trim();
        const phoneNumber = document.getElementById('phone').value.trim();
        const address = document.getElementById('address').value.trim();
        const birthYear = document.getElementById('birthYear').value;
        const genderInput = document.querySelector('input[name="gender"]:checked');
        const avatar = document.getElementById('avatarImg').src;

        // Validate displayName
        if (!displayName) {
            alert('Vui lòng nhập tên hiển thị');
            return;
        }

        // Chuyển đổi gender sang định dạng backend
        let gender = null;
        if (genderInput) {
            gender = genderInput.value === 'Nam' ? 'MALE' : genderInput.value === 'Nữ' ? 'FEMALE' : 'OTHER';
        }

        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                displayName: displayName || null,
                phoneNumber: phoneNumber || null,
                address: address || null,
                birthYear: birthYear ? parseInt(birthYear) : null,
                gender: gender,
                avatar: avatar && !avatar.includes('account.png') ? avatar : null
            })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            alert('Lưu thông tin thành công!');
        } else {
            alert(data.error || 'Lỗi khi cập nhật thông tin');
        }
    } catch (error) {
        console.error('Error saving account info:', error);
        alert('Lỗi kết nối đến server');
    }
}

// Change password
async function changePassword() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Vui lòng đăng nhập lại');
            window.location.href = 'login.html';
            return;
        }

        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;
        
        // Validate
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            alert('Vui lòng điền đầy đủ thông tin');
            return;
        }

        if (newPassword.length < 8) {
            alert('Mật khẩu mới phải có ít nhất 8 ký tự!');
            return;
        }
        
        if (newPassword !== confirmNewPassword) {
            alert('Mật khẩu xác nhận không khớp!');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('passwordForm').reset();
            alert('Cập nhật mật khẩu thành công!');
        } else {
            alert(data.error || 'Lỗi khi đổi mật khẩu');
        }
    } catch (error) {
        console.error('Error changing password:', error);
        alert('Lỗi kết nối đến server');
    }
}
