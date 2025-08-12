// Preloader
const preloader = document.querySelector('.preloader');
    
// Hide preloader when page is loaded
window.addEventListener('load', function() {
    preloader.classList.add('fade-out');
    setTimeout(() => {
        preloader.style.display = 'none';
    }, 500);
});

$(document).ready(function() {
    // Retrieve cart items from localStorage or default to empty array
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const deliveryCharge = 50;
    
    // Initialize the page with cart items
    updateOrderSummary();
    updatePayNowAmount();
    
    // Payment method selection
    $('.payment-option').click(function() {
        $('.payment-option').removeClass('active');
        $(this).addClass('active');
        
        const method = $(this).data('method');
        $('.payment-details').hide();
        $(`#${method}Details`).fadeIn(300);
        
        // Add animation to the selected payment method
        $(this).addClass('pulse');
        setTimeout(() => {
            $(this).removeClass('pulse');
        }, 500);
    });
    
    // Form submission
    $('#paymentForm').submit(function(e) {
        e.preventDefault();
        
        // Validate form
        if (!validateForm()) {
            return;
        }
        
        // Show processing animation
        const btn = $(this).find('button[type="submit"]');
        btn.prop('disabled', true);
        btn.find('.btn-text').text('Processing...');
        
        // Prepare data for API
        const paymentData = {
            cart: cart,
            customer: {
                firstName: $('#firstName').val().trim(),
                lastName: $('#lastName').val().trim(),
                email: $('#email').val().trim(),
                phone: $('#phone').val().trim(),
                address: $('#address').val().trim(),
                city: $('#city').val().trim(),
                state: $('#state').val(),
                pincode: $('#pincode').val().trim(),
                landmark: $('#landmark').val().trim()
            },
            paymentMethod: $('.payment-option.active').data('method')
        };
        
        // Send payment data to server
        $.ajax({
            url: '/api/process-payment',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(paymentData),
            success: function(response) {
                if (response.success) {
                    // Clear cart
                    localStorage.removeItem('cart');
                    cart = [];
                    
                    // Show success modal
                    $('#orderNumber').text(response.orderNumber);
                    $('#successModal').modal('show');
                    
                    // Add confetti animation
                    confettiAnimation();
                } else {
                    showError('Payment processing failed. Please try again.');
                }
            },
            error: function(xhr, status, error) {
                showError('Error processing payment. Please try again later.');
                console.error('Payment error:', error);
            },
            complete: function() {
                btn.prop('disabled', false);
                btn.find('.btn-text').text('Pay Now');
            }
        });
    });
    
    // Update order summary with cart items
    function updateOrderSummary() {
        const orderItemsContainer = $('#orderItems');
        orderItemsContainer.empty();
        
        if (cart.length === 0) {
            orderItemsContainer.html('<p class="text-center py-4 text-muted">No items in cart</p>');
            $('#subtotal').text('₹0.00');
            $('#total').text(`₹${deliveryCharge.toFixed(2)}`);
            return;
        }
        
        let subtotal = 0;
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity * item.count;
            subtotal += itemTotal;
            
            const itemHtml = `
                <div class="order-item">
                    <div class="order-item-img">
                        <img src="${item.img}" alt="${item.name}">
                        ${item.badge ? `<div class="order-item-badge">${item.badge}</div>` : ''}
                    </div>
                    <div class="order-item-details">
                        <h5 class="order-item-title">${item.name}</h5>
                        <p class="order-item-price">₹${item.price.toFixed(2)} × ${item.quantity}kg × ${item.count}</p>
                        <p class="order-item-subtotal">₹${itemTotal.toFixed(2)}</p>
                    </div>
                </div>
            `;
            
            orderItemsContainer.append(itemHtml);
        });
        
        const total = subtotal + deliveryCharge;
        $('#subtotal').text(`₹${subtotal.toFixed(2)}`);
        $('#total').text(`₹${total.toFixed(2)}`);
    }
    
    // Update the Pay Now button amount
    function updatePayNowAmount() {
        let subtotal = 0;
        
        if (cart.length > 0) {
            subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity * item.count), 0);
        }
        
        const total = subtotal + deliveryCharge;
        $('#payNowAmount').text(`₹${total.toFixed(2)}`);
    }
    
    // Validate form fields
    function validateForm() {
        let isValid = true;
        
        // Required fields
        const requiredFields = [
            '#firstName', '#lastName', '#email', '#phone', 
            '#address', '#city', '#state', '#pincode'
        ];
        
        requiredFields.forEach(field => {
            const value = $(field).val().trim();
            if (!value) {
                $(field).addClass('is-invalid');
                isValid = false;
            } else {
                $(field).removeClass('is-invalid');
            }
        });
        
        // Validate email
        const email = $('#email').val().trim();
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            $('#email').addClass('is-invalid');
            isValid = false;
        }
        
        // Validate phone
        const phone = $('#phone').val().trim();
        if (phone && !/^[0-9]{10}$/.test(phone)) {
            $('#phone').addClass('is-invalid');
            isValid = false;
        }
        
        // Validate terms checkbox
        if (!$('#termsCheck').prop('checked')) {
            $('#termsCheck').addClass('is-invalid');
            isValid = false;
        } else {
            $('#termsCheck').removeClass('is-invalid');
        }
        
        // Payment method specific validation
        const activeMethod = $('.payment-option.active').data('method');
        
        if (activeMethod === 'credit') {
            const cardNumber = $('#cardNumber').val().trim();
            const expiryDate = $('#expiryDate').val().trim();
            const cvv = $('#cvv').val().trim();
            const cardName = $('#cardName').val().trim();
            
            if (!cardNumber || !/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) {
                $('#cardNumber').addClass('is-invalid');
                isValid = false;
            }
            
            if (!expiryDate || !/^\d{2}\/\d{2}$/.test(expiryDate)) {
                $('#expiryDate').addClass('is-invalid');
                isValid = false;
            }
            
            if (!cvv || !/^\d{3,4}$/.test(cvv)) {
                $('#cvv').addClass('is-invalid');
                isValid = false;
            }
            
            if (!cardName) {
                $('#cardName').addClass('is-invalid');
                isValid = false;
            }
        } else if (activeMethod === 'upi') {
            const upiId = $('#upiId').val().trim();
            if (!upiId || !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(upiId)) {
                $('#upiId').addClass('is-invalid');
                isValid = false;
            }
        } else if (activeMethod === 'netbanking') {
            const bank = $('#bank').val();
            if (!bank) {
                $('#bank').addClass('is-invalid');
                isValid = false;
            }
        }
        
        if (!isValid) {
            // Animate to first error
            $('html, body').animate({
                scrollTop: $('.is-invalid').first().offset().top - 100
            }, 500);
            
            // Shake animation for errors
            $('.is-invalid').each(function() {
                $(this).addClass('animate__animated animate__headShake');
                setTimeout(() => {
                    $(this).removeClass('animate__animated animate__headShake');
                }, 1000);
            });
            
            return false;
        }
        
        return true;
    }
    
    // Show error message
    function showError(message) {
        const errorAlert = `
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        $('#paymentForm').prepend(errorAlert);
    }
    
    // Confetti animation for success
    function confettiAnimation() {
        // Create confetti elements
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.backgroundColor = getRandomColor();
            confetti.style.animationDuration = Math.random() * 3 + 2 + 's';
            confetti.style.animationDelay = Math.random() * 2 + 's';
            document.body.appendChild(confetti);
            
            // Remove after animation
            setTimeout(() => {
                confetti.remove();
            }, 5000);
        }
        
        function getRandomColor() {
            const colors = [
                '#8B4513', '#D2B48C', '#FFC107', '#4CAF50', 
                '#F44336', '#2196F3', '#9C27B0', '#FF5722'
            ];
            return colors[Math.floor(Math.random() * colors.length)];
        }
    }
    
    // Close success modal and redirect
    $('#successModal').on('hidden.bs.modal', function() {
        window.location.href = "feedback.html"; // Redirect to homepage
    });
    // Add functionality for "Bill or Receipt" button
$('.btn-receipt').on('click', function() {
    window.location.href = "bill.html"; // Redirect to receipt page
});
    
    // Input validation on blur
    $('input, select').on('blur', function() {
        if ($(this).is(':required') && !$(this).val().trim()) {
            $(this).addClass('is-invalid');
        } else {
            $(this).removeClass('is-invalid');
        }
    });
    
    // UPI app selection
    $('.upi-app').click(function() {
        $('.upi-app').removeClass('active');
        $(this).addClass('active');
    });
    
    // Animate elements on scroll
    function animateOnScroll() {
        const elements = document.querySelectorAll('.animate__animated');
        
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const el = entry.target;
                        const animationClass = el.classList.contains('animate__fadeIn')
                            ? 'animate__fadeIn'
                            : el.classList.contains('animate__fadeInLeft')
                            ? 'animate__fadeInLeft'
                            : el.classList.contains('animate__fadeInRight')
                            ? 'animate__fadeInRight'
                            : el.classList.contains('animate__fadeInUp')
                            ? 'animate__fadeInUp'
                            : '';
                        
                        if (animationClass) {
                            el.classList.add(animationClass);
                        }
                        
                        observer.unobserve(el);
                    }
                });
            },
            {
                threshold: 0.1,
            }
        );
        
        elements.forEach((el) => {
            observer.observe(el);
        });
    }
    
    // Initialize scroll animations
    animateOnScroll();
    
    // Add GSAP animations
    gsap.from(".order-summary-card", {
        duration: 1,
        x: -50,
        opacity: 0,
        ease: "power2.out",
        delay: 0.3
    });
    
    gsap.from(".payment-form-card", {
        duration: 1,
        x: 50,
        opacity: 0,
        ease: "power2.out",
        delay: 0.5
    });
    
    gsap.from(".support-card", {
        duration: 1,
        y: 50,
        opacity: 0,
        ease: "power2.out",
        delay: 0.8
    });
});

// Confetti styles (added dynamically)
const confettiStyles = document.createElement('style');
confettiStyles.textContent = `
    .confetti {
        position: fixed;
        width: 10px;
        height: 10px;
        background-color: #f00;
        top: -10px;
        opacity: 0.8;
        border-radius: 50%;
        animation: confetti-fall linear forwards;
        z-index: 9999;
    }
    
    @keyframes confetti-fall {
        0% {
            transform: translateY(0) rotate(0deg);
        }
        100% {
            transform: translateY(100vh) rotate(360deg);
        }
    }
`;
document.head.appendChild(confettiStyles);

document.getElementById('paymentForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];

    const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        pincode: document.getElementById('pincode').value,
        landmark: document.getElementById('landmark').value || '',
        paymentMethod: document.querySelector('.payment-option.active').dataset.method,
        cardNumber: document.getElementById('cardNumber').value,
        expiryDate: document.getElementById('expiryDate').value,
        cvv: document.getElementById('cvv').value,
        cardName: document.getElementById('cardName').value,
        upiId: document.getElementById('upiId').value,
        bank: document.getElementById('bank').value,
        totalAmount: document.getElementById('total').textContent,
        orderedProducts: cartItems  // 🛒 Add cart data here
    };

    fetch('http://localhost:3000/submit-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('orderNumber').textContent = data.orderNumber;
            new bootstrap.Modal(document.getElementById('successModal')).show();

            // Optional: clear cart after order
            localStorage.removeItem('cart');
        } else {
            alert('Payment failed. Try again.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Something went wrong.');
    });
});



document.getElementById('paymentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const orderNumber = document.getElementById('orderNumber').value;
    const amount = document.getElementById('amount').value;
    
    try {
        const response = await fetch('http://localhost:3000/api/payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, orderNumber, amount }),
        });
        
        const data = await response.json();
        if (response.ok) {
            alert('Payment successful! Check your email for confirmation.');
            // Redirect or show success message
        } else {
            throw new Error(data.error || 'Payment failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Payment failed. Please try again.');
    }
});