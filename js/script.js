let captchaValue;

function generateCaptcha() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let captcha = '';
    for (let i = 0; i < 6; i++) {
        captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const captchaDisplay = document.getElementById('captchaCode');
    const captchaInput = document.getElementById('registerCaptcha');
    if (captchaDisplay) captchaDisplay.textContent = captcha;
    captchaValue = captcha;
    if (captchaInput) {
        captchaInput.classList.remove('is-invalid', 'is-valid');
        captchaInput.value = '';
        const feedback = captchaInput.closest('.input-group').querySelector('.invalid-feedback');
        if (feedback) feedback.textContent = 'Vui lòng nhập đúng mã bảo mật.';
    }
    return captcha;
}

(function() {
    'use strict';
    if (document.getElementById('captchaCode')) {
        captchaValue = generateCaptcha();
    }

    var combinedModal = document.getElementById('combinedModal');
    if (combinedModal) {
        combinedModal.addEventListener('shown.bs.modal', function(event) {
            if (document.getElementById('captchaCode')) {
                captchaValue = generateCaptcha();
            }
            resetFormValidation(document.getElementById('loginForm'));
            resetFormValidation(document.getElementById('registerForm'));
        });
    }

    function resetFormValidation(form) {
        if (!form) return;
        form.classList.remove('was-validated');
        const inputs = form.querySelectorAll('.form-control, .form-select, .form-check-input');
        inputs.forEach(input => {
            input.classList.remove('is-invalid', 'is-valid');
        });
        const generalError = form.querySelector('[id$="ErrorGeneral"]');
        if (generalError) generalError.textContent = '';
        clearSpecificError('registerEmailTakenFeedback');
        clearSpecificError('registerConfirmPasswordError');
        clearSpecificError('loginErrorGeneral');
    }

    function clearSpecificError(elementId) {
        const el = document.getElementById(elementId);
        if (el) el.textContent = '';
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            event.stopPropagation();
            clearSpecificError('loginErrorGeneral');
            let isFormValid = loginForm.checkValidity();
            if (isFormValid) {
                const email = document.getElementById('loginEmail').value;
                const password = document.getElementById('loginPassword').value;
                console.log('Login form valid (front-end). Simulating server call...');
                setTimeout(() => {
                    if (email === 'test@example.com' && password === 'password123') {
                        alert('Đăng nhập thành công!');
                    } else {
                        document.getElementById('loginEmail').classList.add('is-invalid');
                        document.getElementById('loginPassword').classList.add('is-invalid');
                        document.getElementById('loginErrorGeneral').textContent = 'Email hoặc mật khẩu không đúng.';
                        isFormValid = false;
                    }
                }, 500);
            }
            loginForm.classList.add('was-validated');
        }, false);
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(event) {
            event.preventDefault();
            event.stopPropagation();
            clearSpecificError('registerErrorGeneral');
            clearSpecificError('registerEmailTakenFeedback');
            clearSpecificError('registerConfirmPasswordError');
            document.getElementById('registerEmail').classList.remove('is-invalid');
            let isFormValid = registerForm.checkValidity();

            const password = document.getElementById('registerPassword');
            const confirmPassword = document.getElementById('registerConfirmPassword');
            const confirmPasswordErrorDiv = document.getElementById('registerConfirmPasswordError');
            confirmPassword.classList.remove('is-invalid');
            confirmPasswordErrorDiv.textContent = '';
            if (password.value !== confirmPassword.value) {
                confirmPassword.classList.add('is-invalid');
                confirmPasswordErrorDiv.textContent = 'Mật khẩu xác nhận không khớp.';
                isFormValid = false;
            }

            const captchaInput = document.getElementById('registerCaptcha');
            const captchaFeedback = captchaInput.closest('.input-group').querySelector('.invalid-feedback');
            captchaInput.classList.remove('is-invalid');
            if (!captchaInput.value || captchaInput.value.trim().toLowerCase() !== String(captchaValue).toLowerCase()) {
                captchaInput.classList.add('is-invalid');
                if (captchaFeedback) captchaFeedback.textContent = 'Mã bảo mật không đúng.';
                isFormValid = false;
                generateCaptcha();
                captchaInput.focus();
            }

            if (isFormValid) {
                const email = document.getElementById('registerEmail').value;
                console.log('Register form valid (front-end). Simulating server call...');
                setTimeout(() => {
                    if (email === 'taken@example.com') {
                        document.getElementById('registerEmail').classList.add('is-invalid');
                        document.getElementById('registerEmailTakenFeedback').textContent = 'Địa chỉ email này đã được sử dụng.';
                        document.getElementById('registerErrorGeneral').textContent = 'Đăng ký thất bại, vui lòng kiểm tra lại thông tin.';
                        isFormValid = false;
                        registerForm.classList.add('was-validated');
                    } else {
                        alert('Đăng ký thành công! (Simulation)');
                    }
                }, 500);
            }
            if (!isFormValid) {
                registerForm.classList.add('was-validated');
            }
        }, false);
    }
})();

