// frontend/js/contact.js
document.querySelector('.contact-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    
    // Show loading state
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    const formData = {
        name: form.querySelector('input[type="text"]').value,
        email: form.querySelector('input[type="email"]').value,
        subject: form.querySelector('input[placeholder="Subject"]').value,
        message: form.querySelector('textarea').value
    };

    try {
        const response = await fetch('http://localhost:3000/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        
        if (response.ok) {
            // Create and show a nice notification
            showNotification('Message sent successfully!', 'success');
            form.reset();
        } else {
            throw new Error(data.error || 'Failed to send message');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error sending message: ' + error.message, 'error');
    } finally {
        // Reset button state
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
    }
});

function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span class="icon">${type === 'success' ? '✓' : '✗'}</span>
        <span class="message">${message}</span>
    `;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
    }, 5000);
}