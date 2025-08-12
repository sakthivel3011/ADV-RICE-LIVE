 // Preloader
 const preloader = document.querySelector('.preloader');
    
 // Hide preloader when page is loaded
 window.addEventListener('load', function() {
     preloader.classList.add('fade-out');
     setTimeout(() => {
         preloader.style.display = 'none';
     }, 500);
 });   
   // Initialize AOS
   AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true
});
document.getElementById('feedbackForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData();

    // Append fields manually to control names and types
    formData.append('fullName', form.querySelector('input[type="text"]').value);
    formData.append('email', form.querySelector('input[type="email"]').value);
    formData.append('product', form.querySelector('select').value);
    
    const rating = form.querySelector('input[name="rating"]:checked');
    formData.append('rating', rating ? rating.value : '');

    formData.append('likedMost', form.querySelectorAll('textarea')[0].value);
    formData.append('improvement', form.querySelectorAll('textarea')[1].value);
    formData.append('subscribed', form.querySelector('#newsletter').checked);

    const photoInput = form.querySelector('input[type="file"]');
    if (photoInput.files.length > 0) {
        formData.append('photo', photoInput.files[0]);
    }

    try {
        const response = await fetch('http://localhost:3000/submit-feedback', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const thankYouMessage = document.getElementById('thankYouMessage');
            thankYouMessage.style.display = 'block';
            form.reset();
            thankYouMessage.scrollIntoView({ behavior: 'smooth' });
        } else {
            const err = await response.json();
            alert('Error: ' + (err.error || 'Could not submit feedback.'));
        }
    } catch (error) {
        alert('Network error: ' + error.message);
    }
});

// Hide thank you message
function hideThankYouMessage() {
    const thankYouMessage = document.getElementById('thankYouMessage');
    thankYouMessage.style.display = 'none'; // Hide the message
    window.location.href = 'index.html'; // Redirect to index.html
}

// Add parallax effect on scroll
window.addEventListener('scroll', function() {
    const scrollPosition = window.pageYOffset;
    const grains = document.querySelectorAll('.floating-grain');
    
    grains.forEach((grain, index) => {
        const speed = 0.1 * (index + 1);
        grain.style.transform = `translateY(${scrollPosition * speed}px) rotate(${15 * (index + 1)}deg)`;
    });
});

// Back to top button
const backToTopButton = document.getElementById('backToTop');

window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
        backToTopButton.style.display = 'block';
    } else {
        backToTopButton.style.display = 'none';
    }
});

backToTopButton.addEventListener('click', function(e) {
    e.preventDefault();
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Animated counter for statistics
function animateCounter(el, start, end, duration) {
    let startTime = null;
    
    function animation(currentTime) {
        if (!startTime) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        
        el.textContent = value;
        
        if (progress < 1) {
            requestAnimationFrame(animation);
        }
    }
    
    requestAnimationFrame(animation);
}

// Trigger counter animation when stats section is in view
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Happy Customers
            const happyCustomers = document.getElementById('happyCustomers');
            animateCounter(happyCustomers, 0, 10250, 2000);
            
            // Years Experience
            const yearsExperience = document.getElementById('yearsExperience');
            animateCounter(yearsExperience, 0, 15, 1500);
            
            // Rice Varieties
            const riceVarieties = document.getElementById('riceVarieties');
            animateCounter(riceVarieties, 0, 14, 1000);
            
            // Positive Reviews
            const positiveReviews = document.getElementById('positiveReviews');
            animateCounter(positiveReviews, 0, 90, 1800);
            
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

observer.observe(document.querySelector('.stats'));

// Add interactive elements
document.querySelectorAll('.form-control, .form-select').forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.classList.add('pulse');
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.classList.remove('pulse');
    });
});

// Product card hover effect enhancement
document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.querySelector('.product-btn').style.backgroundColor = 'var(--dark-color)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.querySelector('.product-btn').style.backgroundColor = 'var(--primary-color)';
    });
});

// Rating stars enhancement
document.querySelectorAll('.rating label').forEach(star => {
    star.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.3)';
    });
    
    star.addEventListener('mouseleave', function() {
        if (!this.previousElementSibling.checked) {
            this.style.transform = 'scale(1)';
        }
    });
});