// Toggle Password Visibility
const togglePassword = document.querySelector('.toggle-password');
const passwordInput = document.getElementById('password');
const eyeIcon = document.getElementById('eyeIcon'); 

if (togglePassword) {
    togglePassword.addEventListener('click', function() {
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
}

// Form Validation
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const generalError = document.getElementById('generalError');

loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    // Simple client-side validation
    if (emailInput.value.trim() === '' || passwordInput.value.trim() === '') {
        generalError.classList.add('show');
        generalError.textContent = 'Vui lòng nhập email và password';
        return;
    }
    if (!isValidEmail(emailInput.value)) {
        emailInput.parentElement.classList.add('error');
        emailError.textContent = 'Email không hợp lệ';
        return;
    }

    try {
        const resp = await fetch(`${window.API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // include cookies (HttpOnly)
            body: JSON.stringify({ email: emailInput.value, password: passwordInput.value })
        });
        if (!resp.ok) {
            const data = await resp.json().catch(() => ({}));
            generalError.classList.add('show');
            generalError.textContent = data.message || 'Đăng nhập thất bại';
            return;
        }
        const data = await resp.json();
        // Backend sets HttpOnly cookie; store minimal user info locally for UI
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        localStorage.setItem('isLoggedIn', 'true');
        alert('Đăng nhập thành công!');
        if (data.user && data.user.role === 'admin') window.location.href = 'admin.html';
        else window.location.href = 'index.html';
    } catch (err) {
        generalError.classList.add('show');
        generalError.textContent = 'Lỗi mạng, thử lại sau';
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
        generalError.classList.remove('show');
    }
});

passwordInput.addEventListener('input', function() {
    if (this.value.trim() !== '') {
        this.parentElement.classList.remove('error');
        generalError.classList.remove('show');
    }
});