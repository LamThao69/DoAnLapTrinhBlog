// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Toggle Password Visibility
const togglePassword = document.querySelector('.toggle-password');
const passwordInput = document.getElementById('password');
const eyeIcon = document.getElementById('eyeIcon');

if (togglePassword && passwordInput && eyeIcon) {
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);

        if (type === 'text') {
            eyeIcon.src = '../assets/imgs/view.png';
            eyeIcon.alt = 'Hide Password';
        } else {
            eyeIcon.src = '../assets/imgs/hidden.png';
            eyeIcon.alt = 'Show Password';
        }
    });
}

// Form Elements
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const generalError = document.getElementById('generalError');

// Clear error when user starts typing
if (emailInput) {
    emailInput.addEventListener('input', function() {
        if (this.parentElement) {
            this.parentElement.classList.remove('error');
        }
        if (generalError) {
            generalError.classList.remove('show');
        }
    });
}

if (passwordInput) {
    passwordInput.addEventListener('input', function() {
        if (this.parentElement) {
            this.parentElement.classList.remove('error');
        }
        if (generalError) {
            generalError.classList.remove('show');
        }
    });
}

// Form Submit Handler
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Reset tất cả errors
        if (emailInput && emailInput.parentElement) {
            emailInput.parentElement.classList.remove('error');
        }
        if (passwordInput && passwordInput.parentElement) {
            passwordInput.parentElement.classList.remove('error');
        }
        if (generalError) {
            generalError.classList.remove('show');
        }
        
        // Validation
        const email = emailInput ? emailInput.value.trim() : '';
        const password = passwordInput ? passwordInput.value.trim() : '';
        
        // Kiểm tra trường rỗng
        if (email === '' && password === '') {
            if (emailInput && emailError) {
                emailInput.parentElement.classList.add('error');
                emailError.textContent = 'Vui lòng nhập email của bạn';
            }
            if (passwordInput && passwordError) {
                passwordInput.parentElement.classList.add('error');
                passwordError.textContent = 'Vui lòng nhập password của bạn';
            }
            return;
        }
        
        if (email === '') {
            if (emailInput && emailError) {
                emailInput.parentElement.classList.add('error');
                emailError.textContent = 'Vui lòng nhập email của bạn';
            }
            return;
        }
        
        if (password === '') {
            if (passwordInput && passwordError) {
                passwordInput.parentElement.classList.add('error');
                passwordError.textContent = 'Vui lòng nhập password của bạn';
            }
            return;
        }
        
        // Kiểm tra định dạng email
        if (!isValidEmail(email)) {
            if (emailInput && emailError) {
                emailInput.parentElement.classList.add('error');
                emailError.textContent = 'Email không hợp lệ';
            }
            return;
        }
        
        // Xóa tất cả dữ liệu user cũ trước khi đăng nhập
        clearAllUserData();
        
        // Gọi API đăng nhập
        try {
            console.log('Attempting login with email:', email);
            
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const data = await response.json();
            console.log('Login response:', data);

            if (!response.ok) {
                // Hiển thị lỗi từ server
                if (generalError) {
                    generalError.textContent = data.error || 'Đăng nhập thất bại';
                    generalError.classList.add('show');
                }
                return;
            }

            // Đăng nhập thành công - lưu token
            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('isLoggedIn', 'true');
                
                // Lưu thông tin user
                if (data.user) {
                    localStorage.setItem('currentUser', JSON.stringify(data.user));
                }
                
                // Kiểm tra role để chuyển trang phù hợp
                if (data.user && data.user.role === 'ADMIN') {
                    localStorage.setItem('isAdminLoggedIn', 'true');
                    alert('Đăng nhập admin thành công!');
                    window.location.href = 'admin.html';
                } else {
                    alert('Đăng nhập thành công!');
                    window.location.href = 'index.html';
                }
            } else {
                if (generalError) {
                    generalError.textContent = 'Không nhận được token từ server';
                    generalError.classList.add('show');
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            if (generalError) {
                generalError.textContent = 'Lỗi kết nối đến server. Vui lòng thử lại.';
                generalError.classList.add('show');
            }
        }
    });
}

// Xóa tất cả dữ liệu user cũ
function clearAllUserData() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userAvatar');
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('adminEmail');
}

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}