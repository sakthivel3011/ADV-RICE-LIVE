  // Login function
    function login(event) {
      event.preventDefault();
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      // Show loading animation
      const loginBtn = event.target.querySelector('button[type="submit"]');
      loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Authenticating...';
      loginBtn.disabled = true;

      // Simulate API call with timeout
      setTimeout(() => {
        if (username === "admin" && password === "admin123") {
          // Success animation
          document.getElementById("loginScreen").style.opacity = 1;
          const loginBox = document.querySelector('.login-box');
          loginBox.style.animation = 'fadeOut 0.5s ease forwards';
          
          setTimeout(() => {
            document.getElementById("loginScreen").style.display = "none";
            document.getElementById("dashboard").style.display = "block";
            document.body.style.background = "#f8f9fa";
            
            // Animate dashboard elements
            const cards = document.querySelectorAll('.card-box');
            cards.forEach((card, index) => {
              card.style.animation = `fadeInUp 0.6s ease ${index * 0.1}s forwards`;
            });
          }, 500);
        } else {
          // Error state
          loginBtn.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i> Login';
          loginBtn.disabled = false;
          document.getElementById("username").classList.add('is-invalid');
          document.getElementById("password").classList.add('is-invalid');
          
          // Shake animation
          const loginBox = document.querySelector('.login-box');
          loginBox.style.animation = 'shake 0.5s ease';
          setTimeout(() => {
            loginBox.style.animation = '';
          }, 500);
          
          alert("Invalid credentials. Please try again.");
        }
      }, 1500);
    }

    // Logout function
    function logout() {
      // Animate dashboard out
      document.getElementById("dashboard").style.opacity = 1;
      document.getElementById("dashboard").style.animation = 'fadeOut 0.5s ease forwards';
      
      setTimeout(() => {
        document.getElementById("dashboard").style.display = "none";
        document.getElementById("loginScreen").style.display = "flex";
        document.body.style.background = 'linear-gradient(135deg, var(--primary), var(--secondary))';
        
        // Reset form
        document.getElementById("username").value = '';
        document.getElementById("password").value = '';
        document.getElementById("username").classList.remove('is-invalid');
        document.getElementById("password").classList.remove('is-invalid');
        
        // Animate login back in
        setTimeout(() => {
          document.getElementById("loginScreen").style.opacity = 1;
          document.querySelector('.login-box').style.animation = 'fadeIn 0.5s ease';
        }, 50);
      }, 500);
    }

    // Navigation function
    function navigateTo(page) {
      // Add active class to clicked menu item
      const menuItems = document.querySelectorAll('.sidebar-menu a');
      menuItems.forEach(item => item.classList.remove('active'));
      event.currentTarget.classList.add('active');
      
      // Show loading state
      const card = event.currentTarget.closest('.card-box') || event.currentTarget;
      card.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      
      // In a real app, this would load the requested page
      setTimeout(() => {
        alert(`Navigating to: ${page.charAt(0).toUpperCase() + page.slice(1)} section`);
        // Reset card content if it was a card click
        if (card.classList.contains('card-box')) {
          const iconMap = {
            'orders': 'fa-box',
            'products': 'fa-tags',
            'payments': 'fa-credit-card',
            'signup': 'fa-user-plus',
            'tracking': 'fa-truck',
            'newsletter': 'fa-envelope',
            'feedback': 'fa-comment',
            'billing': 'fa-file-invoice-dollar',
            'dashboard': 'fa-tachometer-alt'
          };
          card.innerHTML = `
            <i class="fas ${iconMap[page]}"></i>
            <h5>${page.charAt(0).toUpperCase() + page.slice(1)}</h5>
            <p>${card.querySelector('p') ? card.querySelector('p').textContent : 'Manage section'}</p>
            ${page === 'orders' ? '<div class="badge bg-primary mt-2">24 New</div>' : ''}
          `;
        }
      }, 800);
    }

    // Toggle sidebar on mobile
    function toggleSidebar() {
      document.querySelector('.sidebar').classList.toggle('active');
    }

    // Add animation keyframes dynamically
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(20px); }
      }
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20%, 60% { transform: translateX(-10px); }
        40%, 80% { transform: translateX(10px); }
      }
    `;
    document.head.appendChild(style);