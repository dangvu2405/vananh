document.addEventListener('DOMContentLoaded', function() {
    // Hero slider
    const heroSwiper = new Swiper('.hero-swiper', {
        loop: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.hero-swiper .swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.hero-swiper .swiper-button-next',
            prevEl: '.hero-swiper .swiper-button-prev',
        },
        effect: 'fade',
        fadeEffect: {
            crossFade: true
        }
    });

    // Sale books slider
    const saleSwiper = new Swiper('.sale-swiper', {
        slidesPerView: 2,
        spaceBetween: 20,
        pagination: {
            el: '.sale-swiper .swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.sale-swiper .swiper-button-next',
            prevEl: '.sale-swiper .swiper-button-prev',
        },
        breakpoints: {
            640: {
                slidesPerView: 2,
                spaceBetween: 20,
            },
            768: {
                slidesPerView: 3,
                spaceBetween: 30,
            },
            1024: {
                slidesPerView: 4,
                spaceBetween: 30,
            },
        }
    });

    // New releases slider
    const newReleasesSwiper = new Swiper('.new-releases-swiper', {
        slidesPerView: 2,
        spaceBetween: 20,
        pagination: {
            el: '.new-releases-swiper .swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.new-releases-swiper .swiper-button-next',
            prevEl: '.new-releases-swiper .swiper-button-prev',
        },
        breakpoints: {
            640: {
                slidesPerView: 2,
                spaceBetween: 20,
            },
            768: {
                slidesPerView: 3,
                spaceBetween: 30,
            },
            1024: {
                slidesPerView: 4,
                spaceBetween: 30,
            },
        }
    });

    // Populate sale books
    const saleBooks = [
        {
            id: 101,
            name: 'Đắc Nhân Tâm',
            author: 'Dale Carnegie',
            originalPrice: 150000,
            salePrice: 120000,
            imageSrc: 'https://salt.tikicdn.com/cache/w1200/ts/product/0b/7a/1c/00a5473314c8c720bd2559709847339e.jpg',
            discount: '-20%'
        },
        {
            id: 102,
            name: 'Nhà Giả Kim',
            author: 'Paulo Coelho',
            originalPrice: 120000,
            salePrice: 90000,
            imageSrc: 'https://salt.tikicdn.com/cache/w1200/ts/product/b8/b0/88/59d677cd3a3414e76a3011e7cd275dc1.jpg',
            discount: '-25%'
        },
        {
            id: 103,
            name: 'Tuổi Trẻ Đáng Giá Bao Nhiêu',
            author: 'Rosie Nguyễn',
            originalPrice: 90000,
            salePrice: 72000,
            imageSrc: 'https://salt.tikicdn.com/cache/w1200/ts/product/ea/58/e2/0413b4421e34c87839311eb46b862387.jpg',
            discount: '-20%'
        },
        {
            id: 104,
            name: 'Atomic Habits',
            author: 'James Clear',
            originalPrice: 180000,
            salePrice: 144000,
            imageSrc: 'https://salt.tikicdn.com/cache/w1200/ts/product/22/cb/a9/524a27dcd45e8a13ae6eecb3dfacba7c.jpg',
            discount: '-20%'
        },
        {
            id: 105,
            name: 'Đời Ngắn Đừng Ngủ Dài',
            author: 'Robin Sharma',
            originalPrice: 95000,
            salePrice: 76000,
            imageSrc: 'https://salt.tikicdn.com/cache/w1200/ts/product/f9/d6/93/9064a81294b4461c7e73d7d3dc11a766.jpg',
            discount: '-20%'
        }
    ];
    
    const saleSwiperWrapper = document.querySelector('.sale-swiper .swiper-wrapper');
    if (saleSwiperWrapper) {
        saleBooks.forEach(book => {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            slide.innerHTML = `
                <div class="card h-100 product-card position-relative">
                    <span class="badge bg-danger position-absolute top-0 end-0 m-2">${book.discount}</span>
                    <div class="text-center p-3">
                        <img src="${book.imageSrc}" class="card-img-top book-img" alt="${book.name}" style="height: 200px; object-fit: contain;">
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title book-title">${book.name}</h5>
                        <p class="card-text text-muted">${book.author}</p>
                        <div class="mt-auto">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <span class="fw-bold text-danger">${formatPrice(book.salePrice)}</span>
                                    <span class="text-muted text-decoration-line-through small">${formatPrice(book.originalPrice)}</span>
                                </div>
                                <button class="btn btn-outline-primary btn-sm add-to-cart" data-id="${book.id}" data-name="${book.name}" data-price="${book.salePrice}" data-image="${book.imageSrc}">
                                    <i class="fas fa-cart-plus"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            saleSwiperWrapper.appendChild(slide);
        });
    }

    // Populate new releases
    const newBooks = [
        {
            id: 201,
            name: 'Sapiens: Lược Sử Loài Người',
            author: 'Yuval Noah Harari',
            price: 190000,
            imageSrc: 'https://salt.tikicdn.com/cache/w1200/ts/product/c1/4a/9c/ec1de2d901cbf5a0ad9caea666626b61.jpg'
        },
        {
            id: 202,
            name: 'Không Gia Đình',
            author: 'Hector Malot',
            price: 110000,
            imageSrc: 'https://salt.tikicdn.com/cache/w1200/ts/product/6e/7c/7e/17805928cd7dcd1249521d983c15f039.jpg'
        },
        {
            id: 203,
            name: 'Tâm Lý Học Hành Vi',
            author: 'Robert Cialdini',
            price: 165000,
            imageSrc: 'https://salt.tikicdn.com/cache/w1200/ts/product/bd/3c/bd/d9be40ee90ea898e77f5055a597efbfb.jpg'
        },
        {
            id: 204,
            name: 'Người Trong Muôn Nghề',
            author: 'Spiderum',
            price: 120000,
            imageSrc: 'https://salt.tikicdn.com/cache/w1200/ts/product/1d/95/6f/ca524a58dd915f8bd71e8e8a371321eb.jpg'
        },
        {
            id: 205,
            name: 'Bạn Đắt Giá Bao Nhiêu?',
            author: 'Vãn Tình',
            price: 85000,
            imageSrc: 'https://salt.tikicdn.com/cache/w1200/ts/product/0c/27/60/268ce251288ec47597d2da960b054c7c.jpg'
        }
    ];
    
    const newReleasesSwiperWrapper = document.querySelector('.new-releases-swiper .swiper-wrapper');
    if (newReleasesSwiperWrapper) {
        newBooks.forEach(book => {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            slide.innerHTML = `
                <div class="card h-100 product-card">
                    <span class="badge bg-success position-absolute top-0 end-0 m-2">Mới</span>
                    <div class="text-center p-3">
                        <img src="${book.imageSrc}" class="card-img-top book-img" alt="${book.name}" style="height: 200px; object-fit: contain;">
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title book-title">${book.name}</h5>
                        <p class="card-text text-muted">${book.author}</p>
                        <div class="mt-auto">
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="fw-bold">${formatPrice(book.price)}</span>
                                <button class="btn btn-outline-primary btn-sm add-to-cart" data-id="${book.id}" data-name="${book.name}" data-price="${book.price}" data-image="${book.imageSrc}">
                                    <i class="fas fa-cart-plus"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            newReleasesSwiperWrapper.appendChild(slide);
        });
    }
    
    // Thêm chức năng cho nút "Thêm vào giỏ" trong các slider
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const productId = this.dataset.id;
            const productName = this.dataset.name;
            const productPrice = parseInt(this.dataset.price);
            const productImage = this.dataset.image;
            
            // Lấy giỏ hàng từ localStorage hoặc tạo mới nếu chưa có
            let cart = JSON.parse(localStorage.getItem('bookHavenCart')) || [];
            
            // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
            const existingItemIndex = cart.findIndex(item => item.id === productId);
            
            if (existingItemIndex > -1) {
                // Nếu đã có, tăng số lượng
                cart[existingItemIndex].quantity += 1;
            } else {
                // Nếu chưa có, thêm sản phẩm mới
                cart.push({
                    id: productId,
                    name: productName,
                    price: productPrice,
                    image: productImage,
                    quantity: 1
                });
            }
            
            // Lưu giỏ hàng vào localStorage
            localStorage.setItem('bookHavenCart', JSON.stringify(cart));
            
            // Cập nhật số lượng sản phẩm hiển thị trên header
            updateCartCount();
            
            // Hiển thị thông báo
            showAddToCartNotification(productName);
        });
    });
    
    // Hàm format giá tiền
    function formatPrice(price) {
        return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
    }
    
    // Hàm cập nhật số lượng sản phẩm trong giỏ hàng
    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('bookHavenCart')) || [];
        const cartCountElements = document.querySelectorAll('.cart-count');
        
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        cartCountElements.forEach(element => {
            element.textContent = totalItems;
            
            // Thêm hiệu ứng "bounce" khi thêm sản phẩm
            element.classList.add('cart-count-animation');
            setTimeout(() => {
                element.classList.remove('cart-count-animation');
            }, 300);
        });
    }
    
    // Hàm hiển thị thông báo đã thêm vào giỏ hàng
    function showAddToCartNotification(productName) {
        // Kiểm tra xem đã có thông báo nào chưa
        let notification = document.querySelector('.cart-notification');
        
        // Nếu chưa có, tạo mới
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'cart-notification';
            document.body.appendChild(notification);
        }
        
        // Cập nhật nội dung và hiển thị
        notification.innerHTML = `
            <div class="cart-notification-content">
                <i class="fas fa-check-circle text-success"></i>
                <span>Đã thêm "${productName}" vào giỏ hàng!</span>
                <a href="cart.html" class="btn btn-sm btn-outline-primary ms-3">Xem giỏ hàng</a>
            </div>
        `;
        notification.classList.add('show');
        
        // Tự động ẩn sau 3 giây
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    // Cập nhật số lượng sản phẩm khi tải trang
    updateCartCount();
});