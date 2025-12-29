// ===== FORGOT PASSWORD - STATE MANAGEMENT =====

const ForgotPasswordState = {
    userEmail: '',
    generatedOTP: '123456', // TODO: Thay bằng API gửi OTP thực tế
    timerInterval: null,
    countdownInterval: null,
    currentStep: 'email',
    
    setStep(stepName) {
        console.log(`[ForgotPassword] Moving to step: ${stepName}`);
        
        // Ẩn tất cả
        document.getElementById('step1-email').classList.remove('active');
        document.getElementById('step2-otp').classList.remove('active');
        document.getElementById('step3-reset').classList.remove('active');
        document.getElementById('successMessage').classList.remove('active');
        
        // Hiển thị step được chọn
        if (stepName === 'email') {
            document.getElementById('step1-email').classList.add('active');
        } else if (stepName === 'otp') {
            document.getElementById('step2-otp').classList.add('active');
        } else if (stepName === 'reset') {
            document.getElementById('step3-reset').classList.add('active');
        } else if (stepName === 'success') {
            document.getElementById('successMessage').classList.add('active');
        }
        
        this.currentStep = stepName;
    },
    
    clearTimers() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
    }
};

// ===== INITIALIZATION =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('[ForgotPassword] DOM Loaded');
    
    // Luôn bắt đầu với step email
    ForgotPasswordState.setStep('email');
    
    // Setup tất cả form handlers
    setupEmailForm();
    setupOTPForm();
    setupResetForm();
    setupPasswordToggles();
    
    console.log('[ForgotPassword] Initialization complete');
});

// ===== STEP 1: EMAIL =====

function setupEmailForm() {
    const form = document.getElementById('emailForm');
    if (!form) {
        console.error('[Email] Form element not found');
        return;
    }
    
    console.log('[Email] Setting up email form');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const emailInput = document.getElementById('emailInput');
        const errorElement = document.getElementById('emailError');
        const email = emailInput.value.trim();
        
        console.log('[Email] Form submitted with email:', email);
        
        // Clear previous errors
        emailInput.classList.remove('error');
        errorElement.textContent = '';
        
        // Validation
        if (!email) {
            emailInput.classList.add('error');
            errorElement.textContent = 'Vui lòng nhập email';
            return;
        }
        
        if (!isValidEmail(email)) {
            emailInput.classList.add('error');
            errorElement.textContent = 'Email không hợp lệ';
            return;
        }
        
        console.log('[Email] Email is valid, moving to OTP step');
        ForgotPasswordState.userEmail = email;
        moveToOTPStep(email);
    });
    
    // Clear error on input
    document.getElementById('emailInput').addEventListener('input', function() {
        if (this.value.trim()) {
            this.classList.remove('error');
            document.getElementById('emailError').textContent = '';
        }
    });
}

function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function moveToOTPStep(email) {
    ForgotPasswordState.setStep('otp');
    
    const emailDisplay = document.getElementById('otpEmail');
    if (emailDisplay) {
        emailDisplay.textContent = `Mã xác nhận đã được gửi đến ${email}`;
    }
    
    // Reset OTP inputs
    document.querySelectorAll('.otp-input').forEach(input => {
        input.value = '';
        input.disabled = false;
        input.classList.remove('error');
    });
    
    // Start timer
    startOTPTimer();
    setupOTPInputNavigation();
}

// ===== STEP 2: OTP =====

function startOTPTimer() {
    console.log('[OTP] Starting 60-second timer');
    
    let timeLeft = 60;
    const timerElement = document.getElementById('timer');
    const resendBtn = document.getElementById('resendBtn');
    const resendWait = document.getElementById('resendWait');
    
    if (!timerElement) {
        console.error('[OTP] Timer element not found');
        return;
    }
    
    // Clear existing timers
    ForgotPasswordState.clearTimers();
    
    // Hide resend button initially
    resendBtn.style.display = 'none';
    resendWait.textContent = '';
    timerElement.classList.remove('danger');
    
    ForgotPasswordState.timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;
        
        // Change color to red when ≤ 10 seconds
        if (timeLeft <= 10) {
            timerElement.classList.add('danger');
        }
        
        // When timer ends
        if (timeLeft === 0) {
            clearInterval(ForgotPasswordState.timerInterval);
            console.log('[OTP] Timer ended');
            
            // Disable inputs and show resend button
            document.querySelectorAll('.otp-input').forEach(input => {
                input.disabled = true;
            });
            
            resendBtn.style.display = 'inline';
            resendBtn.addEventListener('click', function(e) {
                e.preventDefault();
                resendOTP();
            });
        }
    }, 1000);
}

function resendOTP() {
    console.log('[OTP] Resending OTP');
    
    // Reset timer
    startOTPTimer();
    
    // Clear inputs
    document.querySelectorAll('.otp-input').forEach(input => {
        input.value = '';
        input.disabled = false;
        input.classList.remove('error');
    });
    
    document.querySelectorAll('.otp-input')[0].focus();
}

function setupOTPInputNavigation() {
    const inputs = document.querySelectorAll('.otp-input');
    console.log('[OTP] Setting up navigation for', inputs.length, 'inputs');
    
    inputs.forEach((input, index) => {
        // Remove previous listeners by cloning
        const newInput = input.cloneNode(true);
        input.parentNode.replaceChild(newInput, input);
        
        // Input number only
        newInput.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^0-9]/g, '');
            
            // Auto-advance to next
            if (this.value && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });
        
        // Backspace navigation
        newInput.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && !this.value && index > 0) {
                inputs[index - 1].focus();
            }
        });
        
        // Paste support
        newInput.addEventListener('paste', function(e) {
            e.preventDefault();
            const pastedText = (e.clipboardData || window.clipboardData).getData('text');
            const digits = pastedText.replace(/[^0-9]/g, '').split('');
            
            digits.forEach((digit, i) => {
                if (index + i < inputs.length) {
                    inputs[index + i].value = digit;
                }
            });
            
            const nextIndex = Math.min(index + digits.length, inputs.length - 1);
            inputs[nextIndex].focus();
        });
    });
}

