let password = '';
const maxLength = 4;
const correctPassword = '0311';

// ==================== TOAST NOTIFICATION SYSTEM ====================
function showToast(message, type = 'info', duration = 4000) {
    // Tạo container nếu chưa có
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
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
    toast.classList.remove('show');
    setTimeout(() => {
        if (toast.parentElement) {
            toast.parentElement.removeChild(toast);
        }
    }, 400);
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

function addDigit(digit) {
    if (password.length < maxLength) {
        password += digit;
        updateDisplay();
    }
}

function clearPassword() {
    password = '';
    updateDisplay();
}

function updateDisplay() {
    const display = document.getElementById('passwordDisplay');
    let displayText = '';
    
    for (let i = 0; i < maxLength; i++) {
        if (i < password.length) {
            displayText += password[i] + ' ';
        } else {
            displayText += '_ ';
        }
    }
    
    display.textContent = displayText.trim();
}

function submitPassword() {
    if (password.length === maxLength) {
        if (password === correctPassword) {
            showSuccess('🎉 Mật khẩu đúng! Đang chuyển hướng...', 2000);
            // Delay chuyển hướng để hiện toast
            setTimeout(() => {
                window.location.href = 'birthday-wish.html';
            }, 1000);
        } else {
            showError('❌ Mật khẩu không đúng! Thử lại nhé! 😊');
            clearPassword();
        }
    } else {
        showWarning('⚠️ Vui lòng nhập đủ 4 số');
    }
}

function createConfetti() {
    const canvas = document.getElementById('confetti');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const confettiPieces = [];
    const colors = ['#ff9a9e', '#fecfef', '#fda085', '#ffb3ba', '#ff6b9d', '#ffc1cc'];

    for (let i = 0; i < 150; i++) {
        confettiPieces.push({
            x: Math.random() * canvas.width,
            y: -10,
            width: Math.random() * 10 + 5,
            height: Math.random() * 10 + 5,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: Math.random() * 3 + 2,
            rotation: Math.random() * 360
        });
    }

    function animateConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        confettiPieces.forEach((piece, index) => {
            piece.y += piece.speed;
            piece.rotation += 2;

            ctx.save();
            ctx.translate(piece.x + piece.width / 2, piece.y + piece.height / 2);
            ctx.rotate(piece.rotation * Math.PI / 180);
            ctx.fillStyle = piece.color;
            ctx.fillRect(-piece.width / 2, -piece.height / 2, piece.width, piece.height);
            ctx.restore();

            if (piece.y > canvas.height) {
                confettiPieces.splice(index, 1);
            }
        });

        if (confettiPieces.length > 0) {
            requestAnimationFrame(animateConfetti);
        }
    }

    animateConfetti();
}

function createHearts() {
    const heartsContainer = document.getElementById('heartsContainer');
    
    function addHeart() {
        const heart = document.createElement('div');
        heart.className = 'heart';
        heart.innerHTML = '💖';
        
        // Vị trí ngẫu nhiên trên trục X
        heart.style.left = Math.random() * 100 + '%';
        
        // Thời gian animation ngẫu nhiên
        heart.style.animationDuration = (Math.random() * 3 + 5) + 's';
        
        // Độ trễ ngẫu nhiên
        heart.style.animationDelay = Math.random() * 2 + 's';
        
        heartsContainer.appendChild(heart);
        
        // Xóa trái tim sau khi animation hoàn thành
        setTimeout(() => {
            if (heart.parentNode) {
                heart.parentNode.removeChild(heart);
            }
        }, 8000);
    }
    
    // Tạo trái tim liên tục
    const heartInterval = setInterval(addHeart, 800);
    
    // Dừng tạo trái tim sau 15 giây
    setTimeout(() => {
        clearInterval(heartInterval);
    }, 15000);
}

// Khởi tạo khi trang web được tải
document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo display
    updateDisplay();
    
    // Bắt đầu hiệu ứng trái tim ngay khi trang load
    createHearts();

    // Xử lý phím bấm từ bàn phím
    document.addEventListener('keydown', function(event) {
        if (event.key >= '0' && event.key <= '9') {
            addDigit(event.key);
        } else if (event.key === 'Backspace' || event.key === 'Delete') {
            if (password.length > 0) {
                password = password.slice(0, -1);
                updateDisplay();
            }
        } else if (event.key === 'Enter') {
            submitPassword();
        } else if (event.key === 'Escape') {
            clearPassword();
        }
    });
});
