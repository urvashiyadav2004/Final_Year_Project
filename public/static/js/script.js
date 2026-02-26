function showAlert(message, type = 'danger') {
    const alertDiv = document.getElementById('alertMessage');
    if (!alertDiv) return;
    
    alertDiv.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
}

if (document.getElementById('signupForm')) {
    const signupForm = document.getElementById('signupForm');
    
    signupForm.addEventListener('submit', function(event) {
        event.preventDefault();
        event.stopPropagation();
        
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        
        let isValid = true;
        
        if (username.length < 3) {
            document.getElementById('username').classList.add('is-invalid');
            showAlert('Username must be at least 3 characters long');
            isValid = false;
        } else {
            document.getElementById('username').classList.remove('is-invalid');
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            document.getElementById('email').classList.add('is-invalid');
            showAlert('Please provide a valid email address');
            isValid = false;
        } else {
            document.getElementById('email').classList.remove('is-invalid');
        }
        
        if (password.length < 6) {
            document.getElementById('password').classList.add('is-invalid');
            showAlert('Password must be at least 6 characters');
            isValid = false;
        } else {
            document.getElementById('password').classList.remove('is-invalid');
        }
        
        if (password !== confirmPassword) {
            document.getElementById('confirmPassword').classList.add('is-invalid');
            showAlert('Passwords do not match');
            isValid = false;
        } else {
            document.getElementById('confirmPassword').classList.remove('is-invalid');
        }
        
        if (isValid) {
            signupForm.classList.add('was-validated');
            this.submit();
        }
    });
}

if (document.getElementById('loginForm')) {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        event.stopPropagation();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        let isValid = true;
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            document.getElementById('email').classList.add('is-invalid');
            showAlert('Please provide a valid email address');
            isValid = false;
        } else {
            document.getElementById('email').classList.remove('is-invalid');
        }
        
        if (password.length === 0) {
            document.getElementById('password').classList.add('is-invalid');
            showAlert('Please provide your password');
            isValid = false;
        } else {
            document.getElementById('password').classList.remove('is-invalid');
        }
        
        if (isValid) {
            loginForm.classList.add('was-validated');
            this.submit();
        }
    });
}

if (document.getElementById('healthForm')) {
    const healthForm = document.getElementById('healthForm');
    const submitBtn = document.getElementById('submitBtn');
    
    healthForm.addEventListener('submit', function(event) {
        event.preventDefault();
        event.stopPropagation();
        
        // Show loading state
        if (submitBtn) {
            const btnText = submitBtn.querySelector('.btn-text');
            const btnLoading = submitBtn.querySelector('.btn-loading');
            if (btnText && btnLoading) {
                btnText.style.display = 'none';
                btnLoading.style.display = 'inline';
            }
            submitBtn.disabled = true;
        }
        
        const age = parseFloat(document.getElementById('age').value);
        const gender = document.getElementById('gender').value;
        const height = parseFloat(document.getElementById('height').value);
        const weight = parseFloat(document.getElementById('weight').value);
        const activityLevel = document.querySelector('input[name="activity_level"]:checked');
        
        let isValid = true;
        
        if (!age || age < 1 || age > 120) {
            document.getElementById('age').classList.add('is-invalid');
            showAlert('Please enter a valid age (1-120)');
            isValid = false;
        } else {
            document.getElementById('age').classList.remove('is-invalid');
        }
        
        if (!gender) {
            document.getElementById('gender').classList.add('is-invalid');
            showAlert('Please select your gender');
            isValid = false;
        } else {
            document.getElementById('gender').classList.remove('is-invalid');
        }
        
        if (!height || height < 0.5 || height > 3) {
            document.getElementById('height').classList.add('is-invalid');
            showAlert('Please enter a valid height (0.5-3 meters)');
            isValid = false;
        } else {
            document.getElementById('height').classList.remove('is-invalid');
        }
        
        if (!weight || weight < 20 || weight > 300) {
            document.getElementById('weight').classList.add('is-invalid');
            showAlert('Please enter a valid weight (20-300 kg)');
            isValid = false;
        } else {
            document.getElementById('weight').classList.remove('is-invalid');
        }
        
        if (!activityLevel) {
            showAlert('Please select your activity level');
            isValid = false;
        }
        
        if (isValid) {
            healthForm.classList.add('was-validated');
            // Small delay to show loading animation
            setTimeout(() => {
                this.submit();
            }, 300);
        } else {
            // Reset button if validation fails
            if (submitBtn) {
                const btnText = submitBtn.querySelector('.btn-text');
                const btnLoading = submitBtn.querySelector('.btn-loading');
                if (btnText && btnLoading) {
                    btnText.style.display = 'inline';
                    btnLoading.style.display = 'none';
                }
                submitBtn.disabled = false;
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const success = urlParams.get('success');
    
    if (error) {
        showAlert(decodeURIComponent(error), 'danger');
    }
    
    if (success) {
        showAlert(decodeURIComponent(success), 'success');
    }
});