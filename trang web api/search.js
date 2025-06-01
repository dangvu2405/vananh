document.addEventListener('DOMContentLoaded', function() {
    console.log("Search.js loaded"); // Debugging
    
    // DOM Elements
    const searchBtn = document.querySelector('.search-btn');
    const searchModal = document.getElementById('searchModal');
    const searchCloseBtn = document.getElementById('searchCloseBtn');
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    
    // Log để kiểm tra xem các elements có được tìm thấy không
    console.log("Search button:", searchBtn);
    console.log("Search modal:", searchModal);
    
    // Mở modal tìm kiếm
    if (searchBtn) {
        // Xóa các event listener cũ nếu có
        searchBtn.removeEventListener('click', openSearchModal);
        // Thêm event listener mới
        searchBtn.addEventListener('click', openSearchModal);
        console.log("Search button event listener added");
    } else {
        console.error("Search button not found!");
    }
    
    function openSearchModal() {
        console.log("Open search modal called");
        if (searchModal) {
            searchModal.classList.add('show');
            document.body.classList.add('modal-open'); // Ngăn cuộn trang khi modal mở
            setTimeout(() => {
                searchInput.focus(); // Focus vào ô tìm kiếm
            }, 100);
        }
    }

    // Đóng modal tìm kiếm
    if (searchCloseBtn) {
        searchCloseBtn.addEventListener('click', closeSearchModal);
    } else {
        console.error("Search close button not found!");
    }
    
    function closeSearchModal() {
        if (searchModal) {
            searchModal.classList.remove('show');
            document.body.classList.remove('modal-open');
            if (searchInput) searchInput.value = '';
            if (searchResults) searchResults.innerHTML = '';
        }
    }

    // Đóng modal khi click bên ngoài
    if (searchModal) {
        searchModal.addEventListener('click', function(e) {
            if (e.target === this) { // Kiểm tra xem click có phải vào đúng modal background không
                closeSearchModal();
            }
        });
    }

    // Xử lý tìm kiếm khi submit form
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (query) {
                console.log("Performing search for:", query);
                performSearch(query);
            }
        });
    }

    // Input event để xử lý tìm kiếm khi gõ (tìm kiếm tự động)
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.trim();
            if (query.length >= 2) { // Tìm kiếm khi nhập ít nhất 2 ký tự
                performSearch(query);
            } else if (query.length === 0) {
                searchResults.innerHTML = ''; // Xóa kết quả khi xóa hết input
            }
        });
    }

    // Hàm thực hiện tìm kiếm
    function performSearch(query) {
        // Hiển thị thông báo đang tìm kiếm
        searchResults.innerHTML = '<div class="searching-indicator"><i class="fas fa-spinner fa-spin"></i> Đang tìm kiếm...</div>';
        
        // Lấy danh sách sách từ localStorage
        const books = JSON.parse(localStorage.getItem('bookHavenBooks')) || [];
        console.log("Total books in database:", books.length);
        
        if (query === '') {
            searchResults.innerHTML = '';
            return;
        }

        // Tìm kiếm theo tên sách, tác giả, và danh mục
        const results = books.filter(book => {
            const nameMatch = book.name && book.name.toLowerCase().includes(query.toLowerCase());
            const authorMatch = book.author && book.author.toLowerCase().includes(query.toLowerCase());
            const categoryMatch = book.category && book.category.toLowerCase().includes(query.toLowerCase());
            const descriptionMatch = book.description && book.description.toLowerCase().includes(query.toLowerCase());
            
            return nameMatch || authorMatch || categoryMatch || descriptionMatch;
        });

        console.log("Search results count:", results.length);
        
        // Hiển thị kết quả tìm kiếm sau 300ms để tạo cảm giác mượt mà
        setTimeout(() => {
            displaySearchResults(results, query);
        }, 300);
    }

    // Hiển thị kết quả tìm kiếm
    function displaySearchResults(results, query) {
        searchResults.innerHTML = '';

        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="search-no-results">
                    <i class="fas fa-search fa-3x mb-3"></i>
                    <h4>Không tìm thấy kết quả</h4>
                    <p>Không tìm thấy sách phù hợp với từ khóa "${query}"</p>
                </div>
            `;
            return;
        }

        // Thêm tiêu đề kết quả tìm kiếm
        const resultsHeader = document.createElement('div');
        resultsHeader.className = 'search-results-header';
        resultsHeader.innerHTML = `<h4>Tìm thấy ${results.length} kết quả cho "${query}"</h4>`;
        searchResults.appendChild(resultsHeader);

        // Hiển thị các kết quả tìm kiếm
        results.forEach(book => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            
            // Chuẩn bị URL ảnh dự phòng dựa trên ID
            const fallbackImageId = (parseInt(book.id) % 8) + 1;
            const fallbackImage = `images/books/book${fallbackImageId}.jpeg`;
            
            resultItem.innerHTML = `
                <div class="search-result-image">
                    <img src="${book.imageSrc || fallbackImage}" alt="${book.name}" 
                         onerror="this.onerror=null; this.src='${fallbackImage}';">
                </div>
                <div class="search-result-info">
                    <h4 class="search-result-title">
                        <a href="product-detail.html?id=${book.id}">${book.name}</a>
                    </h4>
                    <p class="search-result-author">${book.author || 'Không rõ tác giả'}</p>
                    <p class="search-result-price">${formatCurrency(book.price)}</p>
                    <div class="search-result-actions">
                        <button class="btn btn-primary btn-sm add-to-cart-btn" data-id="${book.id}">
                            <i class="fas fa-cart-plus"></i> Thêm vào giỏ
                        </button>
                        <a href="product-detail.html?id=${book.id}" class="btn btn-outline-secondary btn-sm">
                            <i class="fas fa-info-circle"></i> Chi tiết
                        </a>
                    </div>
                </div>
            `;
            
            searchResults.appendChild(resultItem);
        });

        // Thêm sự kiện cho nút thêm vào giỏ hàng
        document.querySelectorAll('.search-results .add-to-cart-btn').forEach(button => {
            button.addEventListener('click', function() {
                const bookId = this.getAttribute('data-id');
                addBookToCart(bookId, this);
            });
        });
    }

    // Hàm thêm sách vào giỏ hàng
    function addBookToCart(bookId, buttonElement) {
        const books = JSON.parse(localStorage.getItem('bookHavenBooks')) || [];
        const book = books.find(b => b.id === bookId);
        
        if (!book) {
            alert('Không tìm thấy thông tin sách');
            return;
        }
        
        // Kiểm tra đăng nhập trước khi thêm vào giỏ hàng
        const userSession = JSON.parse(localStorage.getItem('bookHavenUserSession'));
        if (!userSession || !userSession.isAuthenticated) {
            const confirmLogin = confirm('Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng. Chuyển đến trang đăng nhập?');
            if (confirmLogin) {
                localStorage.setItem('bookHaven_pendingCartItem', bookId);
                localStorage.setItem('bookHaven_redirect_after_login', window.location.href);
                window.location.href = 'login.html';
            }
            return;
        }
        
        // Người dùng đã đăng nhập, thêm vào giỏ hàng
        const cartName = `bookHavenCart_${userSession.userId}`;
        let cart = JSON.parse(localStorage.getItem(cartName)) || [];
        
        const existingItem = cart.find(item => item.id === bookId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: book.id,
                name: book.name,
                author: book.author || '',
                price: book.price,
                image: book.imageSrc || `images/books/book${(parseInt(book.id) % 8) + 1}.jpeg`,
                quantity: 1
            });
        }
        
        localStorage.setItem(cartName, JSON.stringify(cart));
        
        // Cập nhật số lượng giỏ hàng trên icon
        updateCartCount();
        
        // Hiển thị phản hồi thành công
        if (buttonElement) {
            showAddedToCartFeedback(buttonElement);
        } else {
            alert(`Đã thêm "${book.name}" vào giỏ hàng!`);
        }
    }

    // Hiện thị phản hồi khi thêm vào giỏ hàng
    function showAddedToCartFeedback(button) {
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Đã thêm';
        button.disabled = true;
        button.classList.add('btn-success');
        button.classList.remove('btn-primary');
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.disabled = false;
            button.classList.remove('btn-success');
            button.classList.add('btn-primary');
        }, 1500);
    }

    // Hàm cập nhật số lượng sản phẩm trong giỏ hàng
    function updateCartCount() {
        const userSession = JSON.parse(localStorage.getItem('bookHavenUserSession'));
        const cartName = userSession && userSession.isAuthenticated ? 
            `bookHavenCart_${userSession.userId}` : 'bookHavenCart';
        const cart = JSON.parse(localStorage.getItem(cartName)) || [];
        
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
        
        const cartCountElements = document.querySelectorAll('.cart-count');
        cartCountElements.forEach(element => {
            element.textContent = totalItems;
        });
    }

    // Format tiền tệ
    function formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0
        }).format(amount);
    }
    
    // Hack: Thêm event listener toàn cục cho nút tìm kiếm để đảm bảo hoạt động
    window.addEventListener('click', function(e) {
        if (e.target.closest('.search-btn')) {
            openSearchModal();
        }
    });
});

// Thêm search handler toàn cục ngoài DOMContentLoaded để đảm bảo mã luôn chạy
(function() {
    console.log("Adding global search handler");
    
    function initializeSearchModal() {
        const searchBtn = document.querySelector('.search-btn');
        const searchModal = document.getElementById('searchModal');
        
        if (searchBtn && searchModal) {
            searchBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log("Global search handler triggered");
                searchModal.classList.add('show');
                document.body.classList.add('modal-open');
                
                const searchInput = document.getElementById('searchInput');
                if (searchInput) {
                    setTimeout(() => searchInput.focus(), 100);
                }
            });
        }
    }
    
    // Chạy khi DOM đã sẵn sàng
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeSearchModal);
    } else {
        // DOM đã sẵn sàng
        initializeSearchModal();
    }
})();