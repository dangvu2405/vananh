// Khai báo biến toàn cục cho userSession để các hàm khác có thể truy cập
let currentUserSession;
let cartName;

document.addEventListener('DOMContentLoaded', function() {
    console.log("Cart.js loaded");

    // Kiểm tra đăng nhập
    const userSession = JSON.parse(localStorage.getItem('bookHavenUserSession'));
    currentUserSession = userSession; // Gán cho biến toàn cục
    
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
    cartName = userSession && userSession.isAuthenticated 
        ? `bookHavenCart_${userSession.userId}` 
        : 'bookHavenCart';

    // Kiểm tra đăng nhập và lấy thông tin giỏ hàng
    console.log("Using cart:", cartName);
    updateCartUI();

    // Khởi tạo các sự kiện cho trang giỏ hàng
    setupCartEvents();

    // Tự động điền thông tin người dùng nếu đã đăng nhập
    fillUserInfoIfLoggedIn();
});

// Thiết lập các sự kiện cho trang giỏ hàng
function setupCartEvents() {
    // Xử lý nút "Thông tin & Thanh toán"
    const proceedToCheckoutButton = document.getElementById('proceed-to-checkout-button');
    if (proceedToCheckoutButton) {
        proceedToCheckoutButton.addEventListener('click', function() {
            // Kiểm tra đăng nhập
            if (!currentUserSession || !currentUserSession.isAuthenticated) {
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
            
            // Chuyển đến phần thanh toán và cập nhật UI
            showView(document.getElementById('checkout-info-payment-view'));
            
            // Lưu thông tin giỏ hàng để hiển thị trong trang thanh toán
            window.cartItemsDataForSummary = cart;
            
            // Cập nhật UI checkout
            updateCheckoutSummary(cart);
        });
    }
    
    // Nút quay lại giỏ hàng
    const backToCartButton = document.getElementById('back-to-cart-button');
    if (backToCartButton) {
        backToCartButton.addEventListener('click', function() {
            showView(document.getElementById('cart-view'));
        });
    }
    
    // Xử lý form thanh toán
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log("Checkout form submitted");
            
            // Validate form
            if (!this.checkValidity()) {
                this.classList.add('was-validated');
                console.warn("Form validation failed");
                return;
            }
            
            // Kiểm tra phương thức thanh toán
            const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
            if (!paymentMethod) {
                document.getElementById('payment-method-feedback').style.display = 'block';
                console.warn("Payment method not selected");
                return;
            }
            
            // Hiển thị overlay xử lý thanh toán
            showPaymentProcessingOverlay();
            
            // Giả lập xử lý thanh toán (mô phỏng API call)
            setTimeout(() => {
                try {
                    // Tạo mã đơn hàng ngẫu nhiên
                    const orderId = 'BH' + Math.floor(Math.random() * 900000 + 100000);
                    
                    // Lưu đơn hàng với trạng thái dựa trên phương thức thanh toán
                    const paymentStatus = getPaymentStatus(paymentMethod.value);
                    const orderDetails = {
                        orderId: orderId,
                        paymentMethod: paymentMethod.value,
                        paymentStatus: paymentStatus
                    };
                    
                    // Lưu đơn hàng và xóa giỏ hàng
                    const savedOrder = saveOrderToHistory(orderDetails);
                    console.log("Order saved successfully:", savedOrder);
                    
                    // Ẩn overlay thanh toán
                    hidePaymentProcessingOverlay();
                    
                    // Hiển thị trang hoàn tất đơn hàng
                    showOrderCompleteView(savedOrder);
                    
                } catch (error) {
                    console.error("Error during checkout process:", error);
                    hidePaymentProcessingOverlay();
                    alert("Đã xảy ra lỗi trong quá trình thanh toán. Vui lòng thử lại.");
                }
            }, 1500);
        });
    }
    
    // Xử lý chọn phương thức thanh toán
    document.querySelectorAll('.payment-method-option').forEach(option => {
        option.addEventListener('click', function() {
            // Bỏ chọn tất cả các options khác
            document.querySelectorAll('.payment-method-option').forEach(opt => {
                opt.classList.remove('selected');
                const detailsEl = opt.querySelector('.bank-details, .card-details');
                if (detailsEl) detailsEl.classList.add('d-none');
            });
            
            // Chọn option hiện tại
            this.classList.add('selected');
            const radio = this.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
                
                // Hiển thị chi tiết phương thức thanh toán nếu có
                if (radio.value === 'bank') {
                    const bankDetails = this.querySelector('.bank-details');
                    if (bankDetails) bankDetails.classList.remove('d-none');
                } else if (radio.value === 'card') {
                    const cardDetails = this.querySelector('.card-details');
                    if (cardDetails) cardDetails.classList.remove('d-none');
                }
            }
            
            // Ẩn thông báo lỗi nếu đang hiển thị
            document.getElementById('payment-method-feedback').style.display = 'none';
        });
    });
    
    // Đảm bảo nút "Đặt hàng" hoạt động
    const placeOrderButton = document.getElementById('place-order-button');
    if (placeOrderButton) {
        placeOrderButton.addEventListener('click', function(e) {
            console.log("Place order button clicked");
            
            // Form sẽ tự xử lý validation và submit nhờ type="submit"
            // Không cần dùng JS để trigger submit event nếu button đã có type="submit"
        });
    }
    
    // Hiển thị giá trị ngẫu nhiên cho mã chuyển khoản
    const randomOrderCodeEl = document.getElementById('random-order-code');
    if (randomOrderCodeEl) {
        randomOrderCodeEl.textContent = Math.floor(Math.random() * 90000 + 10000).toString();
    }
}

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
    
    if (cart.length === 0) {
        if (emptyCartMessage) emptyCartMessage.classList.remove('d-none');
        
        // Cập nhật tổng tiền
        updateCartTotals(0, 0);
        return;
    }
    
    // Ẩn thông báo giỏ hàng trống và hiển thị các sản phẩm
    if (emptyCartMessage) emptyCartMessage.classList.add('d-none');
    
    // Hiển thị các sản phẩm trong giỏ hàng
    let subtotal = 0;
    
    cart.forEach(item => {
        const itemTemplate = document.getElementById('cart-item-template');
        let itemElement;
        
        if (itemTemplate) {
            // Sử dụng template nếu có
            itemElement = itemTemplate.content.cloneNode(true).querySelector('.cart-item');
            
            itemElement.querySelector('.cart-item-image img').src = item.image || 'images/placeholder.jpg';
            itemElement.querySelector('.cart-item-image img').alt = item.name;
            itemElement.querySelector('.cart-item-title').textContent = item.name;
            itemElement.querySelector('.cart-item-author').textContent = item.author || '';
            itemElement.querySelector('.cart-item-price').textContent = formatPrice(item.price);
            itemElement.querySelector('.cart-item-quantity input').value = item.quantity;
            itemElement.querySelector('.cart-item-subtotal').textContent = formatPrice(item.price * item.quantity);
            
            // Thêm data-id cho các nút
            itemElement.querySelector('.quantity-btn.decrement').setAttribute('data-id', item.id);
            itemElement.querySelector('.quantity-btn.increment').setAttribute('data-id', item.id);
            itemElement.querySelector('.cart-item-quantity input').setAttribute('data-id', item.id);
            itemElement.querySelector('.cart-item-remove').setAttribute('data-id', item.id);
        } else {
            // Fallback nếu không có template
            itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <div class="cart-item-image">
                    <img src="${item.image || 'images/placeholder.jpg'}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <h3 class="cart-item-title">${item.name}</h3>
                    <p class="cart-item-author">${item.author || ''}</p>
                    <div class="cart-item-price">${formatPrice(item.price)}</div>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn decrement" data-id="${item.id}">-</button>
                    <input type="number" value="${item.quantity}" min="1" data-id="${item.id}" class="form-control">
                    <button class="quantity-btn increment" data-id="${item.id}">+</button>
                </div>
                <div class="cart-item-subtotal">${formatPrice(item.price * item.quantity)}</div>
                <button class="cart-item-remove" data-id="${item.id}"><i class="fas fa-trash"></i></button>
            `;
        }
        
        cartItemsContainer.appendChild(itemElement);
        subtotal += item.price * item.quantity;
    });
    
    // Cập nhật tổng tiền
    const shippingFee = 30000; // Giả định phí ship cố định
    updateCartTotals(subtotal, shippingFee);
    
    // Thêm các sự kiện cho các nút trong giỏ hàng
    addCartItemEvents();
}

// Cập nhật tổng tiền giỏ hàng
function updateCartTotals(subtotal, shippingFee) {
    const cartSubtotalEl = document.getElementById('cart-subtotal');
    const shippingFeeEl = document.getElementById('shipping-fee');
    const cartTotalAmountEl = document.getElementById('cart-total-amount');
    
    if (cartSubtotalEl) cartSubtotalEl.textContent = formatPrice(subtotal);
    if (shippingFeeEl) shippingFeeEl.textContent = formatPrice(shippingFee);
    if (cartTotalAmountEl) cartTotalAmountEl.textContent = formatPrice(subtotal + shippingFee);
}

// Thêm sự kiện cho các nút trong giỏ hàng
function addCartItemEvents() {
    // Nút giảm số lượng
    document.querySelectorAll('.quantity-btn.decrement').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = this.getAttribute('data-id');
            updateItemQuantity(itemId, true);
        });
    });
    
    // Nút tăng số lượng
    document.querySelectorAll('.quantity-btn.increment').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = this.getAttribute('data-id');
            updateItemQuantity(itemId, false);
        });
    });
    
    // Nút xóa sản phẩm
    document.querySelectorAll('.cart-item-remove').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = this.getAttribute('data-id');
            removeCartItem(itemId);
        });
    });
    
    // Input số lượng (thay đổi trực tiếp)
    document.querySelectorAll('.cart-item-quantity input').forEach(input => {
        input.addEventListener('change', function() {
            const itemId = this.getAttribute('data-id');
            const newQuantity = parseInt(this.value);
            
            if (newQuantity > 0) {
                setItemQuantity(itemId, newQuantity);
            } else {
                this.value = 1; // Đặt lại giá trị tối thiểu
                setItemQuantity(itemId, 1);
            }
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
            if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?')) {
                cart.splice(itemIndex, 1);
            } else {
                return; // Không làm gì nếu người dùng không xác nhận
            }
        }
    } else {
        cart[itemIndex].quantity += 1;
    }
    
    localStorage.setItem(cartName, JSON.stringify(cart));
    updateCartUI();
}

// Đặt số lượng sản phẩm cụ thể
function setItemQuantity(itemId, quantity) {
    const cart = JSON.parse(localStorage.getItem(cartName)) || [];
    const itemIndex = cart.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) return;
    
    cart[itemIndex].quantity = quantity;
    
    localStorage.setItem(cartName, JSON.stringify(cart));
    updateCartUI();
}

// Xóa sản phẩm khỏi giỏ hàng
function removeCartItem(itemId) {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?')) {
        const cart = JSON.parse(localStorage.getItem(cartName)) || [];
        const newCart = cart.filter(item => item.id !== itemId);
        
        localStorage.setItem(cartName, JSON.stringify(newCart));
        updateCartUI();
    }
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
function updateCheckoutSummary(cart) {
    const checkoutOrderSummaryItemsEl = document.getElementById('checkout-order-summary-items');
    
    if (!checkoutOrderSummaryItemsEl) return;
    checkoutOrderSummaryItemsEl.innerHTML = '';
    
    // Nếu không có sản phẩm trong giỏ hàng
    if (!cart || cart.length === 0) {
        checkoutOrderSummaryItemsEl.innerHTML = '<p class="text-muted">Không có sản phẩm nào trong giỏ hàng.</p>';
        
        // Cập nhật tổng tiền
        updateCheckoutTotals(0, 0);
        return;
    }
    
    // Tính tổng tiền
    let subtotal = 0;
    
    // Hiển thị từng sản phẩm
    cart.forEach(item => {
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
    updateCheckoutTotals(subtotal, shippingFee);
}

// Cập nhật tổng tiền trong trang thanh toán
function updateCheckoutTotals(subtotal, shippingFee) {
    const checkoutSubtotalEl = document.getElementById('checkout-subtotal');
    const checkoutShippingFeeEl = document.getElementById('checkout-shipping-fee');
    const checkoutTotalAmountEl = document.getElementById('checkout-total-amount');
    
    if (checkoutSubtotalEl) checkoutSubtotalEl.textContent = formatPrice(subtotal);
    if (checkoutShippingFeeEl) checkoutShippingFeeEl.textContent = formatPrice(shippingFee);
    if (checkoutTotalAmountEl) checkoutTotalAmountEl.textContent = formatPrice(subtotal + shippingFee);
}

// Lưu đơn hàng vào lịch sử
function saveOrderToHistory(orderData) {
    if (!currentUserSession || !currentUserSession.isAuthenticated) {
        console.error("Cannot save order: User not authenticated");
        return null;
    }
    
    const cart = JSON.parse(localStorage.getItem(cartName)) || [];
    const userId = currentUserSession.userId;
    
    // Lấy thông tin từ form
    const fullName = document.getElementById('fullName')?.value || 'Khách hàng';
    const phoneNumber = document.getElementById('phoneNumber')?.value || '';
    const email = document.getElementById('email')?.value || currentUserSession.email || '';
    const address = document.getElementById('address')?.value || '';
    const city = document.getElementById('city')?.selectedOptions?.[0]?.text || '';
    const district = document.getElementById('district')?.selectedOptions?.[0]?.text || '';
    const ward = document.getElementById('ward')?.selectedOptions?.[0]?.text || '';
    const notes = document.getElementById('notes')?.value || '';
    
    // Tính tổng tiền
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingFee = 30000;
    const total = subtotal + shippingFee;
    
    // Tạo đối tượng đơn hàng
    const order = {
        orderId: orderData.orderId || 'BH' + Math.floor(Math.random() * 900000 + 100000),
        userId: userId,
        customerName: fullName,
        customerEmail: email,
        customerPhone: phoneNumber,
        shippingAddress: {
            address: address,
            ward: ward,
            district: district,
            city: city,
            notes: notes
        },
        items: cart.map(item => ({
            id: item.id,
            name: item.name,
            author: item.author || '',
            price: item.price,
            quantity: item.quantity,
            total: item.price * item.quantity,
            image: item.image || ''
        })),
        subtotal: subtotal,
        shippingFee: shippingFee,
        total: total,
        paymentMethod: orderData.paymentMethod || document.querySelector('input[name="paymentMethod"]:checked')?.value || 'cod',
        paymentStatus: orderData.paymentStatus || 'Chưa thanh toán',
        orderStatus: 'Mới đặt hàng',
        orderDate: new Date().toISOString()
    };
    
    // Lưu vào lịch sử đơn hàng
    let orderHistory = JSON.parse(localStorage.getItem(`bookHavenOrderHistory_${userId}`)) || [];
    orderHistory.unshift(order);
    localStorage.setItem(`bookHavenOrderHistory_${userId}`, JSON.stringify(orderHistory));
    
    // Xóa giỏ hàng
    localStorage.setItem(cartName, JSON.stringify([]));
    
    console.log("Order saved:", order);
    return order;
}

// Hiển thị trang hoàn tất đơn hàng
function showOrderCompleteView(order) {
    // Cập nhật các thông tin đơn hàng
    const orderIdDisplay = document.getElementById('order-id-display');
    if (orderIdDisplay) {
        orderIdDisplay.textContent = '#' + order.orderId;
    }
    
    // Hiển thị view hoàn tất
    showView(document.getElementById('order-complete-view'));
}

// Chuyển đổi giữa các view
function showView(viewToShow) {
    const cartView = document.getElementById('cart-view');
    const checkoutInfoPaymentView = document.getElementById('checkout-info-payment-view');
    const orderCompleteView = document.getElementById('order-complete-view');
    
    // Ẩn tất cả view
    if (cartView) cartView.classList.add('d-none');
    if (checkoutInfoPaymentView) checkoutInfoPaymentView.classList.add('d-none');
    if (orderCompleteView) orderCompleteView.classList.add('d-none');
    
    // Hiển thị view được chọn
    if (viewToShow) viewToShow.classList.remove('d-none');
    
    // Cập nhật trạng thái của các bước
    const stepCart = document.getElementById('step-cart');
    const stepCheckout = document.getElementById('step-checkout');
    const stepComplete = document.getElementById('step-complete');
    
    // Cập nhật tiêu đề trang
    const pageTitle = document.querySelector('h1.section-title');
    
    if (viewToShow === cartView) {
        if (stepCart) {
            stepCart.classList.add('active');
            stepCart.classList.remove('completed');
        }
        if (stepCheckout) stepCheckout.classList.remove('active', 'completed');
        if (stepComplete) stepComplete.classList.remove('active', 'completed');
        if (pageTitle) pageTitle.textContent = 'Giỏ Hàng Của Bạn';
    } else if (viewToShow === checkoutInfoPaymentView) {
        if (stepCart) {
            stepCart.classList.remove('active');
            stepCart.classList.add('completed');
        }
        if (stepCheckout) {
            stepCheckout.classList.add('active');
            stepCheckout.classList.remove('completed');
        }
        if (stepComplete) stepComplete.classList.remove('active', 'completed');
        if (pageTitle) pageTitle.textContent = 'Thông Tin và Thanh Toán Đơn Hàng';
    } else if (viewToShow === orderCompleteView) {
        if (stepCart) {
            stepCart.classList.remove('active');
            stepCart.classList.add('completed');
        }
        if (stepCheckout) {
            stepCheckout.classList.remove('active');
            stepCheckout.classList.add('completed');
        }
        if (stepComplete) stepComplete.classList.add('active');
        if (pageTitle) pageTitle.textContent = 'Đặt Hàng Hoàn Tất';
    }
}

// Hiển thị overlay xử lý thanh toán
function showPaymentProcessingOverlay() {
    const existingOverlay = document.querySelector('.payment-processing-overlay');
    if (existingOverlay) return;
    
    const processingOverlay = document.createElement('div');
    processingOverlay.className = 'payment-processing-overlay';
    processingOverlay.innerHTML = `
        <div class="spinner-border text-light mb-3" role="status">
            <span class="visually-hidden">Đang xử lý...</span>
        </div>
        <h4>Đang xử lý thanh toán...</h4>
    `;
    document.body.appendChild(processingOverlay);
}

// Ẩn overlay xử lý thanh toán
function hidePaymentProcessingOverlay() {
    const processingOverlay = document.querySelector('.payment-processing-overlay');
    if (processingOverlay) {
        document.body.removeChild(processingOverlay);
    }
}

// Lấy trạng thái thanh toán dựa trên phương thức
function getPaymentStatus(paymentMethod) {
    switch(paymentMethod) {
        case 'cod':
            return 'Thanh toán khi nhận hàng';
        case 'bank':
            return 'Chờ thanh toán';
        case 'card':
        case 'vnpay':
        case 'momo':
            return 'Đã thanh toán';
        default:
            return 'Chưa thanh toán';
    }
}

// Tự động điền thông tin người dùng đã đăng nhập vào form
function fillUserInfoIfLoggedIn() {
    if (currentUserSession && currentUserSession.isAuthenticated) {
        const users = JSON.parse(localStorage.getItem('bookHavenUsers')) || [];
        const user = users.find(u => u.id === currentUserSession.userId);
        
        if (user) {
            // Điền thông tin cơ bản
            const fullNameField = document.getElementById('fullName');
            const emailField = document.getElementById('email');
            const phoneField = document.getElementById('phoneNumber');
            
            if (fullNameField) fullNameField.value = user.name || user.username || '';
            if (emailField) emailField.value = user.email || '';
            if (phoneField && user.phone) phoneField.value = user.phone || '';
            
            // Điền thông tin địa chỉ nếu có
            if (user.address) {
                const addressField = document.getElementById('address');
                if (addressField) addressField.value = user.address.street || '';
                
                // Chọn tỉnh/thành phố nếu có thông tin
                if (user.address.city) {
                    const citySelect = document.getElementById('city');
                    for (let i = 0; i < citySelect.options.length; i++) {
                        if (citySelect.options[i].text === user.address.city) {
                            citySelect.selectedIndex = i;
                            // Kích hoạt sự kiện change để cập nhật các select box khác
                            citySelect.dispatchEvent(new Event('change'));
                            break;
                        }
                    }
                }
            }
        }
    }
}