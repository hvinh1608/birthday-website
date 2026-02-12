// Birthday Website Image Sync
// Automatically sync images from backend admin panel

class BirthdayImageSync {
    constructor(backendUrl = 'http://localhost:3001') {
        this.backendUrl = backendUrl;
        this.imageMap = {
            'gift1': '.gift-image-1, #gift1, [data-image="gift1"]',
            'gift2': '.gift-image-2, #gift2, [data-image="gift2"]', 
            'gift3': '.gift-image-3, #gift3, [data-image="gift3"]',
            'gift4': '.gift-image-4, #gift4, [data-image="gift4"]',
            'gift5': '.gift-image-5, #gift5, [data-image="gift5"]',
            'profile': '.profile-image, #profile, [data-image="profile"]',
            'cover': '.cover-image, #cover, [data-image="cover"]'
        };
        this.lastSync = null;
        this.syncInterval = null;
        this.lastImageState = {}; // Track last image state
    }

    // Initialize auto-sync
    init(autoSync = true, interval = 5000) {
        console.log('🎂 Birthday Image Sync initialized');
        
        // Initial sync (silent)
        this.syncImages(true);
        
        if (autoSync) {
            this.startAutoSync(interval);
        }
        
        // Đã bỏ nút sync tay theo yêu cầu
        // this.addSyncButton();
    }

    // Sync images from backend
    async syncImages(silent = false) {
        try {
            const response = await fetch(`${this.backendUrl}/api/frontend-config`);
            if (!response.ok) {
                throw new Error(`Backend not available: ${response.status}`);
            }
            
            const config = await response.json();
            
            // Check if images actually changed
            const hasChanges = this.checkForChanges(config.images);
            
            if (hasChanges || !this.lastSync) {
                console.log('📸 Syncing images:', config);
                this.updateImages(config.images);
                this.lastSync = new Date();
                
                // Only show success notification if not silent and there were actual changes
                if (!silent) {
                    this.showNotification('✅ Images updated!', 'success');
                }
            } else if (!silent) {
                // Only log for manual sync when no changes
                console.log('📸 No image changes detected');
            }
            
        } catch (error) {
            console.error('❌ Image sync failed:', error);
            // Only show error notification for manual sync
            if (!silent) {
                this.showNotification('❌ Failed to sync images from admin panel', 'error');
            }
        }
    }

    // Update images in the DOM
    updateImages(images) {
        Object.entries(images).forEach(([type, url]) => {
            if (!url) return;
            
            const selectors = this.imageMap[type];
            if (!selectors) return;
            
            const elements = document.querySelectorAll(selectors);
            elements.forEach(element => {
                if (element.tagName === 'IMG') {
                    element.src = url;
                    element.alt = `${type} image`;
                } else {
                    element.style.backgroundImage = `url(${url})`;
                }
                
                // Add fade effect
                element.style.transition = 'opacity 0.3s ease';
                element.style.opacity = '0';
                setTimeout(() => {
                    element.style.opacity = '1';
                }, 100);
            });
            
            console.log(`🖼️ Updated ${type} image:`, url);
        });
    }

    // Check if images have actually changed
    checkForChanges(newImages) {
        // If first time, always return true
        if (Object.keys(this.lastImageState).length === 0) {
            this.lastImageState = { ...newImages };
            return true;
        }

        // Check each image type for changes
        for (const [type, url] of Object.entries(newImages)) {
            if (this.lastImageState[type] !== url) {
                console.log(`🔄 Image changed for ${type}: ${this.lastImageState[type]} -> ${url}`);
                this.lastImageState = { ...newImages };
                return true;
            }
        }

        return false;
    }

    // Start auto-sync
    startAutoSync(interval = 5000) {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        
        this.syncInterval = setInterval(() => {
            this.syncImages(true); // Silent auto-sync
        }, interval);
        
        console.log(`🔄 Auto-sync started (every ${interval}ms)`);
    }

    // Stop auto-sync
    stopAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
            console.log('⏹️ Auto-sync stopped');
        }
    }

    // Add manual sync button
    // Đã bỏ hàm addSyncButton vì không cần nút sync tay nữa
    // addSyncButton() {}

    // Show notification
    showNotification(message, type = 'info') {
        // Try to use existing toast system first
        if (window.showToast) {
            window.showToast(message, type);
            return;
        }
        
        if (window.safeShowSuccess && type === 'success') {
            window.safeShowSuccess(message);
            return;
        }
        
        if (window.safeShowError && type === 'error') {
            window.safeShowError(message);
            return;
        }
        
        // Fallback notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 70px;
            right: 20px;
            z-index: 10001;
            padding: 15px 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            border-radius: 8px;
            font-weight: bold;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Get sync status
    getStatus() {
        return {
            lastSync: this.lastSync,
            isAutoSyncing: !!this.syncInterval,
            backendUrl: this.backendUrl
        };
    }
}

// Auto-initialize when script loads
window.BirthdayImageSync = BirthdayImageSync;

// Auto-start if not in admin panel
if (!window.location.href.includes('admin')) {
    window.addEventListener('DOMContentLoaded', () => {
        window.birthdaySync = new BirthdayImageSync();
        window.birthdaySync.init(true, 3000); // Auto-sync every 3 seconds
    });
}
