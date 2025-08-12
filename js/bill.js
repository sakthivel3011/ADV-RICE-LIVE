     // Preloader
   const preloader = document.querySelector('.preloader');
    
   // Hide preloader when page is loaded
   window.addEventListener('load', function() {
       preloader.classList.add('fade-out');
       setTimeout(() => {
           preloader.style.display = 'none';
       }, 500);
   });

async function getBill() {
    const orderId = document.getElementById('orderInput').value.trim();
    if (!orderId) {
        showAlert('Please enter a valid order number.', 'warning');
        return;
    }

    // Show loading animation
    const billContainer = document.getElementById('billContainer');
    billContainer.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3">Fetching your bill...</p>
        </div>
    `;
    billContainer.classList.remove('d-none');

    try {
        const response = await fetch(`http://localhost:3000/api/bill/${orderId}`);
        const data = await response.json();

        if (!data.success) {
            showAlert('Bill not found or invalid Order ID.', 'danger');
            billContainer.classList.add('d-none');
            return;
        }

        const bill = data.bill;
        const billHTML = `
            <div class="invoice-header animate__animated animate__fadeIn">
                <h1 class="invoice-title">INVOICE</h1>
                <span class="invoice-number">${bill.orderNumber}</span>
            </div>
            
            <div class="customer-details animate__animated animate__fadeIn animate-delay-1">
                <div>
                    <p class="detail-item"><strong>Customer Name</strong> ${bill.customerName}</p>
                    <p class="detail-item"><strong>Email</strong> ${bill.email}</p>
                </div>
                <div>
                    <p class="detail-item"><strong>Phone</strong> ${bill.phone}</p>
                    <p class="detail-item"><strong>Payment</strong> <span class="status-badge status-paid">${bill.paymentDetails}</span></p>
                </div>
                <div>
                    <p class="detail-item"><strong>Address</strong> ${bill.address}</p>
                    <p class="detail-item"><strong>Landmark</strong> ${bill.landmark || 'N/A'}</p>
                </div>
            </div>
            
            <h5 class="mb-3 animate__animated animate__fadeIn animate-delay-1"><i class="fas fa-box-open me-2"></i>Order Items</h5>
            <table class="table table-hover animate__animated animate__fadeIn animate-delay-2">
                <thead>
                    <tr>
                        <th width="100px">Image</th>
                        <th>Product</th>
                        <th width="100px">Qty</th>
                        <th width="120px">Price</th>
                        <th width="120px">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${bill.items.map((item, index) => `
                        <tr class="animate__animated animate__fadeInUp" style="animation-delay: ${0.3 + (index * 0.1)}s">
                            <td><img src="${item.image}" class="product-img"/></td>
                            <td>${item.name}</td>
                            <td>${item.quantity}</td>
                            <td>₹${item.price.toLocaleString('en-IN')}</td>
                            <td>₹${item.total.toLocaleString('en-IN')}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="total-section animate__animated animate__fadeIn animate-delay-3">
                <p class="invoice-date">Order Date: ${new Date(bill.createdAt).toLocaleString()}</p>
                <h3 class="total-amount">Total: ${bill.totalAmount.toLocaleString('en-IN')}</h3>
            </div>
            
            <div class="thank-you animate__animated animate__fadeIn animate-delay-3">
                <i class="fas fa-heart"></i>
                <h4>Thank you for your order!</h4>
                <p class="mb-0">We appreciate your business and look forward to serving you again.</p>
            </div>
            
            <div class="mt-4 text-center animate__animated animate__fadeIn animate-delay-3">
                <button onclick="window.print()" class="btn btn-primary me-3">
                    <i class="fas fa-print me-2"></i> Print Invoice
                </button>
                <button onclick="downloadInvoice()" class="btn btn-info me-3">
                    <i class="fas fa-download me-2"></i> Download PDF
                </button>
                <button onclick="window.location.href='mailto:${bill.email}?subject=Invoice ${bill.orderNumber}'" class="btn btn-success">
                    <i class="fas fa-envelope me-2"></i> Email Invoice
                </button>
            </div>
        `;

        billContainer.innerHTML = billHTML;
        
        // Scroll to the bill after loading
        setTimeout(() => {
            billContainer.scrollIntoView({
                behavior: 'smooth'
            });
        }, 500);
    } catch (err) {
        console.error(err);
        showAlert('Error fetching bill. Please try again.', 'danger');
        billContainer.classList.add('d-none');
    }
}
function downloadInvoice() {
    const billContainer = document.getElementById('billContainer');
    const opt = {
        margin: [10, 10, 10, 10], // Top, Right, Bottom, Left margins
        filename: `invoice_${document.querySelector('.invoice-number').textContent}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true }, // Enable CORS for external assets
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Ensure the content is fully rendered before generating the PDF
    setTimeout(() => {
        html2pdf()
            .from(billContainer)
            .set(opt)
            .save()
            .catch(err => {
                console.error('Error generating PDF:', err);
                showAlert('Failed to generate PDF. Please try again.', 'danger');
            });
    }, 500); // Delay to ensure animations or dynamic content are fully rendered
}

function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} position-fixed top-20 start-50 translate-middle-x`;
    alert.style.zIndex = '9999';
    alert.style.minWidth = '300px';
    alert.textContent = message;
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.classList.add('animate__animated', 'animate__fadeOut');
        setTimeout(() => {
            alert.remove();
        }, 500);
    }, 3000);
}

// Allow pressing Enter key to search
document.getElementById('orderInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        getBill();
    }
});