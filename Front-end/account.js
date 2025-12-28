// Account Page - Menu Navigation
document.addEventListener('DOMContentLoaded', function() {
    const menuLinks = document.querySelectorAll('.menu-link');
    const sections = document.querySelectorAll('.account-section');

    menuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Lấy section ID từ data-section attribute
            const sectionId = this.getAttribute('data-section') + '-section';
            
            // Xóa active class từ tất cả menu links và sections
            menuLinks.forEach(ml => ml.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            // Thêm active class vào link được click
            this.classList.add('active');
            
            // Hiển thị section tương ứng
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });

    // Load thông tin user từ localStorage
    loadAccountInfo();

    // Submit form info
    const accountForm = document.getElementById('accountForm');
    if (accountForm) {
        accountForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveAccountInfo();
        });
    }

    // Submit form password
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            changePassword();
        });
    }

    // Upload avatar
    const btnUpload = document.querySelector('.btn-upload');
    const avatarInput = document.getElementById('avatarInput');
    
    if (btnUpload && avatarInput) {
        btnUpload.addEventListener('click', function() {
            avatarInput.click();
        });

        avatarInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const avatarImg = document.getElementById('avatarImg');
                    avatarImg.src = event.target.result;
                    localStorage.setItem('userAvatar', event.target.result);
                    
                    // Cập nhật ảnh trên header nếu window parent có
                    updateHeaderAvatar(event.target.result);
                };
                reader.readAsDataURL(file);
            }
        });
    }
});

// Cập nhật avatar trên header
function updateHeaderAvatar(avatarSrc) {
    // Nếu là trang account, cập nhật icon avatar
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        loginBtn.innerHTML = `<img src="${avatarSrc}" alt="User" width="44" height="44" class="user-icon" style="border-radius: 50%; object-fit: cover;">`;
    }
    
    // Nếu muốn update trên parent window (khi mở ở iframe)
    if (window.parent && window.parent !== window) {
        const parentLoginBtn = window.parent.document.querySelector('.login-btn');
        if (parentLoginBtn) {
            parentLoginBtn.innerHTML = `<img src="${avatarSrc}" alt="User" width="44" height="44" class="user-icon" style="border-radius: 50%; object-fit: cover;">`;
        }
    }
}

// Load account info
function loadAccountInfo() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const userAccountInfo = JSON.parse(localStorage.getItem('userAccountInfo'));
    
    if (currentUser) {
        document.getElementById('email').value = currentUser.email || '';
    }
    
    if (userAccountInfo) {
        document.getElementById('username').value = userAccountInfo.username || '';
        document.getElementById('address').value = userAccountInfo.address || '';
        document.getElementById('phone').value = userAccountInfo.phone || '';
        document.getElementById('birthYear').value = userAccountInfo.birthYear || '';
        
        // Set gender
        if (userAccountInfo.gender) {
            document.querySelector(`input[name="gender"][value="${userAccountInfo.gender}"]`).checked = true;
        }
    }
    
    // Load avatar
    const userAvatar = localStorage.getItem('userAvatar');
    if (userAvatar) {
        document.getElementById('avatarImg').src = userAvatar;
    }
}

// Save account info
function saveAccountInfo() {
    const username = document.getElementById('username').value;
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    const userAccountInfo = {
        username: username,
        address: document.getElementById('address').value,
        phone: document.getElementById('phone').value,
        birthYear: document.getElementById('birthYear').value,
        gender: document.querySelector('input[name="gender"]:checked').value
    };
    
    // Cập nhật username vào currentUser
    if (currentUser) {
        currentUser.name = username;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    
    localStorage.setItem('userAccountInfo', JSON.stringify(userAccountInfo));
    alert('Lưu thông tin thành công!');
}

// Change password
function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Kiểm tra mật khẩu hiện tại
    if (currentPassword !== currentUser.password) {
        alert('Mật khẩu hiện tại không chính xác!');
        return;
    }
    
    // Kiểm tra mật khẩu mới
    if (newPassword.length < 8) {
        alert('Mật khẩu mới phải có ít nhất 8 ký tự!');
        return;
    }
    
    // Kiểm tra xác nhận mật khẩu
    if (newPassword !== confirmNewPassword) {
        alert('Mật khẩu xác nhận không khớp!');
        return;
    }
    
    // Cập nhật mật khẩu
    currentUser.password = newPassword;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Reset form
    document.getElementById('passwordForm').reset();
    
    alert('Cập nhật mật khẩu thành công!');
}
