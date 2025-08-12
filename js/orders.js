   // Preloader
   const preloader = document.querySelector('.preloader');
    
   // Hide preloader when page is loaded
   window.addEventListener('load', function() {
       preloader.classList.add('fade-out');
       setTimeout(() => {
           preloader.style.display = 'none';
       }, 500);
   });

// Cart functionality
let cart = [];
let selectedQuantity = 5; // Default quantity

$(document).ready(function () {
  // Initialize product cards with animations on scroll
  animateOnScroll();

  // Quantity selector functionality
  $(".quantity-btn").click(function () {
    $(".quantity-btn").removeClass("active");
    $(this).addClass("active");
    selectedQuantity = parseInt($(this).data("kg"));

    // Add bounce animation when selecting a quantity
    $(this).addClass("bounce");
    setTimeout(() => {
      $(this).removeClass("bounce");
    }, 1000);
  });

  // Set first quantity option as default
  $(".quantity-selector").each(function () {
    $(this).find(".quantity-btn").first().addClass("active");
  });

  // Add to cart functionality
  $(".add-cart-btn").click(function () {
    const productCard = $(this).closest(".product-card");
    const productName = productCard.find(".product-title").text().trim();
    const productPrice = parseFloat(productCard.find(".product-price").text().replace('₹', '').replace(' per kg', '').trim());
    const productId = $(this).data("product");
    const productImg = productCard.find(".product-image img").attr("src");
    const productBadge = productCard.find(".product-badge").text().trim();

    // Check if product already exists in cart with same quantity
    const existingItemIndex = cart.findIndex(
      (item) => item.id === productId && item.quantity === selectedQuantity && item.badge === productBadge
    );

    if (existingItemIndex !== -1) {
      cart[existingItemIndex].count++;
    } else {
      // Add new item to cart
      cart.push({
        id: productId,
        name: productName,
        price: productPrice,
        quantity: selectedQuantity,
        img: productImg,
        badge: productBadge,
        count: 1,
      });
    }

    // Update cart count
    updateCartCount();

    // Show success notification
    showAddSuccess();

    // Add bounce animation to cart button
    $("#cartBtn").removeClass("pulse");
    $("#cartBtn").addClass("bounce");
    setTimeout(() => {
      $("#cartBtn").removeClass("bounce");
      if (cart.length > 0) {
        $("#cartBtn").addClass("pulse");
      }
    }, 1000);

    // Save cart to localStorage whenever it's updated
    localStorage.setItem('cart', JSON.stringify(cart));
  });

  // Open cart modal
  $("#cartBtn").click(function () {
    updateCartItems();
    $(".cart-modal").css("display", "flex");

    // Add animation to cart content
    $(".cart-content").css("animation", "slideIn 0.3s ease-out");
  });

  // Close cart modal
  $(".close-cart").click(function () {
    $(".cart-modal").css("display", "none");
  });

  // Close cart when clicking outside
  $(".cart-modal").click(function (e) {
    if ($(e.target).hasClass("cart-modal")) {
      $(".cart-modal").css("display", "none");
    }
  });

  // Load cart from localStorage when page loads
  const savedCart = localStorage.getItem('cart');
  if (savedCart) {
    cart = JSON.parse(savedCart);
    updateCartCount();
  }
});

// Update cart count badge
function updateCartCount() {
  const count = cart.reduce((total, item) => total + item.count, 0);
  $("#cartCount").text(count);

  // Show/hide pulse animation based on cart status
  if (count > 0) {
    $("#cartBtn").addClass("pulse");
  } else {
    $("#cartBtn").removeClass("pulse");
  }
}

// Show add to cart success notification
function showAddSuccess() {
  $(".add-success").css("display", "block");

  setTimeout(() => {
    $(".add-success").fadeOut();
  }, 2000);
}

// Update cart items in modal
function updateCartItems() {
  const cartItemsContainer = $("#cartItems");
  cartItemsContainer.empty();

  if (cart.length === 0) {
    cartItemsContainer.html(
      '<p class="text-center py-4 text-muted">Your cart is empty</p>'
    );
    $("#cartTotalAmount").text("₹0");
    return;
  }

  let totalAmount = 0;

  // Add each item to cart modal
  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity * item.count;
    totalAmount += itemTotal;

    const cartItemHtml = `
      <div class="cart-item" data-index="${index}">
        <div class="cart-item-img">
          <img src="${item.img}" alt="${item.name}" class="img-fluid w-100 h-100 object-fit-cover">
          ${item.badge ? `<div class="cart-item-badge">${item.badge}</div>` : ''}
        </div>
        <div class="cart-item-details">
          <h5 class="cart-item-title">${item.name}</h5>
          <p class="cart-item-price">₹${item.price} × ${item.quantity}kg × ${item.count}</p>
          <p class="cart-item-subtotal">Subtotal: ₹${(item.price * item.quantity * item.count).toFixed(2)}</p>
        </div>
        <div class="cart-item-controls">
          <button class="cart-qty-btn minus-btn" data-index="${index}">-</button>
          <span class="cart-item-qty">${item.count}</span>
          <button class="cart-qty-btn plus-btn" data-index="${index}">+</button>
          <div class="ms-3 cart-item-remove" data-index="${index}">
            <i class="fas fa-trash"></i>
          </div>
        </div>
      </div>
    `;

    cartItemsContainer.append(cartItemHtml);
  });

  // Update total amount
  $("#cartTotalAmount").text("₹" + totalAmount.toFixed(2));

  // Add event listeners for cart item controls
  $(".minus-btn").click(function () {
    const index = $(this).data("index");
    if (cart[index].count > 1) {
      cart[index].count--;
      updateCartCount();
      updateCartItems();
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  });

  $(".plus-btn").click(function () {
    const index = $(this).data("index");
    cart[index].count++;
    updateCartCount();
    updateCartItems();
    localStorage.setItem('cart', JSON.stringify(cart));
  });

  $(".cart-item-remove").click(function () {
    const index = $(this).data("index");
    cart.splice(index, 1);
    updateCartCount();
    updateCartItems();
    localStorage.setItem('cart', JSON.stringify(cart));
  });
}

// Animate elements when scrolling into view
function animateOnScroll() {
  const elements = document.querySelectorAll(".animate__animated");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const animationClass = el.classList.contains("animate__fadeIn")
            ? "animate__fadeIn"
            : el.classList.contains("animate__fadeInUp")
            ? "animate__fadeInUp"
            : el.classList.contains("animate__fadeInDown")
            ? "animate__fadeInDown"
            : "";

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
// ...existing code...
// ...existing code...

// Checkout button click
$(".checkout-btn").click(function () {
  if (cart.length === 0) {
    // Redirect to cart page or show a message in the UI if needed
    window.location.href = 'cart.html'; // Optional: Redirect to cart page
    return;
  }

  // Save cart to localStorage
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Redirect to payment page
  window.location.href = 'payment.html';
});

// Close the modal and redirect to login page
$(".login-modal-ok").click(function () {
  window.location.href = 'login.html';
});

// Close the modal without redirecting
$(".login-modal-close").click(function () {
  $(".login-modal").fadeOut();
});

