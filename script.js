let password = '';
const maxLength = 4;
const correctPassword = '0311';

// Browser detection and fallback
function isOpera() {
    return (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
}

// Safe toast function with Opera fallback
function safeShowError(message) {
    if (isOpera() || typeof showError !== 'function') {
        alert(message.replace(/❌ /g, '').replace(/⚠️ /g, '').replace(/✅ /g, ''));
    } else {
        showError(message);
    }
}

function safeShowWarning(message) {
    if (isOpera() || typeof showWarning !== 'function') {
        alert(message.replace(/❌ /g, '').replace(/⚠️ /g, '').replace(/✅ /g, ''));
    } else {
        showWarning(message);
    }
}

function safeShowSuccess(message) {
    if (isOpera() || typeof showSuccess !== 'function') {
        alert(message.replace(/❌ /g, '').replace(/⚠️ /g, '').replace(/✅ /g, ''));
    } else {
        showSuccess(message);
    }
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
            safeShowSuccess('🎉 Mật khẩu đúng! Đang chuyển hướng...');
            setTimeout(() => {
                window.location.href = 'birthday-wish.html';
            }, 1000);
        } else {
            safeShowError('❌ Mật khẩu không đúng! Thử lại nhé! 😊');
            clearPassword();
        }
    } else {
        safeShowWarning('⚠️ Vui lòng nhập đủ 4 số');
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
