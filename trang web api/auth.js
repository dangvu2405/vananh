document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra trạng thái đăng nhập và cập nhật UI
    updateAuthUI();
    
    // Hàm cập nhật giao diện dựa trên trạng thái đăng nhập
    function updateAuthUI() {
        const session = JSON.parse(localStorage.getItem('bookHavenUserSession'));
        const headerActionsContainer = document.getElementById('header-actions-container');
        
        if (!headerActionsContainer) return;
        
        if (session && session.isAuthenticated) {
            // Người dùng đã đăng nhập - Hiển thị menu dropdown với tên người dùng
            headerActionsContainer.innerHTML = `
                <button class="search-btn" aria-label="Tìm kiếm"><i class="fas fa-search"></i></button>
                
                <div class="user-dropdown">
                    <a href="#" class="user-account logged-in">
                        <i class="fas fa-user-circle"></i> ${session.name || 'Tài khoản'}
                        <i class="fas fa-chevron-down dropdown-icon"></i>
                    </a>
                    <div class="dropdown-menu">
                        <a href="account.html" class="dropdown-item">
                            <i class="fas fa-user"></i> Tài khoản của tôi
                        </a>
                        <a href="orders.html" class="dropdown-item">
                            <i class="fas fa-box"></i> Đơn hàng của tôi
                        </a>
                        <hr class="dropdown-divider">
                        <a href="#" id="logout-btn" class="dropdown-item">
                            <i class="fas fa-sign-out-alt"></i> Đăng xuất
                        </a>
                    </div>
                </div>
                
                <a href="cart.html" class="cart-link" aria-label="Giỏ hàng">
                    <i class="fas fa-shopping-cart"></i>
                    <span class="cart-count">0</span>
                </a>
            `;
            
            // Cập nhật số lượng giỏ hàng
            updateCartCount();
            
            // Xử lý dropdown menu
            setupUserDropdown();
            
            // Xử lý nút đăng xuất
            document.getElementById('logout-btn').addEventListener('click', function(e) {
                e.preventDefault();
                logout();
            });
            
        } else {
            // Người dùng chưa đăng nhập - Hiển thị nút đăng nhập
            headerActionsContainer.innerHTML = `
                <button class="search-btn" aria-label="Tìm kiếm"><i class="fas fa-search"></i></button>
                
                <a href="login.html" class="user-account" aria-label="Đăng nhập">
                    <i class="fas fa-user"></i> Đăng Nhập
                </a>
                
                <a href="cart.html" class="cart-link" aria-label="Giỏ hàng">
                    <i class="fas fa-shopping-cart"></i>
                    <span class="cart-count">0</span>
                </a>
            `;
            
            // Cập nhật số lượng giỏ hàng
            updateCartCount();
        }
    }
    
    // Xử lý dropdown menu
    function setupUserDropdown() {
        const userAccount = document.querySelector('.user-account.logged-in');
        if (userAccount) {
            userAccount.addEventListener('click', function(e) {
                e.preventDefault();
                const dropdownMenu = this.nextElementSibling;
                dropdownMenu.classList.toggle('show');
                
                // Đóng dropdown khi click ra ngoài
                document.addEventListener('click', function closeDropdown(event) {
                    if (!event.target.closest('.user-dropdown')) {
                        document.querySelectorAll('.dropdown-menu').forEach(menu => {
                            menu.classList.remove('show');
                        });
                        document.removeEventListener('click', closeDropdown);
                    }
                });
            });
        }
    }
    
    // Xử lý đăng xuất
    function logout() {
        // Xóa session
        localStorage.removeItem('bookHavenUserSession');
        
        // Cập nhật UI
        updateAuthUI();
        
        // Hiển thị thông báo đăng xuất thành công
        showNotification('Đăng xuất thành công!');
        
        // Nếu đang ở trang cần đăng nhập, chuyển về trang chủ
        const restrictedPages = ['account.html', 'orders.html'];
        const currentPage = window.location.pathname.split('/').pop();
        if (restrictedPages.includes(currentPage)) {
            window.location.href = 'index.html';
        }
    }
    
    // Hàm cập nhật giỏ hàng trên icon
    function updateCartCount() {
        const cartCountElements = document.querySelectorAll('.cart-count');
        
        // Lấy giỏ hàng dựa vào trạng thái đăng nhập
        const userSession = JSON.parse(localStorage.getItem('bookHavenUserSession'));
        const cartName = userSession && userSession.isAuthenticated ? 
            `bookHavenCart_${userSession.userId}` : 'bookHavenCart';
            
        const cart = JSON.parse(localStorage.getItem(cartName)) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        cartCountElements.forEach(element => {
            element.textContent = totalItems;
        });
    }
    
    // Hiển thị thông báo
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-check-circle"></i>
                <p>${message}</p>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Hiển thị thông báo
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Ẩn và xóa thông báo sau 3 giây
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
});

// Chức năng xác thực để sử dụng từ các file khác
function isLoggedIn() {
    const userSession = JSON.parse(localStorage.getItem('bookHavenUserSession'));
    return userSession && userSession.isAuthenticated;
}

function getUserCartName() {
    const userSession = JSON.parse(localStorage.getItem('bookHavenUserSession'));
    return userSession && userSession.isAuthenticated ?
        `bookHavenCart_${userSession.userId}` : 'bookHavenCart';
}

function requireLogin(callback, bookId) {
    if (isLoggedIn()) {
        // Người dùng đã đăng nhập, thực hiện callback
        return callback();
    } else {
        // Lưu ID sách để thêm vào giỏ hàng sau khi đăng nhập
        if (bookId) {
            localStorage.setItem('bookHaven_pendingCartItem', bookId);
        }
        
        // Lưu URL hiện tại để chuyển hướng lại sau khi đăng nhập
        localStorage.setItem('bookHaven_redirect_after_login', window.location.href);
        
        // Hiển thị thông báo và chuyển hướng đến trang đăng nhập
        const confirmLogin = confirm('Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng. Chuyển đến trang đăng nhập?');
        if (confirmLogin) {
            window.location.href = 'login.html';
        }
        return false;
    }
}