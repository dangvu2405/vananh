document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('register-form');
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Lấy các giá trị từ form
            const username = document.getElementById('reg-username').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            const confirmPassword = document.getElementById('reg-confirm-password').value;
            const messageElement = document.getElementById('register-message');
            
            // Kiểm tra mật khẩu xác nhận
            if (password !== confirmPassword) {
                messageElement.textContent = 'Mật khẩu xác nhận không khớp!';
                messageElement.className = 'alert alert-danger';
                return;
            }
            
            // Kiểm tra độ dài mật khẩu
            if (password.length < 6) {
                messageElement.textContent = 'Mật khẩu phải có ít nhất 6 ký tự!';
                messageElement.className = 'alert alert-danger';
                return;
            }
            
            // Lấy danh sách người dùng hiện có
            let users = JSON.parse(localStorage.getItem('bookHavenUsers')) || [];
            
            // Kiểm tra email/username đã tồn tại chưa
            if (users.some(user => user.email === email || user.username === username)) {
                messageElement.textContent = 'Email hoặc tên đăng nhập đã được sử dụng!';
                messageElement.className = 'alert alert-danger';
                return;
            }
            
            // Thêm người dùng mới
            const newUser = {
                id: 'user_' + Date.now(),
                username: username,
                name: username, // Sử dụng username làm tên hiển thị mặc định
                email: email,
                password: password, // Lưu ý: Trong thực tế cần mã hóa mật khẩu
                registeredDate: new Date().toISOString()
            };
            
            users.push(newUser);
            localStorage.setItem('bookHavenUsers', JSON.stringify(users));
            
            // Tạo session đăng nhập tự động
            const session = {
                userId: newUser.id,
                name: newUser.name,
                email: newUser.email,
                isAuthenticated: true,
                loginTime: new Date().toISOString()
            };
            
            // Chuyển giỏ hàng từ guest sang user mới
            const guestCart = JSON.parse(localStorage.getItem('bookHavenCart')) || [];
            if (guestCart.length > 0) {
                localStorage.setItem(`bookHavenCart_${newUser.id}`, JSON.stringify(guestCart));
                localStorage.removeItem('bookHavenCart');
            }
            
            localStorage.setItem('bookHavenUserSession', JSON.stringify(session));
            
            // Hiển thị thông báo thành công
            messageElement.textContent = 'Đăng ký thành công! Đang chuyển hướng...';
            messageElement.className = 'alert alert-success';
            
            // Chuyển hướng sau khi đăng ký thành công
            setTimeout(function() {
                const redirectUrl = localStorage.getItem('bookHaven_redirect_after_login');
                if (redirectUrl) {
                    localStorage.removeItem('bookHaven_redirect_after_login');
                    window.location.href = redirectUrl;
                } else {
                    window.location.href = 'index.html';
                }
            }, 1500);
        });
    }
});