// Khai báo biến toàn cục cho userSession để các hàm khác có thể truy cập
let currentUserSession;

document.addEventListener('DOMContentLoaded', function() {
    console.log("Cart.js loaded");

    // Kiểm tra đăng nhập
    const userSession = JSON.parse(localStorage.getItem('bookHavenUserSession'));
    
    // Nếu trang giỏ hàng yêu cầu đăng nhập
    const requireLoginForCart = true; // Đặt thành false nếu bạn muốn cho phép xem giỏ hàng mà không cần đăng nhập
    
    if (requireLoginForCart && (!userSession || !userSession.isAuthenticated)) {
        // Hiển thị thông báo yêu cầu đăng nhập
        const cartContainer = document.querySelector('.container');
        if (cartContainer) {
            cartContainer.innerHTML = `
                <div class="alert alert-warning text-center my-5" role="alert">
                    <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
                    <h4>Vui lòng đăng nhập để xem giỏ hàng của bạn</h4>
                    <p>Bạn cần đăng nhập để sử dụng giỏ hàng và tiến hành thanh toán.</p>
                    <a href="login.html" class="btn btn-primary mt-3">Đăng nhập ngay</a>
                    <a href="register.html" class="btn btn-outline-secondary mt-3 ml-2">Đăng ký tài khoản mới</a>
                </div>
            `;
            return;
        }
    }
    
    // Tiếp tục hiển thị giỏ hàng nếu đã đăng nhập hoặc không yêu cầu đăng nhập
    const cartName = userSession && userSession.isAuthenticated 
        ? `bookHavenCart_${userSession.userId}` 
        : 'bookHavenCart';

    // Kiểm tra đăng nhập và lấy thông tin giỏ hàng
    console.log("Using cart:", cartName);
    updateCartUI();

    // Cập nhật UI giỏ hàng
    function updateCartUI() {
        const cart = JSON.parse(localStorage.getItem(cartName)) || [];
        console.log("Current cart items:", cart);
        
        // Cập nhật số lượng sản phẩm hiện tại trong giỏ hàng
        const cartCountElements = document.querySelectorAll('.cart-count');
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        cartCountElements.forEach(element => {
            element.textContent = totalItems;
        });
        
        // Cập nhật nút thanh toán
        const proceedToCheckoutButton = document.getElementById('proceed-to-checkout-button');
        if (proceedToCheckoutButton) {
            proceedToCheckoutButton.disabled = totalItems === 0;
        }
        
        // Hiển thị sản phẩm trong giỏ hàng
        const cartItemsContainer = document.getElementById('cart-items-container');
        if (!cartItemsContainer) return;
        
        cartItemsContainer.innerHTML = '';
        
        // Hiển thị thông báo giỏ hàng trống nếu không có sản phẩm
        const emptyCartMessage = document.getElementById('empty-cart-message');
        const cartBottomActions = document.getElementById('cart-bottom-actions');
        const cartTotalElement = document.getElementById('cart-total-amount');
        
        if (cart.length === 0) {
            if (emptyCartMessage) emptyCartMessage.classList.remove('d-none');
            if (cartBottomActions) cartBottomActions.classList.add('d-none');
            if (cartTotalElement) cartTotalElement.textContent = formatPrice(0);
            return;
        }
        
        // Ẩn thông báo giỏ hàng trống và hiển thị các sản phẩm
        if (emptyCartMessage) emptyCartMessage.classList.add('d-none');
        if (cartBottomActions) cartBottomActions.classList.remove('d-none');
        
        // Hiển thị các sản phẩm trong giỏ hàng
        let totalAmount = 0;
        
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            
            itemElement.innerHTML = `
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <h3>${item.name}</h3>
                    <p>Đơn giá: ${formatPrice(item.price)}</p>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-decrease" data-id="${item.id}">-</button>
                    <input type="number" value="${item.quantity}" min="1" data-id="${item.id}" class="quantity-input" readonly>
                    <button class="quantity-increase" data-id="${item.id}">+</button>
                </div>
                <div class="cart-item-price">${formatPrice(item.price * item.quantity)}</div>
                <div class="cart-item-remove">
                    <button data-id="${item.id}"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
            
            cartItemsContainer.appendChild(itemElement);
            totalAmount += item.price * item.quantity;
        });
        
        // Cập nhật tổng tiền
        if (cartTotalElement) {
            cartTotalElement.textContent = formatPrice(totalAmount);
        }
        
        // Thêm các sự kiện cho các nút trong giỏ hàng
        addCartItemEvents();
        
        // Cập nhật summary trong thanh toán nếu đang ở trang thanh toán
        updateCheckoutSummary(cart);
    }
    
    // Thêm sự kiện cho các nút trong giỏ hàng
    function addCartItemEvents() {
        // Nút tăng/giảm số lượng
        document.querySelectorAll('.quantity-decrease, .quantity-increase').forEach(button => {
            button.addEventListener('click', function() {
                const itemId = this.getAttribute('data-id');
                const isDecrease = this.classList.contains('quantity-decrease');
                updateItemQuantity(itemId, isDecrease);
            });
        });
        
        // Nút xóa sản phẩm
        document.querySelectorAll('.cart-item-remove button').forEach(button => {
            button.addEventListener('click', function() {
                const itemId = this.getAttribute('data-id');
                removeCartItem(itemId);
            });
        });
    }
    
    // Cập nhật số lượng sản phẩm
    function updateItemQuantity(itemId, isDecrease) {
        const cart = JSON.parse(localStorage.getItem(cartName)) || [];
        const itemIndex = cart.findIndex(item => item.id === itemId);
        
        if (itemIndex === -1) return;
        
        if (isDecrease) {
            if (cart[itemIndex].quantity > 1) {
                cart[itemIndex].quantity -= 1;
            } else {
                // Xóa sản phẩm nếu số lượng = 0
                cart.splice(itemIndex, 1);
            }
        } else {
            cart[itemIndex].quantity += 1;
        }
        
        localStorage.setItem(cartName, JSON.stringify(cart));
        updateCartUI();
    }
    
    // Xóa sản phẩm khỏi giỏ hàng
    function removeCartItem(itemId) {
        const cart = JSON.parse(localStorage.getItem(cartName)) || [];
        const newCart = cart.filter(item => item.id !== itemId);
        
        localStorage.setItem(cartName, JSON.stringify(newCart));
        updateCartUI();
    }
    
    // Định dạng giá tiền
    function formatPrice(price) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0
        }).format(price);
    }
    
    // Cập nhật thông tin đơn hàng trong trang thanh toán
    function updateCheckoutSummary(cartItems) {
        const checkoutOrderSummaryItemsEl = document.getElementById('checkout-order-summary-items');
        
        if (!checkoutOrderSummaryItemsEl) return;
        checkoutOrderSummaryItemsEl.innerHTML = '';
        
        // Nếu không có sản phẩm trong giỏ hàng
        if (cartItems.length === 0) {
            checkoutOrderSummaryItemsEl.innerHTML = '<p class="text-muted">Không có sản phẩm nào trong giỏ hàng.</p>';
            
            // Cập nhật tổng tiền
            const checkoutSubtotalEl = document.getElementById('checkout-subtotal');
            const checkoutShippingFeeEl = document.getElementById('checkout-shipping-fee');
            const checkoutTotalAmountEl = document.getElementById('checkout-total-amount');
            
            if (checkoutSubtotalEl) checkoutSubtotalEl.textContent = formatPrice(0);
            if (checkoutShippingFeeEl) checkoutShippingFeeEl.textContent = formatPrice(0);
            if (checkoutTotalAmountEl) checkoutTotalAmountEl.textContent = formatPrice(0);
            return;
        }
        
        // Tính tổng tiền
        let subtotal = 0;
        
        // Hiển thị từng sản phẩm
        cartItems.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            // Kiểm tra xem template có tồn tại không
            const template = document.getElementById('checkout-summary-item-template');
            
            // Nếu có template, sử dụng template
            if (template) {
                const clone = template.content.cloneNode(true);
                clone.querySelector('.checkout-item-name').textContent = `${item.name} x ${item.quantity}`;
                clone.querySelector('.checkout-item-total').textContent = formatPrice(itemTotal);
                checkoutOrderSummaryItemsEl.appendChild(clone);
            } else {
                // Nếu không có template, tạo HTML trực tiếp
                const itemElement = document.createElement('div');
                itemElement.className = 'd-flex justify-content-between mb-2';
                itemElement.innerHTML = `
                    <span class="checkout-item-name">${item.name} x ${item.quantity}</span>
                    <span class="checkout-item-total">${formatPrice(itemTotal)}</span>
                `;
                checkoutOrderSummaryItemsEl.appendChild(itemElement);
            }
        });
        
        // Phí vận chuyển cố định
        const shippingFee = 30000;
        const total = subtotal + shippingFee;
        
        // Cập nhật tổng tiền
        const checkoutSubtotalEl = document.getElementById('checkout-subtotal');
        const checkoutShippingFeeEl = document.getElementById('checkout-shipping-fee');
        const checkoutTotalAmountEl = document.getElementById('checkout-total-amount');
        
        if (checkoutSubtotalEl) checkoutSubtotalEl.textContent = formatPrice(subtotal);
        if (checkoutShippingFeeEl) checkoutShippingFeeEl.textContent = formatPrice(shippingFee);
        if (checkoutTotalAmountEl) checkoutTotalAmountEl.textContent = formatPrice(total);
    }

    // Xử lý nút "Thông tin & Thanh toán"
    const proceedToCheckoutButton = document.getElementById('proceed-to-checkout-button');
    if (proceedToCheckoutButton) {
        proceedToCheckoutButton.addEventListener('click', function() {
            // Kiểm tra đăng nhập
            if (!userSession || !userSession.isAuthenticated) {
                const confirmLogin = confirm('Bạn cần đăng nhập để hoàn tất đặt hàng. Chuyển đến trang đăng nhập?');
                if (confirmLogin) {
                    localStorage.setItem('bookHaven_redirect_after_login', 'cart.html');
                    window.location.href = 'login.html';
                }
                return;
            }
            
            // Kiểm tra giỏ hàng
            const cart = JSON.parse(localStorage.getItem(cartName)) || [];
            if (cart.length === 0) {
                alert('Giỏ hàng của bạn đang trống. Vui lòng thêm sản phẩm vào giỏ hàng.');
                return;
            }
            
            // Chuyển đến phần thanh toán
            const cartView = document.getElementById('cart-view');
            const checkoutInfoPaymentView = document.getElementById('checkout-info-payment-view');
            
            if (cartView) cartView.classList.add('d-none');
            if (checkoutInfoPaymentView) checkoutInfoPaymentView.classList.remove('d-none');
            
            // Cập nhật UI checkout
            updateCheckoutSummary(cart);
            
            // Cập nhật trạng thái của các bước
            const stepCart = document.getElementById('step-cart');
            const stepCheckout = document.getElementById('step-checkout');
            
            if (stepCart) {
                stepCart.classList.remove('active');
                stepCart.classList.add('completed');
            }
            
            if (stepCheckout) {
                stepCheckout.classList.add('active');
                stepCheckout.classList.remove('completed');
            }
            
            // Cập nhật tiêu đề trang
            const pageTitle = document.querySelector('h1.section-title');
            if (pageTitle) {
                pageTitle.textContent = 'Thông Tin và Thanh Toán';
            }
        });
    }
    
    // Xử lý form thanh toán
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate form
            if (!this.checkValidity()) {
                this.classList.add('was-validated');
                return;
            }
            
            // Kiểm tra phương thức thanh toán
            const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
            if (!paymentMethod) {
                document.getElementById('payment-method-feedback').style.display = 'block';
                return;
            }
            
            // Hiển thị overlay xử lý thanh toán
            const processingOverlay = document.createElement('div');
            processingOverlay.className = 'payment-processing-overlay';
            processingOverlay.innerHTML = `
                <div class="spinner-border text-light mb-3" role="status">
                    <span class="visually-hidden">Đang xử lý...</span>
                </div>
                <h4>Đang xử lý thanh toán...</h4>
            `;
            document.body.appendChild(processingOverlay);
            
            // Giả lập xử lý thanh toán
            setTimeout(() => {
                // Lấy thông tin đơn hàng
                const fullName = document.getElementById('fullName').value;
                const phoneNumber = document.getElementById('phoneNumber').value;
                const email = document.getElementById('email').value;
                
                // Tạo mã đơn hàng ngẫu nhiên
                const orderId = 'BH' + Math.floor(Math.random() * 900000 + 100000);
                
                document.body.removeChild(processingOverlay);
                
                // Hiển thị thông báo thành công
                const orderCompleteView = document.getElementById('order-complete-view');
                const checkoutInfoPaymentView = document.getElementById('checkout-info-payment-view');
                const orderIdElement = document.getElementById('order-id');
                const customerNameElement = document.getElementById('customer-name');
                
                if (orderIdElement) orderIdElement.textContent = orderId;
                if (customerNameElement) customerNameElement.textContent = fullName;
                
                if (checkoutInfoPaymentView) checkoutInfoPaymentView.classList.add('d-none');
                if (orderCompleteView) orderCompleteView.classList.remove('d-none');
                
                // Cập nhật trạng thái của các bước
                const stepCart = document.getElementById('step-cart');
                const stepCheckout = document.getElementById('step-checkout');
                const stepComplete = document.getElementById('step-complete');
                
                if (stepCart) stepCart.classList.add('completed');
                if (stepCheckout) stepCheckout.classList.add('completed');
                if (stepCheckout) stepCheckout.classList.remove('active');
                if (stepComplete) stepComplete.classList.add('active');
                
                // Cập nhật tiêu đề trang
                const pageTitle = document.querySelector('h1.section-title');
                if (pageTitle) {
                    pageTitle.textContent = 'Đặt Hàng Hoàn Tất';
                }
                
                // Lưu đơn hàng vào lịch sử
                saveOrderToHistory({
                    orderId: orderId,
                    customerName: fullName,
                    phoneNumber: phoneNumber,
                    email: email,
                    paymentMethod: paymentMethod.value,
                    paymentStatus: paymentMethod.value === 'cod' ? 'Chưa thanh toán' : 'Đã thanh toán'
                });
                
                // Xóa giỏ hàng
                localStorage.setItem(cartName, JSON.stringify([]));
                updateCartUI();
            }, 1500);
        });
    }
    
    // Lưu đơn hàng vào lịch sử
    function saveOrderToHistory(orderData) {
        if (!userSession || !userSession.isAuthenticated) return;
        
        const cart = JSON.parse(localStorage.getItem(cartName)) || [];
        const userId = userSession.userId;
        
        // Tính tổng tiền
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shippingFee = 30000;
        const total = subtotal + shippingFee;
        
        // Tạo đối tượng đơn hàng
        const order = {
            orderId: orderData.orderId,
            userId: userId,
            customerName: orderData.customerName,
            customerEmail: orderData.email,
            customerPhone: orderData.phoneNumber,
            items: cart.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                total: item.price * item.quantity
            })),
            subtotal: subtotal,
            shippingFee: shippingFee,
            total: total,
            paymentMethod: orderData.paymentMethod,
            paymentStatus: orderData.paymentStatus,
            orderStatus: 'Mới đặt hàng',
            orderDate: new Date().toISOString()
        };
        
        // Lưu vào lịch sử đơn hàng
        let orderHistory = JSON.parse(localStorage.getItem(`bookHavenOrderHistory_${userId}`)) || [];
        orderHistory.unshift(order);
        localStorage.setItem(`bookHavenOrderHistory_${userId}`, JSON.stringify(orderHistory));
    }
    
    // Nút quay lại giỏ hàng
    const backToCartButton = document.getElementById('back-to-cart-button');
    if (backToCartButton) {
        backToCartButton.addEventListener('click', function() {
            const cartView = document.getElementById('cart-view');
            const checkoutInfoPaymentView = document.getElementById('checkout-info-payment-view');
            
            if (checkoutInfoPaymentView) checkoutInfoPaymentView.classList.add('d-none');
            if (cartView) cartView.classList.remove('d-none');
            
            // Cập nhật trạng thái của các bước
            const stepCart = document.getElementById('step-cart');
            const stepCheckout = document.getElementById('step-checkout');
            
            if (stepCart) {
                stepCart.classList.add('active');
                stepCart.classList.remove('completed');
            }
            
            if (stepCheckout) {
                stepCheckout.classList.remove('active', 'completed');
            }
            
            // Cập nhật tiêu đề trang
            const pageTitle = document.querySelector('h1.section-title');
            if (pageTitle) {
                pageTitle.textContent = 'Giỏ Hàng Của Bạn';
            }
        });
    }
});