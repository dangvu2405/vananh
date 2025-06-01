document.addEventListener('DOMContentLoaded', function() {
    // Lấy ID sản phẩm từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('id');
    
    // Lấy dữ liệu sách từ localStorage
    const books = JSON.parse(localStorage.getItem('bookHavenBooks')) || [];
    const book = books.find(b => b.id === bookId);
    
    const productDetailContainer = document.getElementById('product-detail-container');
    
    if (book) {
        // Cập nhật tiêu đề trang
        document.title = `${book.name} - BookHaven`;
        
        // Hiển thị thông tin sách
        const discountPercent = Math.round((book.originalPrice - book.price) / book.originalPrice * 100);
        const hasDiscount = book.originalPrice > book.price;
        
        productDetailContainer.innerHTML = `
            <div class="product-detail-image-gallery">
                <img src="${book.image}" alt="${book.name}" class="main-product-image">
                ${book.badge ? 
                  `<span class="badge ${book.badge.toLowerCase() === 'mới' ? 'new-badge' : 
                  (book.badge.toLowerCase() === 'sale' ? 'sale-badge' : '')}">${book.badge}</span>` : 
                  (hasDiscount ? `<span class="badge sale-badge">-${discountPercent}%</span>` : '')}
            </div>
            <div class="product-detail-info">
                <h1 class="product-title-detail">${book.name}</h1>
                <p class="product-author-detail">Tác giả: ${book.author}</p>
                <div class="product-price-detail">
                    ${hasDiscount ? 
                    `${formatPrice(book.price)} <span class="original-price-detail">${formatPrice(book.originalPrice)}</span>` :
                    `${formatPrice(book.price)}`}
                </div>
                <div class="product-description-detail">
                    <p>${book.description}</p>
                </div>
                <div class="product-specifications">
                    <h3>Thông tin chi tiết</h3>
                    <ul>
                        <li><strong>Tác giả:</strong> ${book.author}</li>
                        <li><strong>Nhà xuất bản:</strong> ${book.publisher}</li>
                        <li><strong>Năm xuất bản:</strong> ${book.year}</li>
                        <li><strong>Số trang:</strong> ${book.pages}</li>
                        <li><strong>Thể loại:</strong> ${book.category}</li>
                        <li><strong>ISBN:</strong> ${book.isbn}</li>
                    </ul>
                </div>
                <div class="product-detail-actions">
                    <button class="btn btn-primary add-to-cart-btn-detail" data-book-id="${book.id}">
                        <i class="fas fa-cart-plus"></i> Thêm vào giỏ hàng
                    </button>
                    <button class="btn btn-secondary wishlist-btn-detail" data-book-id="${book.id}">
                        <i class="far fa-heart"></i> Yêu thích
                    </button>
                </div>
            </div>
        `;
        
        // Thêm sự kiện thêm vào giỏ hàng
        document.querySelector('.add-to-cart-btn-detail').addEventListener('click', function() {
            addToCart(book.id);
        });
        
        // Thêm sự kiện nút yêu thích
        document.querySelector('.wishlist-btn-detail').addEventListener('click', function() {
            alert('Chức năng "yêu thích" sẽ được phát triển sau!');
        });
    } else {
        // Hiển thị thông báo nếu không tìm thấy sách
        productDetailContainer.innerHTML = `
            <div class="product-not-found">
                <h2>Không tìm thấy sách</h2>
                <p>Rất tiếc, sách bạn đang tìm kiếm không tồn tại.</p>
                <a href="index.html" class="btn btn-primary">Quay lại trang chủ</a>
            </div>
        `;
    }
    
    // Format giá tiền
    function formatPrice(price) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0
        }).format(price);
    }
    
    // Hàm thêm vào giỏ hàng
    function addToCart(bookId) {
        const books = JSON.parse(localStorage.getItem('bookHavenBooks'));
        const book = books.find(b => b.id === bookId);
        
        if (!book) return;
        
        // Kiểm tra người dùng đã đăng nhập hay chưa
        const userSession = JSON.parse(localStorage.getItem('bookHavenUserSession'));
        let cartName = 'bookHavenCart';
        
        // Nếu đã đăng nhập, sử dụng giỏ hàng theo userId
        if (userSession && userSession.isAuthenticated) {
            cartName = `bookHavenCart_${userSession.userId}`;
        }
        
        let cart = JSON.parse(localStorage.getItem(cartName)) || [];
        
        // Kiểm tra xem sách đã có trong giỏ hàng chưa
        const existingItem = cart.find(item => item.id === bookId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: book.id,
                name: book.name,
                author: book.author,
                price: book.price,
                image: book.image,
                quantity: 1
            });
        }
        
        localStorage.setItem(cartName, JSON.stringify(cart));
        
        // Cập nhật số lượng trên icon giỏ hàng
        updateCartCount();
        
        // Hiển thị thông báo
        const addToCartBtn = document.querySelector('.add-to-cart-btn-detail');
        addToCartBtn.innerHTML = '<i class="fas fa-check"></i> Đã thêm!';
        addToCartBtn.disabled = true;
        
        setTimeout(() => {
            addToCartBtn.innerHTML = '<i class="fas fa-cart-plus"></i> Thêm vào giỏ hàng';
            addToCartBtn.disabled = false;
        }, 2000);
    }
    
    // Cập nhật số lượng sản phẩm trong giỏ hàng
    function updateCartCount() {
        // Kiểm tra đăng nhập để lấy đúng giỏ hàng
        const userSession = JSON.parse(localStorage.getItem('bookHavenUserSession'));
        let cartName = 'bookHavenCart';
        
        if (userSession && userSession.isAuthenticated) {
            cartName = `bookHavenCart_${userSession.userId}`;
        }
        
        const cart = JSON.parse(localStorage.getItem(cartName)) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        const cartCountElements = document.querySelectorAll('.cart-count');
        cartCountElements.forEach(element => {
            element.textContent = totalItems;
        });
    }
    
    // Cập nhật số lượng giỏ hàng khi trang được load
    updateCartCount();
});