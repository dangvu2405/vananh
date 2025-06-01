document.addEventListener('DOMContentLoaded', function() {
    // --- PAGINATION CONFIG ---
    const paginationConfig = {
        itemsPerPage: 8,  // Hiển thị tất cả 8 sách trên một trang
        visiblePageNumbers: 5
    };
    
    // Biến toàn cục để theo dõi trang hiện tại
    let currentPage = 1;
    
    // Thay thế placeholder URLs bằng ảnh local
    function updateProductImages() {
        allProducts.forEach(product => {
            // Gán ảnh local cho mỗi sản phẩm theo ID
            product.imageUrl = getBookImageById(product.id);
        });
    }
    
    // Hàm hiển thị sách với phân trang
    function displayBooksWithPagination(books, page = 1) {
        const bookGridContainer = document.getElementById('book-grid-container');
        if (!bookGridContainer) return;
        
        // Tính toán chỉ số bắt đầu và kết thúc cho trang hiện tại
        const startIndex = (page - 1) * paginationConfig.itemsPerPage;
        const endIndex = Math.min(startIndex + paginationConfig.itemsPerPage, books.length);
        
        // Lấy chỉ sản phẩm của trang hiện tại
        const paginatedBooks = books.slice(startIndex, endIndex);
        
        bookGridContainer.innerHTML = '';
        
        // Nếu không có sản phẩm nào
        if (paginatedBooks.length === 0) {
            bookGridContainer.innerHTML = '<p class="no-products-message">Không tìm thấy sản phẩm nào.</p>';
            return;
        }
        
        // Tạo card cho mỗi sản phẩm
        paginatedBooks.forEach(book => {
            // Lấy ảnh từ imageUrl hoặc sử dụng hàm getBookImageById
            const bookImage = book.imageUrl || getBookImageById(book.id);
            
            const bookCard = document.createElement('div');
            bookCard.className = 'book-card';
            
            // Tạo badge nếu sản phẩm có
            let badgeHTML = '';
            if (book.badge) {
                const badgeClass = book.badge.toLowerCase() === 'mới' ? 'new-badge' : 
                                  book.badge.toLowerCase() === 'sale' ? 'sale-badge' : '';
                badgeHTML = `<span class="badge ${badgeClass}">${book.badge}</span>`;
            }
            
            // Tạo hiển thị giá gốc nếu có
            let priceHTML = '';
            if (book.originalPrice) {
                priceHTML = `
                    <span class="original-price">${formatPrice(book.originalPrice)} VND</span>
                    <span>${formatPrice(book.price)} VND</span>
                `;
            } else {
                priceHTML = `${formatPrice(book.price)} VND`;
            }
            
            bookCard.innerHTML = `
                <div class="book-image-container">
                    <img src="${bookImage}" alt="${book.name}" loading="lazy" onError="this.onerror=null; this.src='images/books/default-book.jpg';">
                    ${badgeHTML}
                    <div class="book-actions">
                        <button class="btn-icon add-to-cart" data-product-id="${book.id}" title="Thêm vào giỏ hàng">
                            <i class="fas fa-shopping-cart"></i>
                        </button>
                        <button class="btn-icon quick-view" data-product-id="${book.id}" title="Xem nhanh">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
                <div class="book-info">
                    <h3 class="book-title"><a href="product-detail.html?id=${book.id}">${book.name}</a></h3>
                    <p class="book-author">${book.author}</p>
                    <p class="book-price">${priceHTML}</p>
                    <a href="product-detail.html?id=${book.id}" class="btn btn-secondary">Xem Chi Tiết</a>
                </div>
            `;
            
            bookGridContainer.appendChild(bookCard);
        });
        
        // Hiển thị phân trang
        renderPagination(books.length, page);
        
        // Thêm event listeners cho các nút trong book card
        addBookCardEventListeners();
    }
    
    // Tạo phân trang
    function renderPagination(totalItems, currentPage) {
        const paginationContainer = document.getElementById('pagination-container');
        if (!paginationContainer) return;
        
        const totalPages = Math.ceil(totalItems / paginationConfig.itemsPerPage);
        
        // Không hiển thị phân trang nếu chỉ có 1 trang
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }
        
        let paginationHTML = '';
        
        // Nút Previous
        paginationHTML += `
            <button class="pagination-prev" ${currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>
        `;
        
        // Tính toán phạm vi các trang hiển thị
        let startPage = Math.max(1, currentPage - Math.floor(paginationConfig.visiblePageNumbers / 2));
        let endPage = Math.min(totalPages, startPage + paginationConfig.visiblePageNumbers - 1);
        
        // Điều chỉnh lại nếu không đủ số trang ở cuối
        if (endPage - startPage + 1 < paginationConfig.visiblePageNumbers) {
            startPage = Math.max(1, endPage - paginationConfig.visiblePageNumbers + 1);
        }
        
        // Thêm dấu ... và trang 1 nếu cần
        if (startPage > 1) {
            paginationHTML += `<button class="pagination-number" data-page="1">1</button>`;
            if (startPage > 2) {
                paginationHTML += `<span class="ellipsis">...</span>`;
            }
        }
        
        // Thêm các nút số trang
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="pagination-number ${i === currentPage ? 'active' : ''}" 
                        data-page="${i}" ${i === currentPage ? 'disabled' : ''}>
                    ${i}
                </button>
            `;
        }
        
        // Thêm dấu ... và trang cuối nếu cần
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHTML += `<span class="ellipsis">...</span>`;
            }
            paginationHTML += `<button class="pagination-number" data-page="${totalPages}">${totalPages}</button>`;
        }
        
        // Nút Next
        paginationHTML += `
            <button class="pagination-next" ${currentPage === totalPages ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
        
        paginationContainer.innerHTML = paginationHTML;
        
        // Thêm event listeners cho các nút phân trang
        addPaginationEventListeners();
    }
    
    // Thêm event listeners cho các nút phân trang
    function addPaginationEventListeners() {
        // Các nút số trang
        document.querySelectorAll('.pagination-number').forEach(button => {
            button.addEventListener('click', function() {
                const page = parseInt(this.getAttribute('data-page'));
                currentPage = page;
                displayBooksWithPagination(allProducts, page);
                
                // Scroll lên đầu phần hiển thị sách
                const featuredSection = document.getElementById('featured-books-section');
                if (featuredSection) {
                    featuredSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
        
        // Nút Previous
        const prevButton = document.querySelector('.pagination-prev');
        if (prevButton) {
            prevButton.addEventListener('click', function() {
                if (currentPage > 1) {
                    currentPage--;
                    displayBooksWithPagination(allProducts, currentPage);
                    
                    const featuredSection = document.getElementById('featured-books-section');
                    if (featuredSection) {
                        featuredSection.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        }
        
        // Nút Next
        const nextButton = document.querySelector('.pagination-next');
        if (nextButton) {
            nextButton.addEventListener('click', function() {
                const totalPages = Math.ceil(allProducts.length / paginationConfig.itemsPerPage);
                if (currentPage < totalPages) {
                    currentPage++;
                    displayBooksWithPagination(allProducts, currentPage);
                    
                    const featuredSection = document.getElementById('featured-books-section');
                    if (featuredSection) {
                        featuredSection.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        }
    }
    
    // Thêm event listeners cho các nút trong book card
    function addBookCardEventListeners() {
        // Nút "Thêm vào giỏ hàng" trên mỗi card sách
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', function(event) {
                event.preventDefault(); // Ngăn chặn hành vi mặc định
                
                const productId = this.getAttribute('data-product-id');
                addToCart(productId, 1);
                
                // Hiệu ứng thông báo đã thêm vào giỏ hàng (tùy chọn)
                showAddToCartNotification(productId);
            });
        });
        
        // Nút "Xem nhanh" (nếu có)
        document.querySelectorAll('.quick-view').forEach(button => {
            button.addEventListener('click', function(event) {
                event.preventDefault();
                
                const productId = this.getAttribute('data-product-id');
                showQuickViewModal(productId);
            });
        });
    }
    
    // Định dạng giá tiền
    function formatPrice(price) {
        return new Intl.NumberFormat('vi-VN').format(price);
    }
    
    // Hiệu ứng thông báo đã thêm vào giỏ hàng
    function showAddToCartNotification(productId) {
        // Tìm sản phẩm từ ID
        const product = allProducts.find(p => p.id === productId);
        if (!product) return;
        
        // Tạo và hiển thị thông báo
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = `
            <div class="cart-notification-content">
                <i class="fas fa-check-circle"></i>
                <p>Đã thêm "${product.name}" vào giỏ hàng!</p>
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
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    // Función para inicializar la página de inicio
    async function initializeHomePage() {
        // Kiểm tra nếu đã có dữ liệu sách từ fetchBookImages.js
        const existingBooks = JSON.parse(localStorage.getItem('bookHavenBooks'));
        if (existingBooks && existingBooks.length === 8) {
            console.log("Sử dụng dữ liệu sách đã có");
            displayBooksWithPagination(existingBooks, 1);
            return;
        }
        
        // Nếu không, tiếp tục với code gốc để lấy sách từ nguồn khác
        // Intentar cargar imágenes guardadas del almacenamiento local
        const cachedProducts = JSON.parse(localStorage.getItem('bookHavenProductsWithImages'));
        
        if (cachedProducts) {
            // Si hay productos en caché, usar estos
            allProducts = cachedProducts;
            displayBooksWithPagination(allProducts, 1);
        } else {
            // Si no hay caché, mostrar sản phẩm với hình ảnh mặc định
            displayBooksWithPagination(allProducts, 1);
            
            // Luego, intentar actualizar con imágenes reales en segundo plano
            try {
                const updatedProducts = await updateAllBookImages(allProducts);
                allProducts = updatedProducts;
                
                // Guardar en caché cho các lần truy cập sau
                localStorage.setItem('bookHavenProductsWithImages', JSON.stringify(updatedProducts));
                
                // Cập nhật hiển thị với hình ảnh mới
                displayBooksWithPagination(allProducts, currentPage);
            } catch (error) {
                console.error("Error al actualizar imágenes de libros:", error);
            }
        }
        
        // Cập nhật năm hiện tại ở footer
        const currentYearElement = document.getElementById('current-year');
        if (currentYearElement) {
            currentYearElement.textContent = new Date().getFullYear();
        }
    }
    
    // Khởi tạo khi tài liệu đã sẵn sàng
    initializeHomePage();
});
document.addEventListener('DOMContentLoaded', function() {

    // Mobile Navigation Toggle
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (mobileNavToggle && mainNav) {
        mobileNavToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            const isExpanded = mainNav.classList.contains('active');
            mobileNavToggle.setAttribute('aria-expanded', isExpanded);
            // Optional: Change icon
            const icon = mobileNavToggle.querySelector('i');
            if (isExpanded) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // "Add to Cart" Button Interaction
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    const cartCountElement = document.querySelector('.cart-count');
    let currentCartCount = 0;

    if (cartCountElement) {
        currentCartCount = parseInt(cartCountElement.textContent) || 0;
    }

    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const bookId = this.dataset.id;
            const bookName = this.dataset.name;
            const bookPrice = this.dataset.price;

            // In a real application, you would add this to a cart object/API
            // and then update the cart display.
            alert(`Đã thêm "${bookName}" vào giỏ hàng!`);

            // Basic cart count update (visual only for this demo)
            currentCartCount++;
            if (cartCountElement) {
                cartCountElement.textContent = currentCartCount;
            }

            // You might want to give visual feedback on the button too
            this.textContent = 'Đã thêm!';
            this.disabled = true;
            setTimeout(() => {
                this.textContent = 'Thêm vào giỏ';
                this.disabled = false;
            }, 2000); // Reset after 2 seconds
        });
    });

    // Newsletter Form Submission (Basic)
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent actual form submission
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            if (emailInput && emailInput.value) {
                alert(`Cảm ơn bạn đã đăng ký với email: ${emailInput.value}`);
                emailInput.value = ''; // Clear the input
            } else {
                alert('Vui lòng nhập địa chỉ email của bạn.');
            }
        });
    }

    // Update current year in footer
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Simple "Wishlist" and "Quick View" button alerts (for demo)
    document.querySelectorAll('.wishlist-btn, .quick-view-btn').forEach(btn => {
        btn.addEventListener('click', function(e){
            const action = this.classList.contains('wishlist-btn') ? 'yêu thích' : 'xem nhanh';
            // In a real app, this would trigger a modal or add to a list
            alert(`Chức năng "${action}" sẽ được phát triển sau!`);
            e.stopPropagation(); // Prevent event bubbling to book-card click if any
        });
    });

});

document.addEventListener('DOMContentLoaded', function() {
    // --- COMMON FUNCTIONS & VARIABLES ---
    const cartCountElement = document.querySelector('.cart-link .cart-count');
    
    function updateCartIcon() {
        if (cartCountElement) {
            const totalItems = getCurrentUserCart().reduce((sum, item) => sum + item.quantity, 0);
            cartCountElement.textContent = totalItems;
        }
    }

    function saveCart() {
        localStorage.setItem('bookHavenCart', JSON.stringify(cart));
        updateCartIcon();
    }

    function formatPrice(price) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    }

    // Initial cart icon update
    updateCartIcon();

    // --- HOMEPAGE SPECIFIC LOGIC ---
    if (!document.body.id || document.body.id !== 'cart-page-body') {
        const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
        addToCartButtons.forEach(button => {
            button.addEventListener('click', function() {
                const bookId = this.dataset.id;
                const bookName = this.dataset.name;
                const bookPrice = parseFloat(this.dataset.price);
                const bookImage = this.dataset.image;

                const existingItemIndex = cart.findIndex(item => item.id === bookId);

                if (existingItemIndex > -1) {
                    cart[existingItemIndex].quantity += 1;
                } else {
                    cart.push({
                        id: bookId,
                        name: bookName,
                        price: bookPrice,
                        image: bookImage,
                        quantity: 1
                    });
                }
                saveCart();

                // Visual feedback
                this.innerHTML = '<i class="fas fa-check"></i> Đã thêm!';
                this.disabled = true;
                setTimeout(() => {
                    this.innerHTML = 'Thêm vào giỏ';
                    this.disabled = false;
                }, 1500);
            });
        });
    }

    // --- CART PAGE SPECIFIC LOGIC ---
    if (document.body.id === 'cart-page-body') {
        const cartItemsContainer = document.getElementById('cart-items-container');
        const cartTotalAmountElement = document.getElementById('cart-total-amount');
        const emptyCartMessage = document.getElementById('empty-cart-message');
        const checkoutButton = document.querySelector('.btn-checkout');


        function renderCartItems() {
            if (!cartItemsContainer || !cartTotalAmountElement || !emptyCartMessage) return;

            cartItemsContainer.innerHTML = ''; // Clear existing items
            let totalAmount = 0;

            if (cart.length === 0) {
                emptyCartMessage.style.display = 'block';
                if(checkoutButton) checkoutButton.style.display = 'none';
                cartTotalAmountElement.textContent = formatPrice(0);
            } else {
                emptyCartMessage.style.display = 'none';
                if(checkoutButton) checkoutButton.style.display = 'inline-block';

                cart.forEach(item => {
                    const itemElement = document.createElement('div');
                    itemElement.classList.add('cart-item');
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
                            <button data-id="${item.id}"><i class="fas fa-trash-alt"></i> Xóa</button>
                        </div>
                    `;
                    cartItemsContainer.appendChild(itemElement);
                    totalAmount += item.price * item.quantity;
                });
                cartTotalAmountElement.textContent = formatPrice(totalAmount);
            }
        }

        function updateQuantity(bookId, newQuantity) {
            const itemIndex = cart.findIndex(item => item.id === bookId);
            if (itemIndex > -1) {
                if (newQuantity < 1) {
                    cart.splice(itemIndex, 1);
                } else {
                    cart[itemIndex].quantity = newQuantity;
                }
                saveCart();
                renderCartItems();
            }
        }

        // Event delegation for dynamic elements in cart
        cartItemsContainer.addEventListener('click', function(event) {
            const target = event.target;
            const bookId = target.closest('button') ? target.closest('button').dataset.id : null;
            if (!bookId) return;

            if (target.closest('.quantity-decrease')) {
                const item = cart.find(i => i.id === bookId);
                if (item) updateQuantity(bookId, item.quantity - 1);
            } else if (target.closest('.quantity-increase')) {
                 const item = cart.find(i => i.id === bookId);
                if (item) updateQuantity(bookId, item.quantity + 1);
            } else if (target.closest('.cart-item-remove button')) {
                updateQuantity(bookId, 0); 
            }
        });
        
        // Add event listener for direct input changes (though readonly is set, good for future)
        cartItemsContainer.addEventListener('change', function(event){
            const target = event.target;
            if(target.classList.contains('quantity-input')){
                const bookId = target.dataset.id;
                let newQuantity = parseInt(target.value);
                if (isNaN(newQuantity) || newQuantity < 1) {
                    newQuantity = 1; // Reset to 1 if invalid
                }
                updateQuantity(bookId, newQuantity);
            }
        });


        if (checkoutButton) {
            checkoutButton.addEventListener('click', function() {
                if (cart.length > 0) {
                    window.location.href = 'checkout.html';
                } else {
                    alert('Giỏ hàng của bạn trống!');
                }
            });
        }
        

        renderCartItems(); // Initial render for cart page
    }


    // --- COMMON UI ELEMENTS LIKE MOBILE NAV & FOOTER YEAR (Shared across pages) ---
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const mainNav = document.querySelector('.main-nav');
    if (mobileNavToggle && mainNav) {
        mobileNavToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            const isExpanded = mainNav.classList.contains('active');
            mobileNavToggle.setAttribute('aria-expanded', isExpanded);
            const icon = mobileNavToggle.querySelector('i');
            if (isExpanded) {
                icon.classList.remove('fa-bars'); icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times'); icon.classList.add('fa-bars');
            }
        });
    }

    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            if (emailInput && emailInput.value) {
                alert(`Cảm ơn bạn đã đăng ký với email: ${emailInput.value}`);
                emailInput.value = '';
            } else {
                alert('Vui lòng nhập địa chỉ email của bạn.');
            }
        });
    }

    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});

