// Toggle Password Visibility
const togglePasswordBtns = document.querySelectorAll('.toggle-password');

togglePasswordBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const passwordInput = document.getElementById(targetId);
        const eyeIcon = this.querySelector('.eye-icon');
        
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);

        if (type === 'text') {
            eyeIcon.src = 'imgs/view.png';
            eyeIcon.alt = 'Hide Password';
        } else {
            eyeIcon.src = 'imgs/hidden.png';
            eyeIcon.alt = 'Show Password';
        }
    });
});

// Form Validation
const registerForm = document.getElementById('registerForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const confirmPasswordError = document.getElementById('confirmPasswordError');

registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    let isValid = true;
    
    // Reset errors
    emailInput.parentElement.classList.remove('error');
    passwordInput.parentElement.classList.remove('error');
    confirmPasswordInput.parentElement.classList.remove('error');
    
    // Kiểm tra các trường rỗng
    if (emailInput.value.trim() === '') {
        emailInput.parentElement.classList.add('error');
        emailError.textContent = 'Vui lòng nhập email của bạn';
        isValid = false;
    } else if (!isValidEmail(emailInput.value)) {
        emailInput.parentElement.classList.add('error');
        emailError.textContent = 'Email không hợp lệ / Email đã tồn tại';
        isValid = false;
    }
    
    if (passwordInput.value.trim() === '') {
        passwordInput.parentElement.classList.add('error');
        passwordError.textContent = 'Vui lòng nhập password';
        isValid = false;
    } else if (passwordInput.value.length < 8) {
        passwordInput.parentElement.classList.add('error');
        passwordError.textContent = 'Password cần ít nhất 8 ký tự';
        isValid = false;
    }
    
    if (confirmPasswordInput.value.trim() === '') {
        confirmPasswordInput.parentElement.classList.add('error');
        confirmPasswordError.textContent = 'Vui lòng nhập lại password';
        isValid = false;
    } else if (passwordInput.value !== confirmPasswordInput.value) {
        confirmPasswordInput.parentElement.classList.add('error');
        confirmPasswordError.textContent = 'Password không khớp';
        isValid = false;
    }
    
    // If validation passes
    if (isValid) {
        try {
            const resp = await fetch(`${window.API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email: emailInput.value, password: passwordInput.value, full_name: '' })
            });
            if (!resp.ok) {
                const data = await resp.json().catch(() => ({}));
                alert(data.message || 'Đăng ký thất bại');
                return;
            }
            const data = await resp.json();
            // Backend sets cookie and returns user info
            localStorage.setItem('currentUser', JSON.stringify({ id: data.id, email: data.email, full_name: data.full_name }));
            localStorage.setItem('isLoggedIn', 'true');
            alert('Đăng ký thành công!');
            window.location.href = 'index.html';
        } catch (err) {
            alert('Lỗi mạng, thử lại sau');
        }
    }
});

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