function setupOTPForm() {
    const form = document.getElementById('otpForm');
    if (!form) {
        console.error('[OTP] OTP form not found');
        return;
    }
    
    console.log('[OTP] Setting up OTP form');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const inputs = document.querySelectorAll('.otp-input');
        const otp = Array.from(inputs).map(input => input.value).join('');
        const errorElement = document.getElementById('otpError');
        
        console.log('[OTP] Form submitted. Entered:', otp, 'Expected:', ForgotPasswordState.generatedOTP);
        
        // Validate length
        if (otp.length !== 6) {
            console.log('[OTP] Invalid length');
            errorElement.textContent = 'Vui lòng nhập đầy đủ 6 chữ số';
            inputs.forEach(input => input.classList.add('error'));
            return;
        }
        
        // Check OTP
        if (otp === ForgotPasswordState.generatedOTP) {
            console.log('[OTP] OTP is correct!');
            
            ForgotPasswordState.clearTimers();
            errorElement.textContent = '';
            inputs.forEach(input => input.classList.remove('error'));
            
            moveToResetStep();
        } else {
            console.log('[OTP] OTP is incorrect');
            errorElement.textContent = 'Mã xác nhận không chính xác';
            inputs.forEach(input => {
                input.classList.add('error');
                input.value = '';
            });
            inputs[0].focus();
        }
    });
}

function moveToResetStep() {
    ForgotPasswordState.setStep('reset');
    
    // Clear password fields
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    document.getElementById('newPassword').focus();
}

// ===== STEP 3: RESET PASSWORD =====

function setupResetForm() {
    const form = document.getElementById('resetForm');
    if (!form) {
        console.error('[Reset] Reset form not found');
        return;
    }
    
    console.log('[Reset] Setting up reset form');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newPassword = document.getElementById('newPassword');
        const confirmPassword = document.getElementById('confirmPassword');
        const passwordError = document.getElementById('passwordError');
        const confirmError = document.getElementById('confirmPasswordError');
        
        const newPass = newPassword.value.trim();
        const confirmPass = confirmPassword.value.trim();
        
        console.log('[Reset] Form submitted');
        
        // Clear previous errors
        newPassword.classList.remove('error');
        confirmPassword.classList.remove('error');
        passwordError.textContent = '';
        confirmError.textContent = '';
        
        let isValid = true;
        
        // Validate new password
        if (!newPass) {
            newPassword.classList.add('error');
            passwordError.textContent = 'Vui lòng nhập mật khẩu mới';
            isValid = false;
        } else if (newPass.length < 8) {
            newPassword.classList.add('error');
            passwordError.textContent = 'Mật khẩu phải có ít nhất 8 ký tự';
            isValid = false;
        }
        
        // Validate confirm password
        if (!confirmPass) {
            confirmPassword.classList.add('error');
            confirmError.textContent = 'Vui lòng xác nhận mật khẩu';
            isValid = false;
        } else if (newPass !== confirmPass) {
            confirmPassword.classList.add('error');
            confirmError.textContent = 'Mật khẩu không khớp';
            isValid = false;
        }
        
        if (!isValid) {
            console.log('[Reset] Validation failed');
            return;
        }
        
        console.log('[Reset] All validation passed, showing success');
        showSuccessMessage(newPass);
    });
    
    // Clear errors on input
    document.getElementById('newPassword').addEventListener('input', function() {
        if (this.value.trim()) {
            this.classList.remove('error');
            document.getElementById('passwordError').textContent = '';
        }
    });
    
    document.getElementById('confirmPassword').addEventListener('input', function() {
        if (this.value.trim()) {
            this.classList.remove('error');
            document.getElementById('confirmPasswordError').textContent = '';
        }
    });
}

function showSuccessMessage(newPassword) {
    console.log('[Success] Showing success message');
    
    // Save password to localStorage
    const userData = {
        email: ForgotPasswordState.userEmail,
        password: newPassword
    };
    localStorage.setItem('currentUser', JSON.stringify(userData));
    console.log('[Success] Password saved to localStorage');
    
    // Move to success step
    ForgotPasswordState.setStep('success');
    
    // Show countdown
    let countdown = 3;
    const successP = document.querySelector('.success-box p');
    
    const updateText = () => {
        successP.textContent = `Bạn sẽ được chuyển hướng đến trang đăng nhập trong ${countdown} giây...`;
    };
    
    updateText();
    
    ForgotPasswordState.countdownInterval = setInterval(() => {
        countdown--;
        if (countdown >= 0) {
            updateText();
        } else {
            clearInterval(ForgotPasswordState.countdownInterval);
            console.log('[Success] Redirecting to login.html');
            window.location.href = 'login.html';
        }
    }, 1000);
}

// ===== PASSWORD TOGGLE =====

function setupPasswordToggles() {
    const toggles = document.querySelectorAll('.toggle-password');
    console.log('[Toggle] Setting up', toggles.length, 'password toggles');
    
    toggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('data-target');
            const input = document.getElementById(targetId);
            const icon = this.querySelector('img');
            
            if (!input || !icon) {
                console.error('[Toggle] Input or icon not found for', targetId);
                return;
            }
            
            const isPassword = input.getAttribute('type') === 'password';
            input.setAttribute('type', isPassword ? 'text' : 'password');
            icon.src = isPassword ? '../assets/imgs/view.png' : '../assets/imgs/hidden.png';
        });
    });
}
