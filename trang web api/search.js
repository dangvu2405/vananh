document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const searchBtn = document.querySelector('.search-btn');
    const searchModal = document.getElementById('searchModal');
    const searchCloseBtn = document.getElementById('searchCloseBtn');
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    // Mở modal tìm kiếm
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            searchModal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Ngăn cuộn trang khi modal mở
            setTimeout(() => {
                searchInput.focus(); // Focus vào ô tìm kiếm
            }, 100);
        });
    }

    // Đóng modal tìm kiếm
    if (searchCloseBtn) {
        searchCloseBtn.addEventListener('click', function() {
            searchModal.classList.remove('active');
            document.body.style.overflow = '';
            searchInput.value = '';
            searchResults.innerHTML = '';
        });
    }

    // Đóng modal khi click bên ngoài
    if (searchModal) {
        searchModal.addEventListener('click', function(e) {
            if (e.target === searchModal) {
                searchModal.classList.remove('active');
                document.body.style.overflow = '';
                searchInput.value = '';
                searchResults.innerHTML = '';
            }
        });
    }

    // Xử lý tìm kiếm
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            performSearch(searchInput.value.trim());
        });
    }

    // Input event để xử lý tìm kiếm khi gõ
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            if (this.value.length >= 2) { // Tìm kiếm khi nhập ít nhất 2 ký tự
                performSearch(this.value.trim());
            } else if (this.value.length === 0) {
                searchResults.innerHTML = ''; // Xóa kết quả khi xóa hết input
            }
        });
    }

    // Hàm thực hiện tìm kiếm
    function performSearch(query) {
        const books = JSON.parse(localStorage.getItem('bookHavenBooks')) || [];
        
        if (query === '') {
            searchResults.innerHTML = '';
            return;
        }

        // Tìm kiếm theo tên sách, tác giả, danh mục
        const results = books.filter(book => {
            return (
                book.title.toLowerCase().includes(query.toLowerCase()) || 
                book.author.toLowerCase().includes(query.toLowerCase()) ||
                (book.category && book.category.toLowerCase().includes(query.toLowerCase()))
            );
        });

        displaySearchResults(results, query);
    }

    // Hiển thị kết quả tìm kiếm
    function displaySearchResults(results, query) {
        searchResults.innerHTML = '';

        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="search-no-results">
                    <i class="fas fa-search fa-3x mb-3 text-muted"></i>
                    <h4>Không tìm thấy kết quả</h4>
                    <p>Không tìm thấy sách phù hợp với từ khóa "${query}"</p>
                </div>
            `;
            return;
        }

        results.forEach(book => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            
            resultItem.innerHTML = `
                <div class="search-result-image">
                    <img src="${book.image}" alt="${book.title}">
                </div>
                <div class="search-result-info">
                    <h4 class="search-result-title"><a href="product-detail.html?id=${book.id}">${book.title}</a></h4>
                    <p class="search-result-author">${book.author}</p>
                    <p class="search-result-price">${formatCurrency(book.price)}</p>
                    <button class="btn btn-primary btn-sm add-to-cart-btn" data-book-id="${book.id}">Thêm vào giỏ</button>
                </div>
            `;
            
            searchResults.appendChild(resultItem);
        });

        // Thêm sự kiện cho nút thêm vào giỏ hàng
        document.querySelectorAll('.search-results .add-to-cart-btn').forEach(button => {
            button.addEventListener('click', function() {
                const bookId = this.getAttribute('data-book-id');
                addToCart(bookId);
                alert('Đã thêm sách vào giỏ hàng!');
            });
        });
    }

    // Format tiền tệ
    function formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0
        }).format(amount).replace('₫', 'VNĐ');
    }

    // Thêm vào giỏ hàng
    function addToCart(bookId) {
        const books = JSON.parse(localStorage.getItem('bookHavenBooks')) || [];
        const book = books.find(b => b.id == bookId);
        
        if (!book) return;
        
        let cart = JSON.parse(localStorage.getItem('bookHavenCart')) || [];
        
        const existingItem = cart.find(item => item.id == bookId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: book.id,
                title: book.title,
                author: book.author,
                price: book.price,
                image: book.image,
                quantity: 1
            });
        }
        
        localStorage.setItem('bookHavenCart', JSON.stringify(cart));
        
        // Cập nhật số lượng trên icon giỏ hàng
        updateCartCount();
    }

    // Cập nhật số lượng sản phẩm trong giỏ hàng
    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('bookHavenCart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        const cartCountElements = document.querySelectorAll('.cart-count');
        cartCountElements.forEach(element => {
            element.textContent = totalItems;
            element.classList.toggle('has-items', totalItems > 0);
        });
    }
});