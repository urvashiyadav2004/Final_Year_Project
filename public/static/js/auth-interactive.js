// Password Strength Indicator
function checkPasswordStrength(password) {
    let strength = 0;
    let feedback = [];
    
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    const strengthLevels = {
        0: { text: 'Very Weak', color: 'danger', width: '20%' },
        1: { text: 'Weak', color: 'danger', width: '40%' },
        2: { text: 'Fair', color: 'warning', width: '60%' },
        3: { text: 'Good', color: 'info', width: '80%' },
        4: { text: 'Strong', color: 'success', width: '95%' },
        5: { text: 'Very Strong', color: 'success', width: '100%' }
    };
    
    return strengthLevels[strength] || strengthLevels[0];
}

// Real-time password strength check
document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const passwordStrength = document.getElementById('passwordStrength');
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');
    const passwordMatch = document.getElementById('passwordMatch');
    const matchText = document.getElementById('matchText');
    
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            
            if (password.length > 0) {
                passwordStrength.style.display = 'block';
                const strength = checkPasswordStrength(password);
                
                strengthBar.style.width = strength.width;
                strengthBar.className = 'progress-bar bg-' + strength.color;
                strengthText.textContent = 'Password strength: ' + strength.text;
            } else {
                passwordStrength.style.display = 'none';
            }
        });
    }
    
    // Password match indicator
    if (confirmPasswordInput && passwordInput) {
        function checkPasswordMatch() {
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            
            if (confirmPassword.length > 0) {
                passwordMatch.style.display = 'block';
                
                if (password === confirmPassword) {
                    matchText.textContent = '✓ Passwords match';
                    matchText.className = 'text-success';
                    confirmPasswordInput.classList.remove('is-invalid');
                    confirmPasswordInput.classList.add('is-valid');
                } else {
                    matchText.textContent = '✗ Passwords do not match';
                    matchText.className = 'text-danger';
                    confirmPasswordInput.classList.remove('is-valid');
                    confirmPasswordInput.classList.add('is-invalid');
                }
            } else {
                passwordMatch.style.display = 'none';
                confirmPasswordInput.classList.remove('is-valid', 'is-invalid');
            }
        }
        
        passwordInput.addEventListener('input', checkPasswordMatch);
        confirmPasswordInput.addEventListener('input', checkPasswordMatch);
    }
    
    // Add entrance animations
    const authContainer = document.querySelector('.auth-form-container');
    if (authContainer) {
        authContainer.style.opacity = '0';
        authContainer.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            authContainer.style.transition = 'all 0.6s ease-out';
            authContainer.style.opacity = '1';
            authContainer.style.transform = 'translateY(0)';
        }, 100);
    }
    
    // Add floating animation to medical icon
    const medicalIcon = document.querySelector('.medical-icon');
    if (medicalIcon) {
        medicalIcon.style.animation = 'float 3s ease-in-out infinite';
    }
    
    // Form input focus effects
    const formInputs = document.querySelectorAll('.form-control');
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
            this.parentElement.style.transition = 'transform 0.2s ease';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
    });
});