function switchTab(event) {
    event.preventDefault();
    const loginTab = document.getElementById('login-tab-modal');
    const registerTab = document.getElementById('register-tab-modal');
    const bsLoginTab = new bootstrap.Tab(loginTab);
    const bsRegisterTab = new bootstrap.Tab(registerTab);
    if (loginTab.classList.contains('active')) {
        bsRegisterTab.show();
    } else {
        bsLoginTab.show();
    }
    resetFormValidation(document.getElementById('loginForm'));
    resetFormValidation(document.getElementById('registerForm'));
}

function resetFormValidation(form) {
    if (!form) return;
    form.classList.remove('was-validated');
    const inputs = form.querySelectorAll('.form-control, .form-select, .form-check-input');
    inputs.forEach(input => {
        input.classList.remove('is-invalid', 'is-valid');
    });
    const generalError = form.querySelector('[id$="ErrorGeneral"]');
    if (generalError) generalError.textContent = '';
    clearSpecificError('registerEmailTakenFeedback');
    clearSpecificError('registerConfirmPasswordError');
    clearSpecificError('loginErrorGeneral');
}
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const resultsContainer = document.getElementById('autocomplete-results');
    const productListContainer = document.querySelector('.product-list');
    
    // 1. Lấy tất cả sản phẩm hiện có trên trang
    const allProducts = Array.from(document.querySelectorAll('.product')).map(productEl => {
        const title = productEl.querySelector('h3').textContent.trim();
        const id = productEl.id;
        return { name: title, element: productEl, id: id };
    });

    // 2. Hàm Gợi ý Tự động
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim().toLowerCase();
        
        resultsContainer.innerHTML = '';
        if (query.length < 2) {
            resultsContainer.style.display = 'none';
            return;
        }

        const suggestions = allProducts.filter(product => 
            product.name.toLowerCase().includes(query)
        );

        if (suggestions.length > 0) {
            suggestions.forEach(product => {
                const item = document.createElement('div');
                item.className = 'autocomplete-item';
                item.textContent = product.name;
                item.dataset.productName = product.name; // Lưu tên sản phẩm
                
                resultsContainer.appendChild(item);
            });
            resultsContainer.style.display = 'block';
        } else {
            resultsContainer.style.display = 'none';
        }
    });

    // 3. Hàm xử lý khi click vào Gợi ý
    resultsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('autocomplete-item')) {
            const selectedName = e.target.dataset.productName;
            searchInput.value = selectedName; // Điền tên vào ô tìm kiếm
            resultsContainer.style.display = 'none';
            
            // Thực hiện sắp xếp sản phẩm
            moveProductToTop(selectedName);
        }
    });

    // 4. Xử lý khi người dùng nhấn nút ENTER hoặc click nút tìm kiếm (submit form)
    const searchForm = document.querySelector('.search-form');
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Ngăn chặn form submit (chuyển trang)
        const query = searchInput.value.trim();
        if (query) {
             moveProductToTop(query);
        }
    });

    // Ẩn hộp gợi ý khi click ra ngoài
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
            resultsContainer.style.display = 'none';
        }
    });

    // 5. Hàm di chuyển sản phẩm lên đầu trang
    function moveProductToTop(productName) {
        const lowerCaseName = productName.toLowerCase();
        
        let foundProduct = null;
        const remainingProducts = [];

        // Duyệt qua tất cả sản phẩm
        allProducts.forEach(product => {
            if (product.name.toLowerCase() === lowerCaseName) {
                foundProduct = product.element;
            } else {
                remainingProducts.push(product.element);
            }
        });

        if (foundProduct) {
            // Xóa hết nội dung hiện tại
            productListContainer.innerHTML = '';

            // Chèn sản phẩm tìm thấy lên đầu
            productListContainer.appendChild(foundProduct);

            // Chèn các sản phẩm còn lại
            remainingProducts.forEach(productEl => {
                productListContainer.appendChild(productEl);
            });
            
            // (Tùy chọn) Cuộn lên vị trí sản phẩm vừa tìm thấy
            foundProduct.scrollIntoView({ behavior: 'smooth', block: 'start' });

        } else {
            // Nếu không tìm thấy sản phẩm khớp chính xác, bạn có thể để nguyên hoặc thông báo
            alert(`Không tìm thấy sản phẩm "${productName}"`);
        }
    }
});
