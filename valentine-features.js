/**
 * Valentine Website - Additional Features
 * Gallery, Days Counter, Quotes, Love Bot
 */

// ==================== TOAST NOTIFICATION SYSTEM ====================
function showToast(message, type = 'info', duration = 4000) {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    toast.innerHTML = `
        <button class="toast-close" onclick="removeToast(this.parentElement)">&times;</button>
        <div>${message}</div>
        <div class="toast-progress"></div>
    `;

    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);

    const progress = toast.querySelector('.toast-progress');
    progress.style.width = '100%';
    setTimeout(() => {
        progress.style.width = '0%';
        progress.style.transition = `width ${duration}ms linear`;
    }, 200);

    setTimeout(() => removeToast(toast), duration);
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

function showNotification(message) {
    return showInfo(message);
}

// Export functions to window for backwards compatibility
window.showToast = showToast;
window.removeToast = removeToast;
window.showSuccess = showSuccess;
window.showWarning = showWarning;
window.showError = showError;
window.showInfo = showInfo;
window.showNotification = showNotification;
