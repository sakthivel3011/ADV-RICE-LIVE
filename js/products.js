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
  
    // Add to cart functionality
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            const productName = this.closest('.product-card').querySelector('.product-title').textContent;
            
            // Animation for add to cart
            this.innerHTML = '<i class="fas fa-check"></i> Order';
            this.classList.add('btn-success');
            this.classList.remove('btn-accent');
            window.location.href = 'orders.html';
           
            
            console.log(`Added ${productName} to cart`);
        });
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Scroll animations
    window.addEventListener('scroll', revealOnScroll);

    function revealOnScroll() {
        const elements = document.querySelectorAll('.animate__animated');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 100) {
                element.style.visibility = 'visible';
            }
        });
    }

    // Initial call to show elements in viewport on page load
    revealOnScroll();
});