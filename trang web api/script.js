document.addEventListener('DOMContentLoaded', function() {
    // --- PAGINATION CONFIG ---
    const paginationConfig = {
        itemsPerPage: 8,      // Số sản phẩm mỗi trang
        visiblePageNumbers: 5 // Số nút phân trang hiển thị
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
        // Intentar cargar imágenes guardadas del almacenamiento local
        const cachedProducts = JSON.parse(localStorage.getItem('bookHavenProductsWithImages'));
        
        if (cachedProducts) {
            // Si hay productos en caché, usar estos
            allProducts = cachedProducts;
            displayBooksWithPagination(allProducts, 1);
        } else {
            // Si no hay caché, mostrar productos với hình ảnh mặc định
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
    let cart = JSON.parse(localStorage.getItem('bookHavenCart')) || [];

    function updateCartIcon() {
        if (cartCountElement) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
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
                if (newQuantity < 1) { // If quantity is less than 1, remove item
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
                updateQuantity(bookId, 0); // Setting quantity to 0 will remove it
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
                    alert('Chức năng thanh toán sẽ được phát triển ở giai đoạn sau!');
                    // Here you would normally redirect to a checkout page or process payment
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

    document.querySelectorAll('.wishlist-btn, .quick-view-btn').forEach(btn => {
        btn.addEventListener('click', function(e){
            const action = this.classList.contains('wishlist-btn') ? 'yêu thích' : 'xem nhanh';
            alert(`Chức năng "${action}" sẽ được phát triển sau!`);
            e.stopPropagation();
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {

    // --- PRODUCT DATA (DATABASE) ---
    const allProducts = [
        { id: "1", name: "Lập Trình Python Từ Zero đến Hero", author: "Tác giả Nguyễn Văn A", price: 185000, imageSrc: "https://via.placeholder.com/300x450/E8DDCB/7D5A36?text=Lập+Trình+Python", description: "Cuốn sách toàn diện cho người mới bắt đầu học Python, từ cơ bản đến các khái niệm nâng cao và ứng dụng thực tế. Bao gồm bài tập và dự án mẫu.", category: "Công Nghệ", pages: 450, publisher: "NXB Khoa Học Kỹ Thuật", year: 2023, isbn: "978-604-123-456-7" },
        { id: "2", name: "Nghệ Thuật Tư Duy Phản Biện", author: "Tác giả Trần Thị B", price: 220000, originalPrice: 250000, imageSrc: "https://via.placeholder.com/300x450/D6E4E5/41644A?text=Tư+Duy+Phản+Biện", description: "Rèn luyện kỹ năng tư duy logic, phân tích và đánh giá thông tin một cách hiệu quả để đưa ra quyết định sáng suốt trong công việc và cuộc sống.", category: "Kỹ Năng Sống", pages: 320, publisher: "NXB Trẻ", year: 2022, isbn: "978-604-321-789-0" },
        { id: "3", name: "Marketing Hiện Đại Cho Người Mới Bắt Đầu", author: "Tác giả Lê Văn C", price: 150000, imageSrc: "https://via.placeholder.com/300x450/FFF8E1/BCAAA4?text=Marketing+Hiện+Đại", description: "Giới thiệu các khái niệm cốt lõi của marketing trong thời đại số, từ SEO, content marketing đến social media và quảng cáo trực tuyến.", category: "Kinh Tế", pages: 280, publisher: "NXB Kinh Tế TP.HCM", year: 2023, badge: "Sale", isbn: "978-604-456-012-3" },
        { id: "4", name: "Thiết Kế Web Chuyên Nghiệp Với HTML, CSS & JS", author: "Tác giả Phạm Thị D", price: 280000, imageSrc: "https://via.placeholder.com/300x450/CFD8DC/37474F?text=Thiết+Kế+Web", description: "Hướng dẫn chi tiết cách xây dựng website hiện đại, responsive sử dụng các công nghệ frontend phổ biến nhất hiện nay. Kèm theo ví dụ thực hành.", category: "Công Nghệ", pages: 550, publisher: "NXB Thông Tin & Truyền Thông", year: 2024, badge: "Mới", isbn: "978-604-789-345-6" },
        { id: "5", name: "Đắc Nhân Tâm (Tái Bản Mới)", author: "Dale Carnegie", price: 120000, imageSrc: "https://via.placeholder.com/300x450/FFCDD2/795548?text=Đắc+Nhân+Tâm", description: "Cuốn sách kinh điển về nghệ thuật giao tiếp và ứng xử, giúp bạn xây dựng mối quan hệ tốt đẹp và thành công hơn.", category: "Kỹ Năng Sống", pages: 300, publisher: "NXB Tổng Hợp TP.HCM", year: 2023, isbn: "978-604-588-111-1" },
        { id: "6", name: "Nhà Giả Kim (Phiên Bản Đặc Biệt)", author: "Paulo Coelho", price: 165000, imageSrc: "https://via.placeholder.com/300x450/C5CAE9/3F51B5?text=Nhà+Giả+Kim", description: "Câu chuyện đầy cảm hứng về hành trình theo đuổi ước mơ, mang đến những bài học sâu sắc về cuộc sống.", category: "Văn Học", pages: 250, publisher: "NXB Văn Học", year: 2022, isbn: "978-604-999-222-2" },
        { id: "7", name: "Deep Learning Với PyTorch", author: "Eli Stevens & Luca Antiga", price: 350000, imageSrc: "https://via.placeholder.com/300x450/B2DFDB/00796B?text=Deep+Learning", description: "Khám phá thế giới học sâu và xây dựng các mô hình AI mạnh mẽ với framework PyTorch. Phù hợp cho người có kiến thức nền tảng về Python.", category: "Công Nghệ", pages: 620, publisher: "NXB Bách Khoa Hà Nội", year: 2024, badge: "Mới", isbn: "978-604-777-333-3" },
        { id: "8", name: "Sapiens: Lược Sử Loài Người", author: "Yuval Noah Harari", price: 290000, imageSrc: "https://via.placeholder.com/300x450/F0F4C3/AFB42B?text=Sapiens", description: "Một cái nhìn tổng quan và sâu sắc về lịch sử hình thành và phát triển của loài người Homo Sapiens.", category: "Khoa Học", pages: 500, publisher: "NXB Tri Thức", year: 2020, isbn: "978-604-666-444-4" },
        { id: "9", name: "Atomic Habits: Thay Đổi Tí Hon, Hiệu Quả Bất Ngờ", author: "James Clear", price: 195000, imageSrc: "https://via.placeholder.com/300x450/FFE0B2/FB8C00?text=Atomic+Habits", description: "Phương pháp xây dựng thói quen tốt và loại bỏ thói quen xấu một cách hiệu quả, dựa trên khoa học hành vi.", category: "Kỹ Năng Sống", pages: 340, publisher: "NXB Lao Động", year: 2021, isbn: "978-604-555-555-5" },
        { id: "10", name: "Muôn Kiếp Nhân Sinh (Tập 1)", author: "Nguyên Phong", price: 170000, imageSrc: "https://via.placeholder.com/300x450/D1C4E9/673AB7?text=Muôn+Kiếp+Nhân+Sinh", description: "Những câu chuyện kỳ lạ về luật nhân quả và luân hồi, mang đến những chiêm nghiệm sâu sắc về đời người.", category: "Văn Học", pages: 400, publisher: "NXB Tổng Hợp TP.HCM", year: 2020, isbn: "978-604-444-666-6" },
        { id: "11", name: "JavaScript Nâng Cao và ES6+", author: "Kyle Simpson", price: 320000, imageSrc: "https://via.placeholder.com/300x450/BBDEFB/1976D2?text=JS+Nâng+Cao", description: "Đi sâu vào các khía cạnh phức tạp của JavaScript và làm chủ các tính năng hiện đại của ES6 trở lên.", category: "Công Nghệ", pages: 580, publisher: "NXB Khoa Học Kỹ Thuật", year: 2023, isbn: "978-604-333-777-7" },
        { id: "12", name: "Bố Già (The Godfather)", author: "Mario Puzo", price: 210000, imageSrc: "https://via.placeholder.com/300x450/9E9E9E/212121?text=Bố+Già", description: "Tiểu thuyết hình sự kinh điển về thế giới mafia Ý tại Mỹ, đầy kịch tính và những nhân vật phức tạp.", category: "Văn Học", pages: 520, publisher: "NXB Hội Nhà Văn", year: 2022, isbn: "978-604-222-888-8" },
        { id: "13", name: "Algorithms to Live By", author: "Brian Christian & Tom Griffiths", price: 240000, imageSrc: "https://via.placeholder.com/300x450/F8BBD0/C2185B?text=Algorithms+to+Live+By", description: "Áp dụng các thuật toán khoa học máy tính vào việc giải quyết các vấn đề thường ngày trong cuộc sống.", category: "Khoa Học", pages: 380, publisher: "NXB Dân Trí", year: 2021, isbn: "978-604-111-999-9" },
        { id: "14", name: "Clean Code: A Handbook of Agile Software Craftsmanship", author: "Robert C. Martin", price: 400000, imageSrc: "https://via.placeholder.com/300x450/80CBC4/004D40?text=Clean+Code", description: "Cẩm nang viết mã sạch, dễ đọc, dễ bảo trì dành cho lập trình viên chuyên nghiệp.", category: "Công Nghệ", pages: 464, publisher: "NXB Pearson", year: 2008, badge: "Best Seller", isbn: "978-013-235-088-4" },
        { id: "15", name: "Tội Ác và Hình Phạt", author: "Fyodor Dostoevsky", price: 230000, imageSrc: "https://via.placeholder.com/300x450/A1887F/3E2723?text=Tội+Ác+Hình+Phạt", description: "Kiệt tác văn học Nga, khám phá chiều sâu tâm lý tội phạm và những dằn vặt lương tâm.", category: "Văn Học", pages: 600, publisher: "NXB Văn Học", year: 2023, isbn: "978-604-888-000-0" },
        { id: "16", name: "Hacking: The Art of Exploitation, 2nd Edition", author: "Jon Erickson", price: 450000, imageSrc: "https://via.placeholder.com/300x450/000000/FFFFFF?text=Hacking+Art", description: "Cuốn sách chuyên sâu về kỹ thuật hacking và an toàn thông tin, từ cơ bản đến nâng cao.", category: "Công Nghệ", pages: 488, publisher: "No Starch Press", year: 2008, isbn: "978-159-327-144-2" },
        { id: "17", name: "Vũ Trụ Trong Vỏ Hạt Dẻ", author: "Stephen Hawking", price: 190000, imageSrc: "https://via.placeholder.com/300x450/607D8B/FFFFFF?text=Vũ+Trụ+Vỏ+Hạt+Dẻ", description: "Khám phá những bí ẩn của vũ trụ, từ Big Bang đến lỗ đen, qua lời giải thích dễ hiểu của nhà vật lý thiên tài.", category: "Khoa Học", pages: 240, publisher: "NXB Trẻ", year: 2018, isbn: "978-604-777-112-2" },
        { id: "18", name: "Tư Duy Nhanh và Chậm", author: "Daniel Kahneman", price: 260000, imageSrc: "https://via.placeholder.com/300x450/FFEB3B/000000?text=Tư+Duy+Nhanh+Chậm", description: "Phân tích hai hệ thống tư duy của con người và những thành kiến có thể ảnh hưởng đến quyết định của chúng ta.", category: "Kỹ Năng Sống", pages: 550, publisher: "NXB Thế Giới", year: 2019, isbn: "978-604-654-321-0" },
        { id: "19", name: "Luật Hấp Dẫn: Bí Mật Tối Cao", author: "Rhonda Byrne", price: 175000, imageSrc: "https://via.placeholder.com/300x450/E91E63/FFFFFF?text=Luật+Hấp+Dẫn", description: "Khám phá sức mạnh của suy nghĩ tích cực và cách áp dụng Luật Hấp Dẫn để đạt được mong muốn trong cuộc sống.", category: "Kỹ Năng Sống", pages: 280, publisher: "NXB Hồng Đức", year: 2020, isbn: "978-604-890-123-4" },
        { id: "20", name: "Trăm Năm Cô Đơn", author: "Gabriel Garcia Marquez", price: 200000, imageSrc: "https://via.placeholder.com/300x450/4CAF50/FFFFFF?text=Trăm+Năm+Cô+Đơn", description: "Một trong những tiểu thuyết vĩ đại nhất thế kỷ 20, với lối viết hiện thực huyền ảo đặc trưng.", category: "Văn Học", pages: 480, publisher: "NXB Hội Nhà Văn", year: 2021, isbn: "978-604-789-987-6" },
        { id: "21", name: "Để Con Được Ốm", author: "BS. Trí Đoàn & Mẹ Ong Bông", price: 130000, imageSrc: "https://via.placeholder.com/300x450/FF9800/000000?text=Để+Con+Được+Ốm", description: "Cẩm nang chăm sóc sức khỏe trẻ em khoa học, giúp bố mẹ bình tĩnh đối mặt với những bệnh thường gặp ở trẻ.", category: "Sách Thiếu Nhi", pages: 250, publisher: "NXB Phụ Nữ", year: 2017, isbn: "978-604-567-123-4" },
        { id: "22", name: "Cây Cam Ngọt Của Tôi", author: "José Mauro de Vasconcelos", price: 95000, imageSrc: "https://via.placeholder.com/300x450/795548/FFFFFF?text=Cây+Cam+Ngọt", description: "Câu chuyện cảm động về tuổi thơ và tình bạn của cậu bé Zezé với cây cam sau vườn.", category: "Sách Thiếu Nhi", pages: 200, publisher: "NXB Văn Học", year: 2015, isbn: "978-604-432-456-7" },
        { id: "23", name: "Lược Sử Thời Gian", author: "Stephen Hawking", price: 210000, imageSrc: "https://via.placeholder.com/300x450/3F51B5/FFFFFF?text=Lược+Sử+Thời+Gian", description: "Một cuốn sách khoa học thường thức kinh điển, giải thích các khái niệm phức tạp về vũ trụ học một cách dễ hiểu.", category: "Khoa Học", pages: 280, publisher: "NXB Trẻ", year: 2016, isbn: "978-604-123-789-0" },
        { id: "24", name: "Hoàng Tử Bé (Bản Đặc Biệt)", author: "Antoine de Saint-Exupéry", price: 150000, imageSrc: "https://via.placeholder.com/300x450/03A9F4/000000?text=Hoàng+Tử+Bé", description: "Câu chuyện triết lý nhẹ nhàng dành cho cả trẻ em và người lớn, với những bài học sâu sắc về tình bạn, tình yêu và ý nghĩa cuộc sống.", category: "Sách Thiếu Nhi", pages: 120, publisher: "NXB Kim Đồng", year: 2024, badge: "Mới", isbn: "978-604-200-000-1" }
    ];

    // Mảng đường dẫn ảnh sách giả
const fakeBookImages = [
    'images/books/book1.jpg',
    'images/books/book2.jpg',
    'images/books/book3.jpg',
    'images/books/book4.jpg',
    'images/books/book5.jpg',
    'images/books/book6.jpg',
    'images/books/book7.jpg',
    'images/books/book8.jpg'
];

// Hàm lấy ảnh ngẫu nhiên từ mảng
function getRandomBookImage() {
    const randomIndex = Math.floor(Math.random() * fakeBookImages.length);
    return fakeBookImages[randomIndex];
}

// Hàm gán ảnh cho sản phẩm theo ID (để ảnh không thay đổi mỗi lần tải)
function getBookImageById(id) {
    // Sử dụng phép chia lấy dư để đảm bảo id luôn nằm trong phạm vi của mảng ảnh
    const imageIndex = id % fakeBookImages.length;
    return fakeBookImages[imageIndex];
}

// --- COMMON FUNCTIONS & VARIABLES ---
    const cartCountElement = document.querySelector('.cart-link .cart-count');
    let cart = JSON.parse(localStorage.getItem('bookHavenCart')) || [];

    // User Authentication Data (SIMULATED - NOT SECURE FOR PRODUCTION)
    let registeredUsers = JSON.parse(localStorage.getItem('bookHavenUsers')) || [];
    let currentUser = JSON.parse(localStorage.getItem('bookHavenCurrentUser')) || null;


    function updateCartIcon() {
        if (cartCountElement) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
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

    function handleAddToCart(bookId, bookName, bookPrice, bookImage) {
        const existingItemIndex = cart.findIndex(item => item.id === bookId);
        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += 1;
        } else {
            cart.push({ id: bookId, name: bookName, price: parseFloat(bookPrice), image: bookImage, quantity: 1 });
        }
        saveCart();
    }

    // --- HEADER UI UPDATE BASED ON AUTH STATUS ---
    function updateHeaderUserUI() {
        const headerActionsContainer = document.getElementById('header-actions-container');
        if (!headerActionsContainer) return;

        // Giữ lại nút search (nếu có) và nút giỏ hàng
        const searchBtnHTML = headerActionsContainer.querySelector('.search-btn') ? headerActionsContainer.querySelector('.search-btn').outerHTML : '';
        const cartLinkHTML = headerActionsContainer.querySelector('.cart-link').outerHTML; // Luôn có nút giỏ hàng
        
        let userHTML = '';
        if (currentUser) {
            userHTML = `
                ${searchBtnHTML}
                <span class="user-info" aria-label="Thông tin người dùng"><i class="fas fa-user-check"></i> Chào, ${currentUser.username}!</span>
                <button class="user-logout-btn" id="logout-button" aria-label="Đăng xuất"><i class="fas fa-sign-out-alt"></i> Đăng Xuất</button>
                ${cartLinkHTML}
            `;
        } else {
             // Xác định trang hiện tại để đánh dấu active
            const currentPage = document.body.id;
            const loginActiveClass = (currentPage === 'login-page-body') ? 'active' : '';
            const registerActiveClass = (currentPage === 'register-page-body') ? 'active' : '';

            userHTML = `
                ${searchBtnHTML}
                <a href="login.html" class="user-account ${loginActiveClass}"><i class="fas fa-sign-in-alt"></i> Đăng Nhập</a>
                <a href="register.html" class="user-register ${registerActiveClass}"><i class="fas fa-user-plus"></i> Đăng Ký</a>
                ${cartLinkHTML}
            `;
        }
        headerActionsContainer.innerHTML = userHTML;

        // Re-attach event listener for logout button if it exists
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', handleLogout);
        }
        updateCartIcon(); // Cập nhật lại icon giỏ hàng sau khi render lại header
    }

    function handleLogout() {
        currentUser = null;
        localStorage.removeItem('bookHavenCurrentUser');
        updateHeaderUserUI();
        // Tùy chọn: chuyển hướng về trang chủ hoặc trang đăng nhập
        if (document.body.id !== 'home-page-body') { // Tránh reload nếu đang ở trang chủ
             window.location.href = 'index.html';
        }
    }
    
    // Initial UI updates
    updateHeaderUserUI(); // Cập nhật header dựa trên trạng thái đăng nhập
    updateCartIcon();     // Cập nhật icon giỏ hàng

    // --- PAGE SPECIFIC LOGIC ---

    // REGISTRATION PAGE LOGIC
    if (document.body.id === 'register-page-body') {
        const registerForm = document.getElementById('register-form');
        const registerMessage = document.getElementById('register-message');

        registerForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const username = event.target.username.value.trim();
            const email = event.target.email.value.trim();
            const password = event.target.password.value;
            const confirmPassword = event.target.confirmPassword.value;

            registerMessage.textContent = '';
            registerMessage.className = 'form-message';


            if (password !== confirmPassword) {
                registerMessage.textContent = 'Mật khẩu xác nhận không khớp!';
                registerMessage.classList.add('error');
                return;
            }
            if (password.length < 6) {
                registerMessage.textContent = 'Mật khẩu phải có ít nhất 6 ký tự!';
                registerMessage.classList.add('error');
                return;
            }

            const userExists = registeredUsers.some(user => user.username === username || user.email === email);
            if (userExists) {
                registerMessage.textContent = 'Tên đăng nhập hoặc email đã tồn tại!';
                registerMessage.classList.add('error');
                return;
            }

            // Lưu người dùng mới (KHÔNG AN TOÀN TRONG THỰC TẾ)
            const newUser = { username, email, password }; // Lưu password plain text chỉ cho demo
            registeredUsers.push(newUser);
            localStorage.setItem('bookHavenUsers', JSON.stringify(registeredUsers));

            registerMessage.textContent = 'Đăng ký thành công! Bạn có thể đăng nhập ngay.';
            registerMessage.classList.add('success');
            event.target.reset(); // Xóa form

            // Tùy chọn: tự động chuyển hướng sang trang đăng nhập sau vài giây
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        });
    }

    // LOGIN PAGE LOGIC
    if (document.body.id === 'login-page-body') {
        const loginForm = document.getElementById('login-form');
        const loginMessage = document.getElementById('login-message');

        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const usernameOrEmail = event.target.username.value.trim();
            const password = event.target.password.value;
            loginMessage.textContent = '';
            loginMessage.className = 'form-message';

            const foundUser = registeredUsers.find(user => 
                (user.username === usernameOrEmail || user.email === usernameOrEmail) && user.password === password
            );

            if (foundUser) {
                currentUser = { username: foundUser.username, email: foundUser.email }; // Chỉ lưu thông tin cần thiết
                localStorage.setItem('bookHavenCurrentUser', JSON.stringify(currentUser));
                updateHeaderUserUI(); // Cập nhật UI ngay
                // Chuyển hướng về trang chủ
                window.location.href = 'index.html';
            } else {
                loginMessage.textContent = 'Tên đăng nhập/email hoặc mật khẩu không đúng!';
                loginMessage.classList.add('error');
            }
        });
    }
    
    // HOMEPAGE LOGIC (Giữ nguyên hoặc điều chỉnh nếu cần từ lần trước)
    if (document.body.id === 'home-page-body') {
        const bookGridContainer = document.getElementById('book-grid-container');

        function renderProductsOnHomepage() {
            if (!bookGridContainer) return;
            bookGridContainer.innerHTML = ''; // Clear existing
            
            // Hiển thị tất cả sản phẩm, hoặc bạn có thể lọc/sắp xếp ở đây
            allProducts.forEach(book => {
                const bookCard = document.createElement('article');
                bookCard.classList.add('book-card');
                
                let priceHTML = `<p class="book-price">${formatPrice(book.price)}</p>`;
                if (book.originalPrice) {
                    priceHTML = `<p class="book-price"><span class="original-price">${formatPrice(book.originalPrice)}</span> ${formatPrice(book.price)}</p>`;
                }

                let badgeHTML = '';
                if (book.badge) {
                    const badgeClass = book.badge.toLowerCase() === 'mới' ? 'new-badge' : (book.badge.toLowerCase() === 'sale' ? 'sale-badge' : 'best-seller-badge');
                    badgeHTML = `<span class="badge ${badgeClass}">${book.badge}</span>`;
                }
                
                bookCard.innerHTML = `
                    <div class="book-image-container">
                        <a href="product-detail.html?id=${book.id}">
                            <img src="${book.imageSrc}" alt="${book.name}">
                        </a>
                        ${badgeHTML}
                        <div class="book-actions">
                            <button class="btn-icon wishlist-btn" data-id="${book.id}" aria-label="Thêm vào yêu thích"><i class="far fa-heart"></i></button>
                            <button class="btn-icon quick-view-btn" data-id="${book.id}" aria-label="Xem nhanh"><i class="far fa-eye"></i></button>
                        </div>
                    </div>
                    <div class="book-info">
                        <h3 class="book-title"><a href="product-detail.html?id=${book.id}">${book.name}</a></h3>
                        <p class="book-author">${book.author}</p>
                        ${priceHTML}
                        <button class="btn btn-secondary add-to-cart-btn" data-id="${book.id}" data-name="${book.name}" data-price="${book.price}" data-image="${book.imageSrc}">Thêm vào giỏ</button>
                    </div>
                `;
                bookGridContainer.appendChild(bookCard);
            });

            const addToCartButtons = bookGridContainer.querySelectorAll('.add-to-cart-btn');
            addToCartButtons.forEach(button => {
                button.addEventListener('click', function() {
                    handleAddToCart(this.dataset.id, this.dataset.name, this.dataset.price, this.dataset.image);
                    this.innerHTML = '<i class="fas fa-check"></i> Đã thêm!'; this.disabled = true;
                    setTimeout(() => { this.innerHTML = 'Thêm vào giỏ'; this.disabled = false; }, 1500);
                });
            });
             bookGridContainer.querySelectorAll('.wishlist-btn, .quick-view-btn').forEach(btn => {
                btn.addEventListener('click', function(e){ /* ... (như cũ) ... */ });
            });
        }
        renderProductsOnHomepage();
    }

    // PRODUCT DETAIL PAGE LOGIC (Giữ nguyên hoặc điều chỉnh nếu cần từ lần trước)
    if (document.body.id === 'product-detail-page-body') {
        const productDetailContainer = document.getElementById('product-detail-container');
        const loadingMessage = document.getElementById('product-loading-message');

        function renderProductDetail() {
            if (!productDetailContainer || !loadingMessage) return;

            const urlParams = new URLSearchParams(window.location.search);
            const productId = urlParams.get('id');

            const product = allProducts.find(p => p.id === productId);

            loadingMessage.style.display = 'none'; // Hide loading message

            if (product) {
                document.title = `${product.name} - BookHaven`; 
                let priceHTMLDetail = `<p class="product-price-detail">${formatPrice(product.price)}</p>`;
                if (product.originalPrice) {
                    priceHTMLDetail = `<p class="product-price-detail">${formatPrice(product.price)} <span class="original-price-detail">${formatPrice(product.originalPrice)}</span></p>`;
                }
                
                productDetailContainer.innerHTML = `
                    <div class="product-detail-image-gallery">
                        <img src="${product.imageSrc}" alt="${product.name}" class="main-product-image">
                         ${product.badge ? `<span class="badge ${product.badge.toLowerCase() === 'mới' ? 'new-badge' : (product.badge.toLowerCase() === 'sale' ? 'sale-badge' : 'best-seller-badge')}" style="position:absolute; top:10px; left:10px;">${product.badge}</span>` : ''}
                    </div>
                    <div class="product-detail-info">
                        <h1 class="product-title-detail">${product.name}</h1>
                        <p class="product-author-detail">Tác giả: ${product.author}</p>
                        ${priceHTMLDetail}
                        <div class="product-description-detail">
                            <h4>Mô tả sản phẩm:</h4>
                            <p>${product.description}</p>
                        </div>
                        <div class="product-specifications">
                             <h3>Thông số kỹ thuật:</h3>
                            <ul>
                                <li><strong>ISBN:</strong> ${product.isbn || 'Đang cập nhật'}</li>
                                <li><strong>Nhà xuất bản:</strong> ${product.publisher || 'Đang cập nhật'}</li>
                                <li><strong>Năm xuất bản:</strong> ${product.year || 'Đang cập nhật'}</li>
                                <li><strong>Số trang:</strong> ${product.pages || 'Đang cập nhật'}</li>
                                <li><strong>Thể loại:</strong> ${product.category || 'Đang cập nhật'}</li>
                            </ul>
                        </div>
                        <div class="product-detail-actions">
                            <button class="btn btn-primary add-to-cart-btn-detail" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-image="${product.imageSrc}">
                                <i class="fas fa-cart-plus"></i> Thêm vào giỏ hàng
                            </button>
                            <button class="btn btn-secondary wishlist-btn-detail" data-id="${product.id}">
                                <i class="far fa-heart"></i> Yêu thích
                            </button>
                        </div>
                    </div>
                `;

                // Add to cart from detail page
                const detailAddToCartBtn = productDetailContainer.querySelector('.add-to-cart-btn-detail');
                if (detailAddToCartBtn) {
                    detailAddToCartBtn.addEventListener('click', function() {
                        handleAddToCart(this.dataset.id, this.dataset.name, this.dataset.price, this.dataset.image);
                         this.innerHTML = '<i class="fas fa-check"></i> Đã thêm!';
                         this.disabled = true;
                         setTimeout(() => {
                             this.innerHTML = '<i class="fas fa-cart-plus"></i> Thêm vào giỏ hàng';
                             this.disabled = false;
                         }, 1500);
                    });
                }
                // Wishlist from detail page
                const detailWishlistBtn = productDetailContainer.querySelector('.wishlist-btn-detail');
                if(detailWishlistBtn){
                    detailWishlistBtn.addEventListener('click', function(){
                        alert(`Sản phẩm ID ${this.dataset.id}: Chức năng "Yêu thích" sẽ được phát triển sau!`);
                    });
                }

            } else {
                productDetailContainer.innerHTML = `<p id="product-not-found-message">Rất tiếc, không tìm thấy sản phẩm này.</p>`;
            }
        }
        renderProductDetail();
    }

    // CART PAGE LOGIC (Giữ nguyên từ lần trước)
    if (document.body.id === 'cart-page-body') {
        const cartItemsContainer = document.getElementById('cart-items-container');
        const cartTotalAmountElement = document.getElementById('cart-total-amount');
        const emptyCartMessage = document.getElementById('empty-cart-message');
        const checkoutButton = document.querySelector('.btn-checkout');

        function renderCartItems() {
            if (!cartItemsContainer || !cartTotalAmountElement || !emptyCartMessage) return;
            cartItemsContainer.innerHTML = '';
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
                            <button class="quantity-decrease" data-id="${item.id}" aria-label="Giảm số lượng">-</button>
                            <input type="number" value="${item.quantity}" min="1" data-id="${item.id}" class="quantity-input" aria-label="Số lượng" readonly>
                            <button class="quantity-increase" data-id="${item.id}" aria-label="Tăng số lượng">+</button>
                        </div>
                        <div class="cart-item-price">${formatPrice(item.price * item.quantity)}</div>
                        <div class="cart-item-remove">
                            <button data-id="${item.id}" aria-label="Xóa sản phẩm"><i class="fas fa-trash-alt"></i> Xóa</button>
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

        cartItemsContainer.addEventListener('click', function(event) {
            const target = event.target.closest('button'); // Chỉ bắt sự kiện trên button
            if (!target) return; 
            
            const bookId = target.dataset.id;
            if (!bookId) return;

            if (target.classList.contains('quantity-decrease')) {
                const item = cart.find(i => i.id === bookId);
                if (item) updateQuantity(bookId, item.quantity - 1);
            } else if (target.classList.contains('quantity-increase')) {
                const item = cart.find(i => i.id === bookId);
                if (item) updateQuantity(bookId, item.quantity + 1);
            } else if (target.closest('.cart-item-remove')) { // Check if parent is remove area
                updateQuantity(bookId, 0); 
            }
        });
        
        if (checkoutButton) {
            checkoutButton.addEventListener('click', function() {
                if (cart.length > 0) {
                    alert('Chức năng thanh toán sẽ được phát triển ở giai đoạn sau!');
                } else {
                    alert('Giỏ hàng của bạn trống!');
                }
            });
        }
        renderCartItems();
    }

    // --- COMMON UI ELEMENTS (Mobile Nav, Footer Year, Newsletter) ---
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const mainNav = document.querySelector('.main-nav');
    if (mobileNavToggle && mainNav) {
        mobileNavToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            const isExpanded = mainNav.classList.contains('active');
            mobileNavToggle.setAttribute('aria-expanded', isExpanded);
            const icon = mobileNavToggle.querySelector('i');
            if (isExpanded) { icon.classList.remove('fa-bars'); icon.classList.add('fa-times'); }
            else { icon.classList.remove('fa-times'); icon.classList.add('fa-bars'); }
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
            } else { alert('Vui lòng nhập địa chỉ email của bạn.'); }
        });
    }

    const yearSpan = document.getElementById('current-year');
    if (yearSpan) { yearSpan.textContent = new Date().getFullYear(); }
});
document.addEventListener('DOMContentLoaded', function() {

    // --- PRODUCT DATA (DATABASE) ---
    const allProducts = [
        { id: "1", name: "Lập Trình Python Từ Zero đến Hero", author: "Tác giả Nguyễn Văn A", price: 185000, imageSrc: "https://via.placeholder.com/300x450/E8DDCB/7D5A36?text=Python+Mastery", description: "Cuốn sách toàn diện cho người mới bắt đầu học Python...", category: "Công Nghệ", pages: 450, publisher: "NXB Khoa Học Kỹ Thuật", year: 2023, isbn: "978-604-123-456-7" },
        { id: "2", name: "Nghệ Thuật Tư Duy Phản Biện", author: "Tác giả Trần Thị B", price: 220000, originalPrice: 250000, imageSrc: "https://via.placeholder.com/300x450/D6E4E5/41644A?text=Critical+Thinking", description: "Rèn luyện kỹ năng tư duy logic...", category: "Kỹ Năng Sống", pages: 320, publisher: "NXB Trẻ", year: 2022, isbn: "978-604-321-789-0" },
        { id: "3", name: "Marketing Hiện Đại Cho Người Mới", author: "Tác giả Lê Văn C", price: 150000, imageSrc: "https://via.placeholder.com/300x450/FFF8E1/BCAAA4?text=Modern+Marketing", description: "Giới thiệu các khái niệm cốt lõi của marketing...", category: "Kinh Tế", pages: 280, publisher: "NXB Kinh Tế TP.HCM", year: 2023, badge: "Sale", isbn: "978-604-456-012-3" },
        { id: "4", name: "Thiết Kế Web Chuyên Nghiệp", author: "Tác giả Phạm Thị D", price: 280000, imageSrc: "https://via.placeholder.com/300x450/CFD8DC/37474F?text=Pro+Web+Design", description: "Hướng dẫn chi tiết cách xây dựng website hiện đại...", category: "Công Nghệ", pages: 550, publisher: "NXB Thông Tin & Truyền Thông", year: 2024, badge: "Mới", isbn: "978-604-789-345-6" },
        { id: "5", name: "Đắc Nhân Tâm (Tái Bản 2024)", author: "Dale Carnegie", price: 120000, imageSrc: "https://via.placeholder.com/300x450/FFCDD2/795548?text=Đắc+Nhân+Tâm+2024", description: "Cuốn sách kinh điển về nghệ thuật giao tiếp...", category: "Kỹ Năng Sống", pages: 300, publisher: "NXB Tổng Hợp TP.HCM", year: 2024, badge: "Mới", isbn: "978-604-588-111-1" },
        { id: "6", name: "Nhà Giả Kim (Bìa Cứng)", author: "Paulo Coelho", price: 165000, imageSrc: "https://via.placeholder.com/300x450/C5CAE9/3F51B5?text=Nhà+Giả+Kim+HC", description: "Câu chuyện đầy cảm hứng về hành trình theo đuổi ước mơ...", category: "Văn Học", pages: 250, publisher: "NXB Văn Học", year: 2022, isbn: "978-604-999-222-2" },
        { id: "7", name: "Deep Learning Với PyTorch Thực Hành", author: "Eli Stevens & Luca Antiga", price: 350000, imageSrc: "https://via.placeholder.com/300x450/B2DFDB/00796B?text=PyTorch+in+Action", description: "Khám phá thế giới học sâu và xây dựng các mô hình AI...", category: "Công Nghệ", pages: 620, publisher: "NXB Bách Khoa Hà Nội", year: 2024, badge: "Mới", isbn: "978-604-777-333-3" },
        { id: "8", name: "Sapiens: Lược Sử Loài Người (Bản Mới)", author: "Yuval Noah Harari", price: 290000, imageSrc: "https://via.placeholder.com/300x450/F0F4C3/AFB42B?text=Sapiens+Updated", description: "Một cái nhìn tổng quan và sâu sắc về lịch sử...", category: "Khoa Học", pages: 500, publisher: "NXB Tri Thức", year: 2023, isbn: "978-604-666-444-4" },
        { id: "9", name: "Atomic Habits: Xây Dựng Thói Quen Tốt", author: "James Clear", price: 195000, imageSrc: "https://via.placeholder.com/300x450/FFE0B2/FB8C00?text=Atomic+Habits+VN", description: "Phương pháp xây dựng thói quen tốt và loại bỏ thói quen xấu...", category: "Kỹ Năng Sống", pages: 340, publisher: "NXB Lao Động", year: 2021, isbn: "978-604-555-555-5" },
        { id: "10", name: "Muôn Kiếp Nhân Sinh (Tập 2)", author: "Nguyên Phong", price: 170000, imageSrc: "https://via.placeholder.com/300x450/D1C4E9/673AB7?text=Muôn+Kiếp+Vol.2", description: "Những câu chuyện kỳ lạ về luật nhân quả và luân hồi...", category: "Văn Học", pages: 400, publisher: "NXB Tổng Hợp TP.HCM", year: 2021, isbn: "978-604-444-667-3" },
        { id: "11", name: "JavaScript Toàn Tập", author: "David Flanagan", price: 320000, imageSrc: "https://via.placeholder.com/300x450/BBDEFB/1976D2?text=JS+Definitive+Guide", description: "Đi sâu vào các khía cạnh phức tạp của JavaScript...", category: "Công Nghệ", pages: 580, publisher: "NXB O'Reilly", year: 2023, isbn: "978-604-333-777-7" },
        { id: "12", name: "Bố Già (Bản Kỷ Niệm)", author: "Mario Puzo", price: 210000, imageSrc: "https://via.placeholder.com/300x450/9E9E9E/212121?text=Godfather+Anv.", description: "Tiểu thuyết hình sự kinh điển về thế giới mafia...", category: "Văn Học", pages: 520, publisher: "NXB Hội Nhà Văn", year: 2022, isbn: "978-604-222-888-8" },
        { id: "13", name: "Thuật Toán Trong Đời Sống", author: "Brian Christian & Tom Griffiths", price: 240000, imageSrc: "https://via.placeholder.com/300x450/F8BBD0/C2185B?text=Algorithms+To+Live", description: "Áp dụng các thuật toán khoa học máy tính vào việc giải quyết...", category: "Khoa Học", pages: 380, publisher: "NXB Dân Trí", year: 2021, isbn: "978-604-111-999-9" },
        { id: "14", name: "Clean Code Handbook", author: "Robert C. Martin", price: 400000, imageSrc: "https://via.placeholder.com/300x450/80CBC4/004D40?text=Clean+Code+Hand", description: "Cẩm nang viết mã sạch, dễ đọc, dễ bảo trì...", category: "Công Nghệ", pages: 464, publisher: "NXB Pearson", year: 2008, badge: "Best Seller", isbn: "978-013-235-088-4" },
        { id: "15", name: "Tội Ác và Trừng Phạt (Bìa Mới)", author: "Fyodor Dostoevsky", price: 230000, imageSrc: "https://via.placeholder.com/300x450/A1887F/3E2723?text=Crime+Punishment+New", description: "Kiệt tác văn học Nga, khám phá chiều sâu tâm lý...", category: "Văn Học", pages: 600, publisher: "NXB Văn Học", year: 2023, isbn: "978-604-888-000-0" },
        { id: "16", name: "Nghệ Thuật Hacking (Tái bản)", author: "Jon Erickson", price: 450000, imageSrc: "https://via.placeholder.com/300x450/000000/FFFFFF?text=Hacking+Art+Re", description: "Cuốn sách chuyên sâu về kỹ thuật hacking và an toàn thông tin...", category: "Công Nghệ", pages: 488, publisher: "No Starch Press", year: 2020, isbn: "978-159-327-144-2" },
        { id: "17", name: "Vũ Trụ Trong Vỏ Hạt Dẻ (2023 Edition)", author: "Stephen Hawking", price: 190000, imageSrc: "https://via.placeholder.com/300x450/607D8B/FFFFFF?text=Universe+Nutshell+23", description: "Khám phá những bí ẩn của vũ trụ, từ Big Bang đến lỗ đen...", category: "Khoa Học", pages: 240, publisher: "NXB Trẻ", year: 2023, isbn: "978-604-777-112-2" },
        { id: "18", name: "Tư Duy Nhanh và Chậm (Bản Đầy Đủ)", author: "Daniel Kahneman", price: 260000, imageSrc: "https://via.placeholder.com/300x450/FFEB3B/000000?text=Thinking+Fast+Slow+Full", description: "Phân tích hai hệ thống tư duy của con người...", category: "Kỹ Năng Sống", pages: 550, publisher: "NXB Thế Giới", year: 2019, isbn: "978-604-654-321-0" },
        { id: "19", name: "Bí Mật Của Nước", author: "Masaru Emoto", price: 175000, imageSrc: "https://via.placeholder.com/300x450/2196F3/FFFFFF?text=The+Hidden+Messages+Water", description: "Khám phá những thông điệp ẩn chứa trong nước và ảnh hưởng của ý nghĩ...", category: "Khoa Học", pages: 210, publisher: "NXB Thanh Niên", year: 2018, isbn: "978-604-890-123-7" },
        { id: "20", name: "Trăm Năm Cô Đơn (Bìa Da)", author: "Gabriel Garcia Marquez", price: 200000, originalPrice: 280000, imageSrc: "https://via.placeholder.com/300x450/4CAF50/FFFFFF?text=One+Hundred+Years+Leather", description: "Một trong những tiểu thuyết vĩ đại nhất thế kỷ 20...", category: "Văn Học", pages: 480, publisher: "NXB Hội Nhà Văn", year: 2021, badge: "Sale", isbn: "978-604-789-987-6" },
        { id: "21", name: "Để Con Được Khỏe Mạnh", author: "BS. Trí Đoàn", price: 130000, imageSrc: "https://via.placeholder.com/300x450/FF9800/000000?text=Để+Con+Khỏe+Mạnh", description: "Cẩm nang chăm sóc sức khỏe trẻ em khoa học...", category: "Sách Thiếu Nhi", pages: 250, publisher: "NXB Phụ Nữ", year: 2020, isbn: "978-604-567-123-4" },
        { id: "22", name: "Cây Cam Ngọt Của Tôi (Phiên Bản Mới)", author: "José Mauro de Vasconcelos", price: 95000, imageSrc: "https://via.placeholder.com/300x450/795548/FFFFFF?text=My+Sweet+Orange+Tree+New", description: "Câu chuyện cảm động về tuổi thơ và tình bạn...", category: "Sách Thiếu Nhi", pages: 200, publisher: "NXB Văn Học", year: 2022, isbn: "978-604-432-456-7" },
        { id: "23", name: "Lược Sử Thời Gian (Bản Phổ Thông)", author: "Stephen Hawking", price: 210000, imageSrc: "https://via.placeholder.com/300x450/3F51B5/FFFFFF?text=Brief+History+Time+Pop", description: "Một cuốn sách khoa học thường thức kinh điển...", category: "Khoa Học", pages: 280, publisher: "NXB Trẻ", year: 2019, isbn: "978-604-123-789-0" },
        { id: "24", name: "Hoàng Tử Bé (Tranh Màu)", author: "Antoine de Saint-Exupéry", price: 150000, imageSrc: "https://via.placeholder.com/300x450/03A9F4/000000?text=Little+Prince+Color", description: "Câu chuyện triết lý nhẹ nhàng dành cho cả trẻ em và người lớn...", category: "Sách Thiếu Nhi", pages: 120, publisher: "NXB Kim Đồng", year: 2024, badge: "Mới", isbn: "978-604-200-000-1" }
    ];


    // --- COMMON FUNCTIONS & VARIABLES ---
    const cartCountElement = document.querySelector('.cart-link .cart-count');
    let cart = JSON.parse(localStorage.getItem('bookHavenCart')) || [];
    
    // User Authentication Data (SIMULATED - NOT SECURE FOR PRODUCTION)
    let registeredUsers = JSON.parse(localStorage.getItem('bookHavenUsers')) || [];
    let currentUser = JSON.parse(localStorage.getItem('bookHavenCurrentUser')) || null;


    function updateCartIcon() {
        if (cartCountElement) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
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

    function handleAddToCart(bookId, bookName, bookPrice, bookImage) {
        const existingItemIndex = cart.findIndex(item => item.id === bookId);
        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += 1;
        } else {
            cart.push({ id: bookId, name: bookName, price: parseFloat(bookPrice), image: bookImage, quantity: 1 });
        }
        saveCart();
    }

    // --- HEADER UI UPDATE BASED ON AUTH STATUS ---
    function updateHeaderUserUI() {
        const headerActionsContainer = document.getElementById('header-actions-container');
        if (!headerActionsContainer) return;

        // Giữ lại nút search (nếu có) và nút giỏ hàng
        const searchBtnHTML = headerActionsContainer.querySelector('.search-btn') ? headerActionsContainer.querySelector('.search-btn').outerHTML : '';
        const cartLinkHTML = headerActionsContainer.querySelector('.cart-link').outerHTML; // Luôn có nút giỏ hàng
        
        let userHTML = '';
        if (currentUser) {
            userHTML = `
                ${searchBtnHTML}
                <span class="user-info" aria-label="Thông tin người dùng"><i class="fas fa-user-check"></i> Chào, ${currentUser.username}!</span>
                <button class="user-logout-btn" id="logout-button" aria-label="Đăng xuất"><i class="fas fa-sign-out-alt"></i> Đăng Xuất</button>
                ${cartLinkHTML}
            `;
        } else {
             // Xác định trang hiện tại để đánh dấu active
            const currentPage = document.body.id;
            const loginActiveClass = (currentPage === 'login-page-body') ? 'active' : '';
            const registerActiveClass = (currentPage === 'register-page-body') ? 'active' : '';

            userHTML = `
                ${searchBtnHTML}
                <a href="login.html" class="user-account ${loginActiveClass}"><i class="fas fa-sign-in-alt"></i> Đăng Nhập</a>
                <a href="register.html" class="user-register ${registerActiveClass}"><i class="fas fa-user-plus"></i> Đăng Ký</a>
                ${cartLinkHTML}
            `;
        }
        headerActionsContainer.innerHTML = userHTML;

        // Re-attach event listener for logout button if it exists
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', handleLogout);
        }
        updateCartIcon(); // Cập nhật lại icon giỏ hàng sau khi render lại header
    }

    function handleLogout() {
        currentUser = null;
        localStorage.removeItem('bookHavenCurrentUser');
        updateHeaderUserUI();
        // Tùy chọn: chuyển hướng về trang chủ hoặc trang đăng nhập
        if (document.body.id !== 'home-page-body') { // Tránh reload nếu đang ở trang chủ
             window.location.href = 'index.html';
        }
    }
    
    // Initial UI updates
    updateHeaderUserUI(); // Cập nhật header dựa trên trạng thái đăng nhập
    updateCartIcon();     // Cập nhật icon giỏ hàng

    // --- PAGE SPECIFIC LOGIC ---

    // REGISTRATION PAGE LOGIC
    if (document.body.id === 'register-page-body') {
        const registerForm = document.getElementById('register-form');
        const registerMessage = document.getElementById('register-message');

        registerForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const username = event.target.username.value.trim();
            const email = event.target.email.value.trim();
            const password = event.target.password.value;
            const confirmPassword = event.target.confirmPassword.value;

            registerMessage.textContent = '';
            registerMessage.className = 'form-message';


            if (password !== confirmPassword) {
                registerMessage.textContent = 'Mật khẩu xác nhận không khớp!';
                registerMessage.classList.add('error');
                return;
            }
            if (password.length < 6) {
                registerMessage.textContent = 'Mật khẩu phải có ít nhất 6 ký tự!';
                registerMessage.classList.add('error');
                return;
            }

            const userExists = registeredUsers.some(user => user.username === username || user.email === email);
            if (userExists) {
                registerMessage.textContent = 'Tên đăng nhập hoặc email đã tồn tại!';
                registerMessage.classList.add('error');
                return;
            }

            // Lưu người dùng mới (KHÔNG AN TOÀN TRONG THỰC TẾ)
            const newUser = { username, email, password }; // Lưu password plain text chỉ cho demo
            registeredUsers.push(newUser);
            localStorage.setItem('bookHavenUsers', JSON.stringify(registeredUsers));

            registerMessage.textContent = 'Đăng ký thành công! Bạn có thể đăng nhập ngay.';
            registerMessage.classList.add('success');
            event.target.reset(); // Xóa form

            // Tùy chọn: tự động chuyển hướng sang trang đăng nhập sau vài giây
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        });
    }

    // LOGIN PAGE LOGIC
    if (document.body.id === 'login-page-body') {
        const loginForm = document.getElementById('login-form');
        const loginMessage = document.getElementById('login-message');

        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const usernameOrEmail = event.target.username.value.trim();
            const password = event.target.password.value;
            loginMessage.textContent = '';
            loginMessage.className = 'form-message';

            const foundUser = registeredUsers.find(user => 
                (user.username === usernameOrEmail || user.email === usernameOrEmail) && user.password === password
            );

            if (foundUser) {
                currentUser = { username: foundUser.username, email: foundUser.email }; // Chỉ lưu thông tin cần thiết
                localStorage.setItem('bookHavenCurrentUser', JSON.stringify(currentUser));
                updateHeaderUserUI(); // Cập nhật UI ngay
                // Chuyển hướng về trang chủ
                window.location.href = 'index.html';
            } else {
                loginMessage.textContent = 'Tên đăng nhập/email hoặc mật khẩu không đúng!';
                loginMessage.classList.add('error');
            }
        });
    }
    
    // HOMEPAGE LOGIC (Giữ nguyên hoặc điều chỉnh nếu cần từ lần trước)
    if (document.body.id === 'home-page-body') {
        const bookGridContainer = document.getElementById('book-grid-container');

        function renderProductsOnHomepage() {
            if (!bookGridContainer) return;
            bookGridContainer.innerHTML = ''; // Clear existing
            
            // Hiển thị tất cả sản phẩm, hoặc bạn có thể lọc/sắp xếp ở đây
            allProducts.forEach(book => {
                const bookCard = document.createElement('article');
                bookCard.classList.add('book-card');
                
                let priceHTML = `<p class="book-price">${formatPrice(book.price)}</p>`;
                if (book.originalPrice) {
                    priceHTML = `<p class="book-price"><span class="original-price">${formatPrice(book.originalPrice)}</span> ${formatPrice(book.price)}</p>`;
                }

                let badgeHTML = '';
                if (book.badge) {
                    const badgeClass = book.badge.toLowerCase() === 'mới' ? 'new-badge' : (book.badge.toLowerCase() === 'sale' ? 'sale-badge' : 'best-seller-badge');
                    badgeHTML = `<span class="badge ${badgeClass}">${book.badge}</span>`;
                }
                
                bookCard.innerHTML = `
                    <div class="book-image-container">
                        <a href="product-detail.html?id=${book.id}">
                            <img src="${book.imageSrc}" alt="${book.name}">
                        </a>
                        ${badgeHTML}
                        <div class="book-actions">
                            <button class="btn-icon wishlist-btn" data-id="${book.id}" aria-label="Thêm vào yêu thích"><i class="far fa-heart"></i></button>
                            <button class="btn-icon quick-view-btn" data-id="${book.id}" aria-label="Xem nhanh"><i class="far fa-eye"></i></button>
                        </div>
                    </div>
                    <div class="book-info">
                        <h3 class="book-title"><a href="product-detail.html?id=${book.id}">${book.name}</a></h3>
                        <p class="book-author">${book.author}</p>
                        ${priceHTML}
                        <button class="btn btn-secondary add-to-cart-btn" data-id="${book.id}" data-name="${book.name}" data-price="${book.price}" data-image="${book.imageSrc}">Thêm vào giỏ</button>
                    </div>
                `;
                bookGridContainer.appendChild(bookCard);
            });

            const addToCartButtons = bookGridContainer.querySelectorAll('.add-to-cart-btn');
            addToCartButtons.forEach(button => {
                button.addEventListener('click', function() {
                    handleAddToCart(this.dataset.id, this.dataset.name, this.dataset.price, this.dataset.image);
                    this.innerHTML = '<i class="fas fa-check"></i> Đã thêm!'; this.disabled = true;
                    setTimeout(() => { this.innerHTML = 'Thêm vào giỏ'; this.disabled = false; }, 1500);
                });
            });
             bookGridContainer.querySelectorAll('.wishlist-btn, .quick-view-btn').forEach(btn => {
                btn.addEventListener('click', function(e){ /* ... (như cũ) ... */ });
            });
        }
        renderProductsOnHomepage();
    }

    // PRODUCT DETAIL PAGE LOGIC (Giữ nguyên hoặc điều chỉnh nếu cần từ lần trước)
    if (document.body.id === 'product-detail-page-body') {
        const productDetailContainer = document.getElementById('product-detail-container');
        const loadingMessage = document.getElementById('product-loading-message');

        function renderProductDetail() {
            if (!productDetailContainer || !loadingMessage) return;

            const urlParams = new URLSearchParams(window.location.search);
            const productId = urlParams.get('id');

            const product = allProducts.find(p => p.id === productId);

            loadingMessage.style.display = 'none'; // Hide loading message

            if (product) {
                document.title = `${product.name} - BookHaven`; 
                let priceHTMLDetail = `<p class="product-price-detail">${formatPrice(product.price)}</p>`;
                if (product.originalPrice) {
                    priceHTMLDetail = `<p class="product-price-detail">${formatPrice(product.price)} <span class="original-price-detail">${formatPrice(product.originalPrice)}</span></p>`;
                }
                
                productDetailContainer.innerHTML = `
                    <div class="product-detail-image-gallery">
                        <img src="${product.imageSrc}" alt="${product.name}" class="main-product-image">
                         ${product.badge ? `<span class="badge ${product.badge.toLowerCase() === 'mới' ? 'new-badge' : (product.badge.toLowerCase() === 'sale' ? 'sale-badge' : 'best-seller-badge')}" style="position:absolute; top:10px; left:10px;">${product.badge}</span>` : ''}
                    </div>
                    <div class="product-detail-info">
                        <h1 class="product-title-detail">${product.name}</h1>
                        <p class="product-author-detail">Tác giả: ${product.author}</p>
                        ${priceHTMLDetail}
                        <div class="product-description-detail">
                            <h4>Mô tả sản phẩm:</h4>
                            <p>${product.description}</p>
                        </div>
                        <div class="product-specifications">
                             <h3>Thông số kỹ thuật:</h3>
                            <ul>
                                <li><strong>ISBN:</strong> ${product.isbn || 'Đang cập nhật'}</li>
                                <li><strong>Nhà xuất bản:</strong> ${product.publisher || 'Đang cập nhật'}</li>
                                <li><strong>Năm xuất bản:</strong> ${product.year || 'Đang cập nhật'}</li>
                                <li><strong>Số trang:</strong> ${product.pages || 'Đang cập nhật'}</li>
                                <li><strong>Thể loại:</strong> ${product.category || 'Đang cập nhật'}</li>
                            </ul>
                        </div>
                        <div class="product-detail-actions">
                            <button class="btn btn-primary add-to-cart-btn-detail" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-image="${product.imageSrc}">
                                <i class="fas fa-cart-plus"></i> Thêm vào giỏ hàng
                            </button>
                            <button class="btn btn-secondary wishlist-btn-detail" data-id="${product.id}">
                                <i class="far fa-heart"></i> Yêu thích
                            </button>
                        </div>
                    </div>
                `;

                // Add to cart from detail page
                const detailAddToCartBtn = productDetailContainer.querySelector('.add-to-cart-btn-detail');
                if (detailAddToCartBtn) {
                    detailAddToCartBtn.addEventListener('click', function() {
                        handleAddToCart(this.dataset.id, this.dataset.name, this.dataset.price, this.dataset.image);
                         this.innerHTML = '<i class="fas fa-check"></i> Đã thêm!';
                         this.disabled = true;
                         setTimeout(() => {
                             this.innerHTML = '<i class="fas fa-cart-plus"></i> Thêm vào giỏ hàng';
                             this.disabled = false;
                         }, 1500);
                    });
                }
                // Wishlist from detail page
                const detailWishlistBtn = productDetailContainer.querySelector('.wishlist-btn-detail');
                if(detailWishlistBtn){
                    detailWishlistBtn.addEventListener('click', function(){
                        alert(`Sản phẩm ID ${this.dataset.id}: Chức năng "Yêu thích" sẽ được phát triển sau!`);
                    });
                }

            } else {
                productDetailContainer.innerHTML = `<p id="product-not-found-message">Rất tiếc, không tìm thấy sản phẩm này.</p>`;
            }
        }
        renderProductDetail();
    }

    // CART PAGE LOGIC (Giữ nguyên từ lần trước)
    if (document.body.id === 'cart-page-body') {
        const cartItemsContainer = document.getElementById('cart-items-container');
        const cartTotalAmountElement = document.getElementById('cart-total-amount');
        const emptyCartMessage = document.getElementById('empty-cart-message');
        const checkoutButton = document.querySelector('.btn-checkout');

        function renderCartItems() {
            if (!cartItemsContainer || !cartTotalAmountElement || !emptyCartMessage) return;
            cartItemsContainer.innerHTML = '';
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
                            <button class="quantity-decrease" data-id="${item.id}" aria-label="Giảm số lượng">-</button>
                            <input type="number" value="${item.quantity}" min="1" data-id="${item.id}" class="quantity-input" aria-label="Số lượng" readonly>
                            <button class="quantity-increase" data-id="${item.id}" aria-label="Tăng số lượng">+</button>
                        </div>
                        <div class="cart-item-price">${formatPrice(item.price * item.quantity)}</div>
                        <div class="cart-item-remove">
                            <button data-id="${item.id}" aria-label="Xóa sản phẩm"><i class="fas fa-trash-alt"></i> Xóa</button>
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

        cartItemsContainer.addEventListener('click', function(event) {
            const target = event.target.closest('button'); // Chỉ bắt sự kiện trên button
            if (!target) return; 
            
            const bookId = target.dataset.id;
            if (!bookId) return;

            if (target.classList.contains('quantity-decrease')) {
                const item = cart.find(i => i.id === bookId);
                if (item) updateQuantity(bookId, item.quantity - 1);
            } else if (target.classList.contains('quantity-increase')) {
                const item = cart.find(i => i.id === bookId);
                if (item) updateQuantity(bookId, item.quantity + 1);
            } else if (target.closest('.cart-item-remove')) { // Check if parent is remove area
                updateQuantity(bookId, 0); 
            }
        });
        
        if (checkoutButton) {
            checkoutButton.addEventListener('click', function() {
                if (cart.length > 0) {
                    alert('Chức năng thanh toán sẽ được phát triển ở giai đoạn sau!');
                } else {
                    alert('Giỏ hàng của bạn trống!');
                }
            });
        }
        renderCartItems();
    }

    // --- COMMON UI ELEMENTS (Mobile Nav, Footer Year, Newsletter) ---
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const mainNav = document.querySelector('.main-nav');
    if (mobileNavToggle && mainNav) {
        mobileNavToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            const isExpanded = mainNav.classList.contains('active');
            mobileNavToggle.setAttribute('aria-expanded', isExpanded);
            const icon = mobileNavToggle.querySelector('i');
            if (isExpanded) { icon.classList.remove('fa-bars'); icon.classList.add('fa-times'); }
            else { icon.classList.remove('fa-times'); icon.classList.add('fa-bars'); }
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
            } else { alert('Vui lòng nhập địa chỉ email của bạn.'); }
        });
    }

    const yearSpan = document.getElementById('current-year');
    if (yearSpan) { yearSpan.textContent = new Date().getFullYear(); }
});