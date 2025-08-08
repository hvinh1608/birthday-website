// ==================== TOAST NOTIFICATION SYSTEM ====================
function showToast(message, type = 'info', duration = 4000) {
    console.log('showToast called:', message, type);
    
    // Tạo container nếu chưa có
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
        console.log('Toast container created');
    }

    // Tạo toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Thêm nội dung
    toast.innerHTML = `
        <button class="toast-close" onclick="removeToast(this.parentElement)">&times;</button>
        <div>${message}</div>
        <div class="toast-progress"></div>
    `;

    // Thêm vào container
    container.appendChild(toast);

    // Animation hiện ra
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    // Progress bar animation
    const progress = toast.querySelector('.toast-progress');
    progress.style.width = '100%';
    
    setTimeout(() => {
        progress.style.width = '0%';
        progress.style.transition = `width ${duration}ms linear`;
    }, 200);

    // Tự động ẩn
    setTimeout(() => {
        removeToast(toast);
    }, duration);

    return toast;
}

function removeToast(toast) {
    if (toast && toast.classList) {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentElement) {
                toast.parentElement.removeChild(toast);
            }
        }, 400);
    }
}

// Success, Warning, Error shortcuts
function showSuccess(message, duration = 3000) {
    return showToast(message, 'success', duration);
}

function showWarning(message, duration = 4000) {
    return showToast(message, 'warning', duration);
}

function showError(message, duration = 4000) {
    return showToast(message, 'error', duration);
}

function showInfo(message, duration = 4000) {
    return showToast(message, 'info', duration);
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Toast system loaded!');
    
    // Test toast function - có thể gọi từ console
    window.testToast = function() {
        showInfo('🎉 Toast system đang hoạt động!');
        setTimeout(() => showSuccess('✅ CSS đã load thành công!'), 1000);
        setTimeout(() => showWarning('⚠️ Đây là warning test!'), 2000);
        setTimeout(() => showError('❌ Đây là error test!'), 3000);
    };
    
    // Chỉ hiện toast chào mừng ở trang chủ
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        setTimeout(() => {
            showInfo('🎊 Chào mừng! Nhập mật khẩu để vào!', 3000);
        }, 1000);
    }
});
