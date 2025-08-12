document.addEventListener('DOMContentLoaded', function () {
       // Preloader
   const preloader = document.querySelector('.preloader');
    
   // Hide preloader when page is loaded
   window.addEventListener('load', function() {
       preloader.classList.add('fade-out');
       setTimeout(() => {
           preloader.style.display = 'none';
       }, 500);
   });

    // Password toggle functionality
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('loginPassword');

    togglePassword.addEventListener('click', function () {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    });

    // Form submission with animation
    const form = document.getElementById('loginForm');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Get form values
        const loginId = document.getElementById('loginId').value.trim();
        const password = document.getElementById('loginPassword').value.trim();

        // Clear previous errors
        document.querySelectorAll('.error-message').forEach(el => el.remove());

        // Validation flags
        let isValid = true;

        // Simple validation
        if (!loginId) {
            showError('Please enter your email or phone number');
            isValid = false;
        } else {
            // Check if loginId is email or phone
            if (loginId.includes('@')) {
                // Validate email format
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginId)) {
                    showError('Please enter a valid email address');
                    isValid = false;
                }
            } else {
                // Validate phone number (10 digits)
                if (!/^\d{10}$/.test(loginId)) {
                    showError('Phone number must be 10 digits');
                    isValid = false;
                }
            }
        }

        if (!password) {
            showError('Please enter your password');
            isValid = false;
        } else if (password.length < 8) {
            showError('Password must be at least 8 characters');
            isValid = false;
        }

        if (!isValid) return;

        // Create submit button animation
        const button = document.querySelector('.premium-btn');
        button.disabled = true;
        button.innerHTML = '<span>Authenticating...</span><div class="btn-decoration"></div>';

        try {
            // Make API call to login endpoint
            const response = await fetch("http://localhost:3000/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ loginId, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Success animation
                gsap.to('.premium-card', {
                    y: -10,
                    duration: 0.3,
                    ease: 'power2.out'
                });

                gsap.to('.premium-card', {
                    y: 0,
                    duration: 0.5,
                    delay: 0.3,
                    ease: 'elastic.out(1, 0.5)'
                });

                // Show success message
                const originalContent = form.innerHTML;
                form.innerHTML = `
                    <div class="success-message animate__animated animate__fadeIn">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="${getComputedStyle(document.documentElement).getPropertyValue('--success-color')}"/>
                        </svg>
                        <h3 class="mt-4">Welcome Back!</h3>
                        <p>SRI ANNAKAMATCHI TRADERS</p>
                        <div class="progress-bar">
                            <div class="progress-fill"></div>
                        </div>
                    </div>
                `;

                // Animate progress bar
                gsap.to('.progress-fill', {
                    width: '100%',
                    duration: 3,
                    ease: 'linear',
                    onComplete: () => {
                        window.location.href = "payment.html"; // Redirect to homepage
                    }
                });
            } else {
                // Show error message from server
                showError(data.message || "Login failed. Please try again.");
                button.disabled = false;
                button.innerHTML = '<span>Login</span><div class="btn-decoration"></div>';
            }
        } catch (error) {
            console.error("Login Error:", error);
            showError("An error occurred. Please try again.");
            button.disabled = false;
            button.innerHTML = '<span>Login</span><div class="btn-decoration"></div>';
        }
    });

    // Phone number input validation (when entered as login ID)
    const loginIdInput = document.getElementById('loginId');
    loginIdInput.addEventListener('input', function () {
        // Allow only letters, numbers, and the '@' symbol
        this.value = this.value.replace(/[^a-zA-Z0-9@.]/g, '');
    });

    // Input focus animations
    const inputs = document.querySelectorAll('.input-group input');
    inputs.forEach(input => {
        input.addEventListener('focus', function () {
            const label = this.nextElementSibling;
            gsap.to(label, {
                y: -5,
                duration: 0.2,
                ease: 'power2.out'
            });
        });

        input.addEventListener('blur', function () {
            if (!this.value) {
                const label = this.nextElementSibling;
                gsap.to(label, {
                    y: 0,
                    duration: 0.2,
                    ease: 'power2.out'
                });
            }
        });
    });

    // Helper function to show error messages
    function showError(message) {
        // Clear any existing error messages
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Create a new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message animate__animated animate__headShake';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;

        const form = document.getElementById('loginForm');
        form.insertBefore(errorDiv, form.firstChild);

        // Automatically remove the error message after a delay
        setTimeout(() => {
            errorDiv.classList.remove('animate__headShake');
            setTimeout(() => {
                errorDiv.remove();
            }, 3000);
        }, 1000);
    }

    // Background texture animation
    gsap.to('.texture-overlay', {
        backgroundPosition: '100% 100%',
        duration: 60,
        repeat: -1,
        ease: 'none'
    });
});