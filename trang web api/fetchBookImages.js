// Función para obtener imágenes de libros desde Google Books API
async function fetchBookImageByTitle(title, author) {
    try {
        const query = encodeURIComponent(`${title} ${author}`);
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`);
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
            const imageLinks = data.items[0].volumeInfo.imageLinks;
            // Preferir la imagen en alta resolución, con fallback a la miniatura
            return imageLinks?.thumbnail?.replace('http:', 'https:') || 
                   imageLinks?.smallThumbnail?.replace('http:', 'https:') || 
                   null;
        }
        return null;
    } catch (error) {
        console.error(`Error fetchBookImageByTitle: ${error.message}`);
        return null;
    }
}

// Función para actualizar las imágenes de todos los productos
async function updateAllBookImages(productsArray) {
    const updatedProducts = [...productsArray];
    
    for (let product of updatedProducts) {
        const image = await fetchBookImageByTitle(product.name, product.author);
        if (image) {
            product.imageSrc = image;
        }
        // Esperar un poco entre solicitudes para evitar limitaciones de la API
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    return updatedProducts;
}

document.addEventListener('DOMContentLoaded', function() {
    console.log("fetchBookImages.js loaded");
    
    // Sử dụng danh sách sách từ localStorage (đã được lưu bởi script.js)
    const books = JSON.parse(localStorage.getItem('bookHavenBooks')) || [];
    
    // Kiểm tra nếu đang ở trang chủ
    if (document.getElementById('book-grid-container')) {
        displayBooks(books);
    }
    
    // Hàm hiển thị sách
    function displayBooks(books) {
        const bookGridContainer = document.getElementById('book-grid-container');
        if (!bookGridContainer) return;
        
        bookGridContainer.innerHTML = '';
        
        books.forEach(book => {
            const discountPercent = Math.round((book.originalPrice - book.price) / book.originalPrice * 100);
            const hasDiscount = book.originalPrice > book.price;
            
            const bookCard = document.createElement('div');
            bookCard.className = 'book-card';
            bookCard.setAttribute('data-book-id', book.id);
            
            bookCard.innerHTML = `
                <div class="book-image-container">
                    <img src="${book.imageSrc}" alt="${book.name}" loading="lazy">
                    ${book.badge ? `<span class="badge ${book.badge.toLowerCase() === 'mới' ? 'new-badge' : (book.badge.toLowerCase() === 'sale' ? 'sale-badge' : '')}">${book.badge}</span>` : 
                    hasDiscount ? `<span class="badge sale-badge">-${discountPercent}%</span>` : ''}
                    <div class="book-actions">
                        <button class="btn-icon add-to-cart-btn" data-id="${book.id}" data-name="${book.name}" data-price="${book.price}" data-image="${book.imageSrc}" aria-label="Thêm vào giỏ hàng">
                            <i class="fas fa-cart-plus"></i>
                        </button>
                        <button class="btn-icon quick-view-btn" aria-label="Xem nhanh"><i class="far fa-eye"></i></button>
                    </div>
                </div>
                <div class="book-info">
                    <h3 class="book-title"><a href="product-detail.html?id=${book.id}">${book.name}</a></h3>
                    <p class="book-author">${book.author}</p>
                    <div class="book-price">
                        ${hasDiscount ? 
                        `<span class="current-price">${formatPrice(book.price)}</span>
                         <span class="original-price">${formatPrice(book.originalPrice)}</span>` :
                        `<span class="current-price">${formatPrice(book.price)}</span>`}
                    </div>
                    <a href="product-detail.html?id=${book.id}" class="btn btn-primary">Xem Chi Tiết</a>
                </div>
            `;
            
            bookGridContainer.appendChild(bookCard);
        });
        
        // Cần sửa các nút thêm vào giỏ hàng trong books display
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const bookId = this.getAttribute('data-id');
                
                // Kiểm tra đăng nhập
                const userSession = JSON.parse(localStorage.getItem('bookHavenUserSession'));
                if (!userSession || !userSession.isAuthenticated) {
                    // Lưu ID sách để thêm vào giỏ hàng sau khi đăng nhập
                    localStorage.setItem('bookHaven_pendingCartItem', bookId);
                    
                    // Lưu URL hiện tại để chuyển hướng lại sau khi đăng nhập
                    localStorage.setItem('bookHaven_redirect_after_login', window.location.href);
                    
                    const confirmLogin = confirm('Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng. Chuyển đến trang đăng nhập?');
                    if (confirmLogin) {
                        window.location.href = 'login.html';
                    }
                    return;
                }
                
                // Người dùng đã đăng nhập, thêm vào giỏ hàng
                const cartName = `bookHavenCart_${userSession.userId}`;
                let cart = JSON.parse(localStorage.getItem(cartName)) || [];
                
                // Tìm sản phẩm trong danh sách sản phẩm
                const books = JSON.parse(localStorage.getItem('bookHavenBooks')) || [];
                const book = books.find(b => b.id === bookId);
                
                if (!book) return;
                
                // Thêm vào giỏ hàng
                const existingItem = cart.find(item => item.id === bookId);
                
                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    cart.push({
                        id: book.id,
                        name: book.name,
                        author: book.author,
                        price: book.price,
                        image: book.imageSrc,
                        quantity: 1
                    });
                }
                
                // Lưu giỏ hàng
                localStorage.setItem(cartName, JSON.stringify(cart));
                
                // Cập nhật số lượng giỏ hàng trên icon
                updateCartCount();
                
                // Hiệu ứng nút
                this.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-cart-plus"></i>';
                }, 1500);
                
                // Hiển thị thông báo
                alert(`Đã thêm "${book.name}" vào giỏ hàng!`);
            });
        });
        
        // Thêm sự kiện cho nút xem nhanh
        document.querySelectorAll('.quick-view-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                alert('Chức năng xem nhanh sẽ được phát triển sau!');
            });
        });
    }
    
    // Sử dụng lại hàm định dạng giá từ script.js nếu đã được định nghĩa
    function formatPrice(price) {
        if (window.formatPrice) {
            return window.formatPrice(price);
        }
        return new Intl.NumberFormat('vi-VN', { 
            style: 'currency', 
            currency: 'VND',
            minimumFractionDigits: 0 
        }).format(price);
    }
    
    // Hàm cập nhật số lượng sản phẩm hiện tại trong giỏ hàng
    function updateCartCount() {
        const userSession = JSON.parse(localStorage.getItem('bookHavenUserSession'));
        const cartName = userSession && userSession.isAuthenticated ? 
            `bookHavenCart_${userSession.userId}` : 'bookHavenCart';
        const cart = JSON.parse(localStorage.getItem(cartName)) || [];
        
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        const cartCountElements = document.querySelectorAll('.cart-count');
        cartCountElements.forEach(element => {
            element.textContent = totalItems;
        });
    }
});