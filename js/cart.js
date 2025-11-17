document.addEventListener('DOMContentLoaded', () => {
    // --- KHAI BÁO KEY VÀ BIẾN TOÀN CỤC ---
    const CART_STORAGE_KEY = 'bearbear_cart'; 
    
    // Các phần tử HTML
    const cartCountElement = document.getElementById('cartCount'); 
    const cartTable = document.getElementById('cart-table'); // Thêm ID của Bảng
    const orderModal = document.getElementById('orderModal'); 
    const modalProductName = document.getElementById('modalProductName');
    const modalProductPrice = document.getElementById('modalProductPrice');
    const modalProductImage = document.getElementById('modalProductImage');
    const productQuantityInput = document.getElementById('productQuantity');
    const addToCartModalBtn = document.getElementById('addToCartModalBtn');
    const minusBtn = document.getElementById('minus-btn');
    const plusBtn = document.getElementById('plus-btn');

    let cart = []; 
    let currentProduct = {}; 

    // -------------------------------------------------------------------
    // I. LOGIC GIỎ HÀNG (LƯU/TẢI/THÊM/CẬP NHẬT)
    // -------------------------------------------------------------------

    function saveCart() {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }

    function loadCart() {
        const storedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (storedCart) {
            cart = JSON.parse(storedCart);
        }
        updateCartCount();
    }

    function updateCartCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCountElement) {
            cartCountElement.textContent = totalItems;
        }
    }

    function formatPrice(price) {
        return parseFloat(price).toLocaleString('vi-VN');
    }

    // Hàm thêm sản phẩm vào giỏ hàng (được gọi từ Modal hoặc nơi khác)
    function addToCart(id, name, price, image, quantity = 1) {
        const productId = String(id);
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ id: productId, name, price, image, quantity });
        }
        
        saveCart();
        updateCartCount();
        
        // Nếu đang ở trang cart.html, cập nhật ngay
        if (document.getElementById('cart-items')) {
            renderCartPage();
        }
    }

    // HÀM XÓA SẢN PHẨM KHỎI GIỎ HÀNG
    function removeItem(id) {
        cart = cart.filter(item => item.id !== id);
        saveCart();
        updateCartCount();
        renderCartPage(); 
    }

    // HÀM CẬP NHẬT SỐ LƯỢNG SẢN PHẨM
    function updateQuantity(id, newQuantity) {
        const item = cart.find(item => item.id === id);
        if (item) {
            // Đảm bảo số lượng luôn >= 1
            if (newQuantity < 1 || isNaN(newQuantity)) {
                newQuantity = 1;
            }
            item.quantity = newQuantity;
            saveCart();
            renderCartPage(); // Cần render lại để cập nhật Thành tiền và Tổng tiền
        }
    }

    // Hàm RENDER DỮ LIỆU TẠI TRANG GIỎ HÀNG
    function renderCartPage() {
        const tbody = document.getElementById('cart-items');
        const cartTotalEl = document.getElementById('cart-total');
        if (!tbody || !cartTotalEl) return; 

        tbody.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">Giỏ hàng của bạn đang trống.</td></tr>';
            cartTotalEl.innerText = '0 VNĐ';
            return;
        }

        cart.forEach(item => {
            const subtotal = item.price * item.quantity;
            total += subtotal;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td data-label="Sản phẩm" class="text-start">
                    <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px; margin-right: 10px;">
                    ${item.name}
                </td>
                <td data-label="Giá">${formatPrice(item.price)} VNĐ</td>
                <td data-label="Số lượng">
                    <input type="number" 
                           class="form-control quantity-input" 
                           value="${item.quantity}" 
                           min="1" 
                           data-product-id="${item.id}"
                           style="width: 70px; text-align: center;">
                </td>
                <td data-label="Thành tiền" class="subtotal-display">${formatPrice(subtotal)} VNĐ</td>
                <td data-label="Hành động">
                    <button class="btn btn-danger btn-sm remove-btn" data-product-id="${item.id}">Xóa</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        cartTotalEl.innerText = formatPrice(total) + ' VNĐ';
    }


    // -------------------------------------------------------------------
    // II. XỬ LÝ SỰ KIỆN (EVENTS)
    // -------------------------------------------------------------------
    
    // 1. XỬ LÝ SỰ KIỆN XÓA VÀ CẬP NHẬT SỐ LƯỢNG TRÊN TRANG GIỎ HÀNG
    if (cartTable) {
        cartTable.addEventListener('click', (e) => {
            const target = e.target;
            const productId = target.getAttribute('data-product-id');

            // Xử lý nút XÓA
            if (target.classList.contains('remove-btn') && productId) {
                if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?")) {
                    removeItem(productId);
                }
            }
        });

        cartTable.addEventListener('change', (e) => {
            const target = e.target;
            const productId = target.getAttribute('data-product-id');

            // Xử lý thay đổi Số lượng
            if (target.classList.contains('quantity-input') && productId) {
                let newQuantity = parseInt(target.value);
                
                if (isNaN(newQuantity) || newQuantity < 1) {
                    newQuantity = 1;
                    target.value = 1; // Đặt lại giá trị trên input
                }

                updateQuantity(productId, newQuantity);
            }
        });
    }

    // 2. Xử lý Modal chọn số lượng (khi click ĐẶT NGAY)
    if (orderModal) {
        orderModal.addEventListener('show.bs.modal', (event) => {
            const button = event.relatedTarget;
            
            const id = String(button.getAttribute('data-product-id'));
            const name = button.getAttribute('data-product-name');
            const price = parseFloat(button.getAttribute('data-product-price'));
            const image = button.getAttribute('data-product-image');

            currentProduct = { id, name, price, image }; 

            modalProductName.textContent = name;
            modalProductPrice.textContent = formatPrice(price); 
            modalProductImage.src = image;
            productQuantityInput.value = 1; 
        });

        // Tăng/Giảm số lượng trong Modal
        minusBtn.addEventListener('click', () => {
            let currentVal = parseInt(productQuantityInput.value);
            if (currentVal > 1) {
                productQuantityInput.value = currentVal - 1;
            }
        });

        plusBtn.addEventListener('click', () => {
            let currentVal = parseInt(productQuantityInput.value);
            productQuantityInput.value = currentVal + 1;
        });
        
        // Thêm vào giỏ hàng từ Modal
        addToCartModalBtn.addEventListener('click', () => {
            const quantity = parseInt(productQuantityInput.value);
            
            if (quantity > 0 && currentProduct.id) {
                addToCart(
                    currentProduct.id, 
                    currentProduct.name, 
                    currentProduct.price, 
                    currentProduct.image, 
                    quantity
                );
                
                // Ẩn modal
                const modalInstance = bootstrap.Modal.getInstance(orderModal);
                modalInstance.hide();
                
                alert(`Đã thêm ${quantity} x ${currentProduct.name} vào giỏ hàng!`);
            } else {
                alert("Vui lòng chọn số lượng hợp lệ.");
            }
        });
    }

    // 3. Tải và render khi load trang
    loadCart();

    // Nếu đây là trang giỏ hàng, render dữ liệu
    if (document.getElementById('cart-items')) {
        renderCartPage();
    }
});