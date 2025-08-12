document.addEventListener('DOMContentLoaded', function() {
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
    const passwordInput = document.getElementById('password');
    
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    });
    
    // Form submission with animation
    const form = document.getElementById('signupForm');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById('name').value.trim();
        const age = document.getElementById('age').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const terms = document.getElementById('terms').checked;
        
        // Clear previous errors
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        
        // Validation flags
        let isValid = true;
        let errorCount = 0;
        
        // Enhanced validation with better error messages
        if (!name) {
            showError('name', 'Full name is required');
            isValid = false;
            errorCount++;
        } else if (name.length < 3) {
            showError('name', 'Name must be at least 3 characters');
            isValid = false;
            errorCount++;
        }
        
        if (!age) {
            showError('age', 'Age is required');
            isValid = false;
            errorCount++;
        } else if (isNaN(age)) {
            showError('age', 'Age must be a number');
            isValid = false;
            errorCount++;
        } else if (age < 18) {
            showError('age', 'You must be at least 18 years old');
            isValid = false;
            errorCount++;
        } else if (age > 99) {
            showError('age', 'Please enter a valid age');
            isValid = false;
            errorCount++;
        }
        
        if (!phone) {
            showError('phone', 'Phone number is required');
            isValid = false;
            errorCount++;
        } else if (!/^\d{10}$/.test(phone)) {
            showError('phone', 'Phone number must be 10 digits');
            isValid = false;
            errorCount++;
        }
        
        if (!email) {
            showError('email', 'Email address is required');
            isValid = false;
            errorCount++;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showError('email', 'Please enter a valid email address');
            isValid = false;
            errorCount++;
        }
        
        if (!password) {
            showError('password', 'Password is required');
            isValid = false;
            errorCount++;
        } else if (password.length < 8) {
            showError('password', 'Password must be at least 8 characters');
            isValid = false;
            errorCount++;
        } else if (!/[A-Z]/.test(password)) {
            showError('password', 'Password must contain at least one uppercase letter');
            isValid = false;
            errorCount++;
        } else if (!/[0-9]/.test(password)) {
            showError('password', 'Password must contain at least one number');
            isValid = false;
            errorCount++;
        }
        
        if (!terms) {
            showError('terms', 'You must agree to the terms and conditions');
            isValid = false;
            errorCount++;
        }
        
        if (errorCount > 0) {
            // Only show error alert if there are validation errors
            showSweetAlert('error', 'Validation Error', `Please fix ${errorCount} error${errorCount > 1 ? 's' : ''} in the form`);
            return;
        }
        
        if (!isValid) return;
        
        // Create submit button animation
        const button = document.querySelector('.premium-btn');
        const originalButtonText = button.innerHTML;
        button.disabled = true;
        button.innerHTML = '<span>Creating Account...</span><div class="btn-decoration"></div>';
        
        try {
            // Prepare data for API
            const data = {
                name,
                age: parseInt(age),
                phone,
                email,
                password
            };
            
            // Make API call
            const response = await fetch("http://localhost:3000/api/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            
            const result = await response.json();
            
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
                
                // Animate progress bar
                gsap.to('.progress-fill', {
                    width: '100%', 
                    duration: 3,
                    ease: 'linear',
                    onComplete: () => {
                        console.log("Animation complete. Redirecting...");
                        showSweetAlert('success', 'Account Created!', 'Your account has been successfully created. Welcome to ANNAKAMATCHI TRADERS!', true).then(() => {
                            window.location.href = "index.html";
                        });

                        // Fallback redirection in case of issues
                        setTimeout(() => {
                            window.location.href = "index.html";
                        }, 5000);
                    }
                });
            } else {
                // Handle API errors
                if (response.status === 409) {
                    // Conflict - duplicate data
                    if (result.message.includes('email')) {
                        showError('email', 'This email is already registered');
                    } else if (result.message.includes('phone')) {
                        showError('phone', 'This phone number is already registered');
                    } else {
                        showSweetAlert('error', 'Registration Error', result.message || 'This data is already registered');
                    }
                } else {
                    showSweetAlert('error', 'Registration Error', result.message || 'Something went wrong. Please try again.');
                }
            }
        } catch (error) {
            console.error("Error:", error);
            showSweetAlert('error', 'Network Error', 'Please check your connection and try again.');
        } finally {
            // Reset button state
            button.disabled = false;
            button.innerHTML = originalButtonText;
        }
    });
    
    // ... rest of your existing code (phone input validation, age input validation, input focus animations, etc.)
    
    // Helper function to show error messages next to fields
    function showError(fieldId, message) {
        // Remove any existing error for this field
        const existingError = document.querySelector(`.error-${fieldId}`);
        if (existingError) {
            existingError.remove();
        }
        
        const fieldElement = document.getElementById(fieldId);
        const errorDiv = document.createElement('div');
        errorDiv.className = `error-message error-${fieldId} text-danger mt-1 animate__animated animate__headShake`;
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-circle me-2"></i>
            <span>${message}</span>
        `;
        
        // Insert after the field
        fieldElement.parentNode.insertBefore(errorDiv, fieldElement.nextSibling);
        
        // Highlight the field
        fieldElement.classList.add('is-invalid');
        
        // Remove error after field is corrected
        fieldElement.addEventListener('input', function() {
            if (this.value.trim()) {
                this.classList.remove('is-invalid');
                errorDiv.remove();
            }
        }, { once: true });
    }
    
    // SweetAlert2 alert function with updated "OK" button style
    function showSweetAlert(icon, title, text, showConfetti = false) {
        const Toast = Swal.mixin({
            customClass: {
                container: 'custom-swal-container',
                popup: 'custom-swal-popup',
                header: 'custom-swal-header',
                title: 'custom-swal-title',
                closeButton: 'custom-swal-close',
                icon: 'custom-swal-icon',
                content: 'custom-swal-content',
                confirmButton: 'custom-swal-confirm custom-ok-button'
            },
            buttonsStyling: false,
            showClass: {
                popup: 'animate__animated animate__zoomIn animate__faster'
            },
            hideClass: {
                popup: 'animate__animated animate__zoomOut animate__faster'
            }
        });

        return Toast.fire({
            icon: icon,
            title: title,
            text: text,
            background: '#1e1e2d',
            color: '#fff',
            position: 'top-end',
            timer: icon === 'error' ? 5000 : 3000,
            timerProgressBar: true,
            toast: true,
            showConfirmButton: icon === 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#ff5722'
        }).then(() => {
            if (showConfetti) {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }
        });
    }
});
