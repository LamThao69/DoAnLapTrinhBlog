// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Toggle Password Visibility
const togglePasswordBtns = document.querySelectorAll('.toggle-password');

togglePasswordBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const passwordInput = document.getElementById(targetId);
        const eyeIcon = this.querySelector('.eye-icon');
        
        if (passwordInput && eyeIcon) {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);

            if (type === 'text') {
                eyeIcon.src = '../assets/imgs/view.png';
                eyeIcon.alt = 'Hide Password';
            } else {
                eyeIcon.src = '../assets/imgs/hidden.png';
                eyeIcon.alt = 'Show Password';
            }
        }
    });
});

// Form Elements
const registerForm = document.getElementById('registerForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const confirmPasswordError = document.getElementById('confirmPasswordError');

// Clear errors on input
if (emailInput) {
    emailInput.addEventListener('input', function() {
        if (this.parentElement) {
            this.parentElement.classList.remove('error');
        }
    });
}

if (passwordInput) {
    passwordInput.addEventListener('input', function() {
        if (this.parentElement) {
            this.parentElement.classList.remove('error');
        }
        
        // Also check confirm password match if it has value
        if (confirmPasswordInput && confirmPasswordInput.value.trim() !== '') {
            if (this.value === confirmPasswordInput.value && confirmPasswordInput.parentElement) {
                confirmPasswordInput.parentElement.classList.remove('error');
            }
        }
    });
}

if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener('input', function() {
        if (this.value.trim() !== '' && passwordInput) {
            if (this.value === passwordInput.value && this.parentElement) {
                this.parentElement.classList.remove('error');
            }
        }
    });
}

// Form Submit Handler
if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        let isValid = true;
        
        // Reset errors
        if (emailInput && emailInput.parentElement) {
            emailInput.parentElement.classList.remove('error');
        }
        if (passwordInput && passwordInput.parentElement) {
            passwordInput.parentElement.classList.remove('error');
        }
        if (confirmPasswordInput && confirmPasswordInput.parentElement) {
            confirmPasswordInput.parentElement.classList.remove('error');
        }
        
        // Get values
        const email = emailInput ? emailInput.value.trim() : '';
        const password = passwordInput ? passwordInput.value.trim() : '';
        const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value.trim() : '';
        
        // Validation - Email
        if (email === '') {
            if (emailInput && emailError) {
                emailInput.parentElement.classList.add('error');
                emailError.textContent = 'Vui lòng nhập email của bạn';
            }
            isValid = false;
        } else if (!isValidEmail(email)) {
            if (emailInput && emailError) {
                emailInput.parentElement.classList.add('error');
                emailError.textContent = 'Email không hợp lệ';
            }
            isValid = false;
        }
        
        // Validation - Password
        if (password === '') {
            if (passwordInput && passwordError) {
                passwordInput.parentElement.classList.add('error');
                passwordError.textContent = 'Vui lòng nhập password';
            }
            isValid = false;
        } else if (password.length < 8) {
            if (passwordInput && passwordError) {
                passwordInput.parentElement.classList.add('error');
                passwordError.textContent = 'Password cần ít nhất 8 ký tự';
            }
            isValid = false;
        }
        
        // Validation - Confirm Password
        if (confirmPassword === '') {
            if (confirmPasswordInput && confirmPasswordError) {
                confirmPasswordInput.parentElement.classList.add('error');
                confirmPasswordError.textContent = 'Vui lòng nhập lại password';
            }
            isValid = false;
        } else if (password !== confirmPassword) {
            if (confirmPasswordInput && confirmPasswordError) {
                confirmPasswordInput.parentElement.classList.add('error');
                confirmPasswordError.textContent = 'Password không khớp';
            }
            isValid = false;
        }
        
        // If validation passes, gọi API đăng ký
        if (isValid) {
            try {
                console.log('Attempting register with email:', email);
                
                const response = await fetch(`${API_BASE_URL}/auth/register`, {
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
                console.log('Register response:', data);

                if (!response.ok) {
                    // Hiển thị lỗi từ server
                    const errorMsg = data.error || 'Đăng ký thất bại';
                    
                    if (errorMsg.toLowerCase().includes('email')) {
                        if (emailInput && emailError) {
                            emailInput.parentElement.classList.add('error');
                            emailError.textContent = errorMsg;
                        }
                    } else {
                        alert(errorMsg);
                    }
                    return;
                }

                // Đăng ký thành công - lưu token và chuyển trang
                if (data.token) {
                    // Xóa dữ liệu cũ
                    clearAllUserData();
                    
                    // Lưu token mới
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('isLoggedIn', 'true');
                    
                    alert('Đăng ký thành công!');
                    window.location.href = 'index.html';
                } else {
                    alert('Đăng ký thành công nhưng không nhận được token');
                }
            } catch (error) {
                console.error('Register error:', error);
                alert('Lỗi kết nối đến server. Vui lòng thử lại.');
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

// Clear error on input
emailInput.addEventListener('input', function() {
    if (this.value.trim() !== '') {
        this.parentElement.classList.remove('error');
    }
});

passwordInput.addEventListener('input', function() {
    if (this.value.trim() !== '') {
        this.parentElement.classList.remove('error');
    }
    
    // Also check confirm password match if it has value
    if (confirmPasswordInput.value.trim() !== '') {
        if (this.value === confirmPasswordInput.value) {
            confirmPasswordInput.parentElement.classList.remove('error');
        }
    }
});

confirmPasswordInput.addEventListener('input', function() {
    if (this.value.trim() !== '') {
        if (this.value === passwordInput.value) {
            this.parentElement.classList.remove('error');
        }
    }
});