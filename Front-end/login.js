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

loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    let isValid = true;
    
    // Reset tất cả errors
    emailInput.parentElement.classList.remove('error');
    passwordInput.parentElement.classList.remove('error');
    generalError.classList.remove('show');
    
    // Kiểm tra trường rỗng
    if (emailInput.value.trim() === '' && passwordInput.value.trim() === '') {
        // Cả 2 trường đều rỗng
        emailInput.parentElement.classList.add('error');
        passwordInput.parentElement.classList.add('error');
        emailError.textContent = 'Vui lòng nhập email của bạn';
        passwordError.textContent = 'Vui lòng nhập password của bạn';
        return;
    }
    
    if (emailInput.value.trim() === '') {
        // Chỉ email rỗng
        emailInput.parentElement.classList.add('error');
        emailError.textContent = 'Vui lòng nhập email của bạn';
        return;
    }
    
    if (passwordInput.value.trim() === '') {
        // Chỉ password rỗng
        passwordInput.parentElement.classList.add('error');
        passwordError.textContent = 'Vui lòng nhập password của bạn';
        return;
    }
    
    // Kiểm tra định dạng email
    if (!isValidEmail(emailInput.value)) {
        emailInput.parentElement.classList.add('error');
        emailError.textContent = 'Email không hợp lệ';
        return;
    }
    
    // Nếu cả 2 đều có giá trị và email hợp lệ -> đăng nhập thành công (tạm thời)
    // Lưu user vào localStorage
    const userData = {
        email: emailInput.value,
        password: passwordInput.value,
        remember: document.getElementById('remember').checked
    };
    localStorage.setItem('currentUser', JSON.stringify(userData));
    localStorage.setItem('isLoggedIn', 'true');
    
    // Hiển thị thành công và chuyển trang
    alert('Đăng nhập thành công!');
    window.location.href = 'index.html';
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