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
    
    const trackingForm = document.getElementById('tracking-form');
    const orderIdInput = document.getElementById('order-id');
    const orderDetailsSection = document.getElementById('order-details');
    
    // Create a custom notification element
    const notification = document.createElement('div');
    notification.className = 'custom-notification';
    document.body.appendChild(notification);
    
    trackingForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const orderId = orderIdInput.value.trim();
        
        if (!orderId) {
            showErrorAnimation('Please enter an order ID');
            return;
        }

        const trackBtn = document.querySelector('.btn-track');
        const originalText = trackBtn.innerHTML;
        
        trackBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Tracking...';
        trackBtn.disabled = true;
        
        try {
            const response = await fetch(`http://localhost:3000/api/orders/${orderId}`);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Order not found');
            }
            
            const order = await response.json();
            updateOrderDetails(order);
            showSuccessAnimation();
            
        } catch (error) {
            showErrorAnimation(error.message);
        } finally {
            trackBtn.innerHTML = originalText;
            trackBtn.disabled = false;
        }
    });
    
    function updateOrderDetails(order) {
        // Show the order details section
        orderDetailsSection.style.display = 'block';
        
        // Format date
        const formatDate = (dateString) => {
            const options = { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            return new Date(dateString).toLocaleDateString('en-IN', options);
        };

        // Update order summary
        document.getElementById('summary-id').textContent = order.orderId;
        document.getElementById('summary-date').textContent = formatDate(order.createdAt);
        document.getElementById('summary-customer').textContent = order.customerName;
        document.getElementById('summary-email').textContent = order.customerEmail;
        document.getElementById('summary-phone').textContent = order.customerPhone;
        document.getElementById('summary-amount').textContent = `₹${order.totalAmount}`;
        document.getElementById('summary-payment').textContent = order.paymentMethod;
        document.getElementById('summary-payment-details').textContent = order.paymentDetails;
        document.getElementById('summary-address').textContent = order.shippingAddress.fullAddress;
        document.getElementById('summary-landmark').textContent = order.shippingAddress.landmark || 'Not specified';

        // Update order items
        const tbody = document.getElementById('order-items');
        tbody.innerHTML = '';
        
        order.items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    ${item.image ? `<img src="${item.image}" alt="${item.name}" class="product-image">` : ''}
                    ${item.name}
                </td>
                <td>${item.quantity}</td>
                <td>₹${item.price.toFixed(2)}</td>
                <td>₹${(item.price * item.quantity).toFixed(2)}</td>
            `;
            tbody.appendChild(row);
        });

        // Update totals
        document.getElementById('order-subtotal').textContent = `₹${order.totalAmount}`;
        document.getElementById('order-total').textContent = `₹${order.totalAmount}`;

        // Update status timeline
        updateStatusTimeline(order);

        // Update delivery information
        document.getElementById('courier-name').textContent = `Shipped via ${order.courierInfo.name}`;
        document.getElementById('courier-tracking').textContent = order.courierInfo.trackingNumber;
        document.getElementById('estimated-delivery').textContent = formatDate(order.courierInfo.estimatedDelivery);
        
        // Update delivery timeline
        const statusHistory = order.statusHistory || [];
        const shippedStatus = statusHistory.find(s => s.status === 'shipped');
        const processingStatus = statusHistory.find(s => s.status === 'processing');
        const placedStatus = statusHistory.find(s => s.status === 'placed');
        
        if (shippedStatus) {
            document.getElementById('timeline-transit').textContent = 
                `Chennai Hub - ${formatDate(shippedStatus.date)}`;
        }
        if (processingStatus) {
            document.getElementById('timeline-dispatched').textContent = 
                `From Warehouse - ${formatDate(processingStatus.date)}`;
        }
        if (placedStatus) {
            document.getElementById('timeline-processed').textContent = 
                formatDate(placedStatus.date);
        }
    }

    function updateStatusTimeline(order) {
        const statuses = ['placed', 'confirmed', 'processing', 'shipped', 'delivered'];
        const currentStatusIndex = statuses.indexOf(order.status);
        
        statuses.forEach((status, index) => {
            const stepElement = document.getElementById(`step-${status}`);
            const dateElement = document.getElementById(`date-${status}`);
            
            if (index < currentStatusIndex) {
                // Completed steps
                stepElement.classList.add('completed');
                stepElement.classList.remove('active', 'pending');
            } else if (index === currentStatusIndex) {
                // Current active step
                stepElement.classList.add('active');
                stepElement.classList.remove('completed', 'pending');
            } else {
                // Pending steps
                stepElement.classList.add('pending');
                stepElement.classList.remove('completed', 'active');
            }
            
            // Update dates
            const statusInfo = order.statusHistory?.find(s => s.status === status);
            if (statusInfo && dateElement) {
                dateElement.textContent = new Date(statusInfo.date).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                });
            }
        });
    }

    function showSuccessAnimation() {
        gsap.fromTo(".tracking-card", 
            { y: 20, opacity: 0.8 },
            { y: 0, opacity: 1, duration: 0.5 }
        );
        
        gsap.to(".tracking-card", {
            boxShadow: "0 0 20px rgba(255, 193, 7, 0.5)",
            duration: 0.5,
            yoyo: true,
            repeat: 1
        });
        
        gsap.from(".order-summary, .tracking-progress, .tracking-details, .delivery-info", {
            opacity: 0,
            y: 20,
            duration: 0.5,
            stagger: 0.2
        });
    }
    
    function showErrorAnimation(message) {
        // Update notification content and style
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-exclamation-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Show the notification with animation
        notification.style.display = 'block';
        notification.style.backgroundColor = '#ff4444'; // Red color for error
        
        gsap.fromTo(notification, 
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5 }
        );
        
        // Hide after 3 seconds
        setTimeout(() => {
            gsap.to(notification, {
                y: -50,
                opacity: 0,
                duration: 0.5,
                onComplete: () => {
                    notification.style.display = 'none';
                }
            });
        }, 3000);
        
        // Input shake animation
        gsap.to(orderIdInput, {
            x: [-5, 5, -5, 5, 0],
            duration: 0.5,
            ease: "power1.inOut"
        });
        orderIdInput.focus();
    }
    
    // Initial animations
    gsap.from(".tracking-header h1", {
        y: -30,
        opacity: 0,
        duration: 1,
        ease: "back.out(1.7)"
    });
    
    gsap.from(".tracking-header p", {
        y: -20,
        opacity: 0,
        duration: 0.8,
        delay: 0.3
    });
    
    gsap.from(".search-box", {
        scale: 0.9,
        opacity: 0,
        duration: 0.8,
        delay: 0.6
    });
});