document.addEventListener('DOMContentLoaded', function() {

    // --- PRODUCT DATA (DATABASE) ---
    const allProducts = [
        { 
            id: "1", 
            name: "Đắc Nhân Tâm", 
            author: "Dale Carnegie", 
            price: 108000, 
            originalPrice: 120000, 
            imageSrc: "images/books/book1.jpeg", 
            description: "Đắc Nhân Tâm là một trong những cuốn sách nổi tiếng nhất về kỹ năng sống và giao tiếp hiệu quả.", 
            category: "Kỹ Năng Sống", 
            pages: 320, 
            publisher: "NXB Tổng Hợp TPHCM", 
            year: 2022, 
            isbn: "978-604-123-456-7" 
        },
        { 
            id: "2", 
            name: "Thinking Fast and Slow", 
            author: "Daniel Kahneman", 
            price: 250000, 
            originalPrice: 280000, 
            imageSrc: "images/books/book2.png", 
            description: "Sách nghiên cứu về cách bộ não của chúng ta hình thành suy nghĩ và đưa ra quyết định.", 
            category: "Tâm Lý Học", 
            pages: 499, 
            publisher: "NXB Thế Giới", 
            year: 2021, 
            isbn: "978-604-789-012-3" 
        },
        { 
            id: "3", 
            name: "Sapiens: Lược Sử Loài Người", 
            author: "Yuval Noah Harari", 
            price: 195000, 
            originalPrice: 210000, 
            imageSrc: "images/books/book3.png", 
            description: "Tác phẩm về lịch sử loài người từ thời kỳ đồ đá đến hiện đại.", 
            category: "Lịch Sử", 
            pages: 554, 
            publisher: "NXB Tri Thức", 
            year: 2023, 
            badge: "Best Seller", 
            isbn: "978-604-234-567-8" 
        },
        { 
            id: "4", 
            name: "Clean Code", 
            author: "Robert C. Martin", 
            price: 320000, 
            originalPrice: 350000, 
            imageSrc: "images/books/book4.webp", 
            description: "Sách hướng dẫn cách viết mã sạch và dễ bảo trì trong phát triển phần mềm.", 
            category: "Công Nghệ", 
            pages: 464, 
            publisher: "NXB Bách Khoa Hà Nội", 
            year: 2020, 
            isbn: "978-604-345-678-9" 
        },
        { 
            id: "5", 
            name: "Atomic Habits", 
            author: "James Clear", 
            price: 175000, 
            originalPrice: 190000, 
            imageSrc: "images/books/book5.png", 
            description: "Phương pháp xây dựng thói quen tốt và loại bỏ thói quen xấu một cách hiệu quả.", 
            category: "Kỹ Năng Sống", 
            pages: 320, 
            publisher: "NXB Lao Động", 
            year: 2022, 
            badge: "Mới", 
            isbn: "978-604-456-789-0" 
        },
        { 
            id: "6", 
            name: "Rich Dad Poor Dad", 
            author: "Robert T. Kiyosaki", 
            price: 145000, 
            originalPrice: 160000, 
            imageSrc: "images/books/book6.png", 
            description: "Sách về tư duy tài chính và cách làm giàu thông qua đầu tư.", 
            category: "Kinh Tế", 
            pages: 336, 
            publisher: "NXB Trẻ", 
            year: 2021, 
            badge: "Sale", 
            isbn: "978-604-567-890-1" 
        },
        { 
            id: "7", 
            name: "Người Giàu Có Nhất Thành Babylon", 
            author: "George S. Clason", 
            price: 95000, 
            originalPrice: 110000, 
            imageSrc: "images/books/book7.jpeg", 
            description: "Sách về các nguyên tắc quản lý tài chính cá nhân qua các câu chuyện từ thành Babylon cổ đại.", 
            category: "Kinh Tế", 
            pages: 208, 
            publisher: "NXB Tổng Hợp TPHCM", 
            year: 2020, 
            isbn: "978-604-678-901-2" 
        },
        { 
            id: "8", 
            name: "The Psychology of Money", 
            author: "Morgan Housel", 
            price: 185000, 
            originalPrice: 200000, 
            imageSrc: "images/books/book8.jpeg", 
            description: "Sách giải thích tâm lý và hành vi của con người trong việc quản lý tiền bạc.", 
            category: "Kinh Tế", 
            pages: 252, 
            publisher: "NXB Dân Trí", 
            year: 2023, 
            isbn: "978-604-789-012-3" 
        }
    ];


    // --- COMMON FUNCTIONS & VARIABLES ---
    const cartCountElement = document.querySelector('.cart-link .cart-count');
    
    function updateCartIcon() {
        if (cartCountElement) {
            const totalItems = getCurrentUserCart().reduce((sum, item) => sum + item.quantity, 0);
            cartCountElement.textContent = totalItems;
        }
    }

    function saveCart() {
        localStorage.setItem('bookHavenCart', JSON.stringify(cart));
        updateCartIcon();
    }

    function formatPrice(price) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    }

    function getCurrentUserCart() {
        const userSession = JSON.parse(localStorage.getItem('bookHavenUserSession'));
        if (userSession && userSession.isAuthenticated) {
            const cartName = `bookHavenCart_${userSession.userId}`;
            return JSON.parse(localStorage.getItem(cartName)) || [];
        }
        return [];
    }

    // Initial cart icon update
    updateCartIcon();

    // --- HOMEPAGE SPECIFIC LOGIC ---
    if (!document.body.id || document.body.id !== 'cart-page-body') {
        const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
        addToCartButtons.forEach(button => {
            button.addEventListener('click', function() {
                const bookId = this.dataset.id;
                const bookName = this.dataset.name;
                const bookPrice = parseFloat(this.dataset.price);
                const bookImage = this.dataset.image;

                const existingItemIndex = cart.findIndex(item => item.id === bookId);

                if (existingItemIndex > -1) {
                    cart[existingItemIndex].quantity += 1;
                } else {
                    cart.push({
                        id: bookId,
                        name: bookName,
                        price: bookPrice,
                        image: bookImage,
                        quantity: 1
                    });
                }
                saveCart();

                // Visual feedback
                this.innerHTML = '<i class="fas fa-check"></i> Đã thêm!';
                this.disabled = true;
                setTimeout(() => {
                    this.innerHTML = 'Thêm vào giỏ';
                    this.disabled = false;
                }, 1500);
            });
        });
    }

    // --- CART PAGE SPECIFIC LOGIC ---
    if (document.body.id === 'cart-page-body') {
        const cartItemsContainer = document.getElementById('cart-items-container');
        const cartTotalAmountElement = document.getElementById('cart-total-amount');
        const emptyCartMessage = document.getElementById('empty-cart-message');
        const checkoutButton = document.querySelector('.btn-checkout');


        function renderCartItems() {
            if (!cartItemsContainer || !cartTotalAmountElement || !emptyCartMessage) return;

            cartItemsContainer.innerHTML = ''; // Clear existing items
            let totalAmount = 0;

            if (cart.length === 0) {
                emptyCartMessage.style.display = 'block';
                if(checkoutButton) checkoutButton.style.display = 'none';
                cartTotalAmountElement.textContent = formatPrice(0);
            } else {
                emptyCartMessage.style.display = 'none';
                if(checkoutButton) checkoutButton.style.display = 'inline-block';

                cart.forEach(item => {
                    const itemElement = document.createElement('div');
                    itemElement.classList.add('cart-item');
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
                            <button data-id="${item.id}"><i class="fas fa-trash-alt"></i> Xóa</button>
                        </div>
                    `;
                    cartItemsContainer.appendChild(itemElement);
                    totalAmount += item.price * item.quantity;
                });
                cartTotalAmountElement.textContent = formatPrice(totalAmount);
            }
        }

        function updateQuantity(bookId, newQuantity) {
            const itemIndex = cart.findIndex(item => item.id === bookId);
            if (itemIndex > -1) {
                if (newQuantity < 1) {
                    cart.splice(itemIndex, 1);
                } else {
                    cart[itemIndex].quantity = newQuantity;
                }
                saveCart();
                renderCartItems();
            }
        }

        // Event delegation for dynamic elements in cart
        cartItemsContainer.addEventListener('click', function(event) {
            const target = event.target;
            const bookId = target.closest('button') ? target.closest('button').dataset.id : null;
            if (!bookId) return;

            if (target.closest('.quantity-decrease')) {
                const item = cart.find(i => i.id === bookId);
                if (item) updateQuantity(bookId, item.quantity - 1);
            } else if (target.closest('.quantity-increase')) {
                 const item = cart.find(i => i.id === bookId);
                if (item) updateQuantity(bookId, item.quantity + 1);
            } else if (target.closest('.cart-item-remove button')) {
                updateQuantity(bookId, 0); 
            }
        });
        
        // Add event listener for direct input changes (though readonly is set, good for future)
        cartItemsContainer.addEventListener('change', function(event){
            const target = event.target;
            if(target.classList.contains('quantity-input')){
                const bookId = target.dataset.id;
                let newQuantity = parseInt(target.value);
                if (isNaN(newQuantity) || newQuantity < 1) {
                    newQuantity = 1; // Reset to 1 if invalid
                }
                updateQuantity(bookId, newQuantity);
            }
        });


        if (checkoutButton) {
            checkoutButton.addEventListener('click', function() {
                if (cart.length > 0) {
                    window.location.href = 'checkout.html';
                } else {
                    alert('Giỏ hàng của bạn trống!');
                }
            });
        }
        

        renderCartItems(); // Initial render for cart page
    }


    // --- COMMON UI ELEMENTS LIKE MOBILE NAV & FOOTER YEAR (Shared across pages) ---
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const mainNav = document.querySelector('.main-nav');
    if (mobileNavToggle && mainNav) {
        mobileNavToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            const isExpanded = mainNav.classList.contains('active');
            mobileNavToggle.setAttribute('aria-expanded', isExpanded);
            const icon = mobileNavToggle.querySelector('i');
            if (isExpanded) {
                icon.classList.remove('fa-bars'); icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times'); icon.classList.add('fa-bars');
            }
        });
    }

    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            if (emailInput && emailInput.value) {
                alert(`Cảm ơn bạn đã đăng ký với email: ${emailInput.value}`);
                emailInput.value = '';
            } else {
                alert('Vui lòng nhập địa chỉ email của bạn.');
            }
        });
    }

    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});

function setupCartLinkHandler() {
    // Tìm tất cả các liên kết đến cart.html
    document.querySelectorAll('a[href="cart.html"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Kiểm tra đăng nhập
            const userSession = JSON.parse(localStorage.getItem('bookHavenUserSession'));
            if (!userSession || !userSession.isAuthenticated) {
                // Lưu URL để chuyển hướng sau khi đăng nhập
                localStorage.setItem('bookHaven_redirect_after_login', 'cart.html');
                
                // Hiển thị thông báo
                alert('Vui lòng đăng nhập để xem giỏ hàng');
                
                // Chuyển hướng đến trang đăng nhập
                window.location.href = 'login.html';
            } else {
                // Nếu đã đăng nhập thì cho phép vào giỏ hàng
                window.location.href = 'cart.html';
            }
        });
    });
}

// Gọi hàm này trong DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    // ... code hiện tại
    setupCartLinkHandler();
});

// Biến toàn cục cho sản phẩm và giỏ hàng
let allProducts = [
    { 
        id: "1", 
        name: "Đắc Nhân Tâm", 
        author: "Dale Carnegie", 
        price: 108000, 
        originalPrice: 120000, 
        imageSrc: "images/books/book1.jpeg", 
        description: "Đắc Nhân Tâm là một trong những cuốn sách nổi tiếng nhất về kỹ năng sống và giao tiếp hiệu quả.", 
        category: "Kỹ Năng Sống", 
        pages: 320, 
        publisher: "NXB Tổng Hợp TPHCM", 
        year: 2022, 
        isbn: "978-604-123-456-7" 
    },
    { 
        id: "2", 
        name: "Thinking Fast and Slow", 
        author: "Daniel Kahneman", 
        price: 250000, 
        originalPrice: 280000, 
        imageSrc: "images/books/book2.png", 
        description: "Sách nghiên cứu về cách bộ não của chúng ta hình thành suy nghĩ và đưa ra quyết định.", 
        category: "Tâm Lý Học", 
        pages: 499, 
        publisher: "NXB Thế Giới", 
        year: 2021, 
        isbn: "978-604-789-012-3" 
    },
    { 
        id: "3", 
        name: "Sapiens: Lược Sử Loài Người", 
        author: "Yuval Noah Harari", 
        price: 195000, 
        originalPrice: 210000, 
        imageSrc: "images/books/book3.png", 
        description: "Tác phẩm về lịch sử loài người từ thời kỳ đồ đá đến hiện đại.", 
        category: "Lịch Sử", 
        pages: 554, 
        publisher: "NXB Tri Thức", 
        year: 2023, 
        badge: "Best Seller", 
        isbn: "978-604-234-567-8" 
    },
    { 
        id: "4", 
        name: "Clean Code", 
        author: "Robert C. Martin", 
        price: 320000, 
        originalPrice: 350000, 
        imageSrc: "images/books/book4.webp", 
        description: "Sách hướng dẫn cách viết mã sạch và dễ bảo trì trong phát triển phần mềm.", 
        category: "Công Nghệ", 
        pages: 464, 
        publisher: "NXB Bách Khoa Hà Nội", 
        year: 2020, 
        isbn: "978-604-345-678-9" 
    },
    { 
        id: "5", 
        name: "Atomic Habits", 
        author: "James Clear", 
        price: 175000, 
        originalPrice: 190000, 
        imageSrc: "images/books/book5.png", 
        description: "Phương pháp xây dựng thói quen tốt và loại bỏ thói quen xấu một cách hiệu quả.", 
        category: "Kỹ Năng Sống", 
        pages: 320, 
        publisher: "NXB Lao Động", 
        year: 2022, 
        badge: "Mới", 
        isbn: "978-604-456-789-0" 
    },
    { 
        id: "6", 
        name: "Rich Dad Poor Dad", 
        author: "Robert T. Kiyosaki", 
        price: 145000, 
        originalPrice: 160000, 
        imageSrc: "images/books/book6.png", 
        description: "Sách về tư duy tài chính và cách làm giàu thông qua đầu tư.", 
        category: "Kinh Tế", 
        pages: 336, 
        publisher: "NXB Trẻ", 
        year: 2021, 
        badge: "Sale", 
        isbn: "978-604-567-890-1" 
    },
    { 
        id: "7", 
        name: "Người Giàu Có Nhất Thành Babylon", 
        author: "George S. Clason", 
        price: 95000, 
        originalPrice: 110000, 
        imageSrc: "images/books/book7.jpeg", 
        description: "Sách về các nguyên tắc quản lý tài chính cá nhân qua các câu chuyện từ thành Babylon cổ đại.", 
        category: "Kinh Tế", 
        pages: 208, 
        publisher: "NXB Tổng Hợp TPHCM", 
        year: 2020, 
        isbn: "978-604-678-901-2" 
    },
    { 
        id: "8", 
        name: "The Psychology of Money", 
        author: "Morgan Housel", 
        price: 185000, 
        originalPrice: 200000, 
        imageSrc: "images/books/book8.jpeg", 
        description: "Sách giải thích tâm lý và hành vi của con người trong việc quản lý tiền bạc.", 
        category: "Kinh Tế", 
        pages: 252, 
        publisher: "NXB Dân Trí", 
        year: 2023, 
        isbn: "978-604-789-012-3" 
    }
];

// Hàm tiện ích cho giỏ hàng - sử dụng xuyên suốt website
function getUserCartName() {
    const userSession = JSON.parse(localStorage.getItem('bookHavenUserSession'));
    return userSession && userSession.isAuthenticated 
        ? `bookHavenCart_${userSession.userId}` 
        : 'bookHavenCart';
}

function getCurrentCart() {
    const cartName = getUserCartName();
    return JSON.parse(localStorage.getItem(cartName)) || [];
}

function saveCart(cart) {
    const cartName = getUserCartName();
    localStorage.setItem(cartName, JSON.stringify(cart));
    updateCartIcon();
}

function addToCart(bookId, quantity = 1) {
    const cart = getCurrentCart();
    const book = allProducts.find(p => p.id === bookId);
    
    if (!book) return false;
    
    const existingItem = cart.find(item => item.id === bookId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: book.id,
            name: book.name,
            author: book.author,
            price: book.price,
            image: book.imageSrc, // Thống nhất sử dụng property này
            quantity: quantity
        });
    }
    
    saveCart(cart);
    return true;
}

function updateCartIcon() {
    const cart = getCurrentCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(element => {
        if (element) {
            element.textContent = totalItems;
            
            // Thêm class visual nếu có sản phẩm
            if (element.classList) {
                element.classList.toggle('has-items', totalItems > 0);
            }
        }
    });
}

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND',
        minimumFractionDigits: 0 
    }).format(price);
}

// Lưu danh sách sản phẩm vào localStorage ngay khi script được tải
localStorage.setItem('bookHavenBooks', JSON.stringify(allProducts));

// Các đoạn mã event listener hiện có...
document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo trang
    initializeHomePage();
    
    // Cập nhật biểu tượng giỏ hàng
    updateCartIcon();
    
    // Thiết lập các event handler
    setupCartLinkHandler();
});

// THÊM CHỨC NĂNG YÊU CẦU ĐĂNG NHẬP KHI THÊM VÀO GIỎ HÀNG

// Hàm thêm vào giỏ hàng được nâng cấp để yêu cầu đăng nhập
function addToCart(bookId, quantity = 1) {
    // Kiểm tra đăng nhập trước khi thêm vào giỏ hàng
    return requireLogin(function() {
        const book = allProducts.find(p => p.id === bookId);
        if (!book) return false;
        
        const cartName = getUserCartName();
        let cart = JSON.parse(localStorage.getItem(cartName)) || [];
        
        const existingItem = cart.find(item => item.id === bookId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                id: book.id,
                name: book.name,
                author: book.author,
                price: book.price,
                image: book.imageSrc,
                quantity: quantity
            });
        }
        
        localStorage.setItem(cartName, JSON.stringify(cart));
        updateCartIcon();
        return true;
    }, bookId);
}

// Cập nhật tất cả các nút thêm vào giỏ hàng
document.addEventListener('DOMContentLoaded', function() {
    // Cập nhật số lượng giỏ hàng khi trang tải
    updateCartIcon();
    
    // Cập nhật các nút "Thêm vào giỏ hàng"
    document.querySelectorAll('[data-book-id]').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const bookId = this.getAttribute('data-book-id');
            const result = addToCart(bookId, 1);
            
            if (result) {
                // Hiệu ứng nút khi thêm thành công
                this.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-cart-plus"></i>';
                }, 1500);
                
                // Hiển thị thông báo thêm thành công
                const book = allProducts.find(p => p.id === bookId);
                if (book) {
                    alert(`Đã thêm "${book.name}" vào giỏ hàng!`);
                }
            }
        });
    });
});

// Hàm cập nhật icon giỏ hàng
function updateCartIcon() {
    const cartName = getUserCartName();
    const cart = JSON.parse(localStorage.getItem(cartName)) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(element => {
        if (element) {
            element.textContent = totalItems;
        }
    });
}