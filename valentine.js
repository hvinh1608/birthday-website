/**
 * Valentine Website - Main JavaScript
 * With improved error handling, loading states, and offline support
 */

// ==================== INITIALIZATION ====================
let database, pagesRef, photosRef, presenceRef, connectedRef;
let currentPage = 1;
let totalPages = 4;
let originalContent = {};
let currentQuoteIndex = 0;
let loveBotActive = false;
let loveBotMinimized = false;
let loveBotLastSendTime = {};

// Configuration
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = window.innerWidth <= 768;
const confettiCount = prefersReducedMotion ? 0 : (isMobile ? 80 : 150);
const heartIntervalMs = isMobile ? 1200 : 800;
const heartDurationMs = isMobile ? 12000 : 20000;
const DAYS_COUNTER_KEY = 'valentineDaysStartDate';
const BLUR_PLACEHOLDER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10'><rect width='10' height='10' fill='%23f5f5f5'/></svg>";
const LOVEBOT_SEND_TIMES = [8, 12, 21]; // 8am, 12pm, 9pm

// Love Quotes Data
const loveQuotes = [
    "Yêu em là cách tốt nhất để bắt đầu mỗi ngày.",
    "Em là lí do tôi tin vào tình yêu.",
    "Mỗi khoảnh khắc bên em đều có giá trị vô cùng.",
    "Em là nơi tôi muốn ở đến cuối cùng.",
    "Tôi yêu em nhiều hơn cách tôi yêu chính mình.",
    "Nơi em ở, nơi đó là quê hương của tôi.",
    "Nụ cười của em là ánh nắng của cuộc sống tôi.",
    "Anh muốn dành cả đời để khiến em hạnh phúc.",
    "Em là thiên thần mà tôi không xứng đáng nhưng biết ơn vì có được.",
    "Tình yêu của anh dành cho em không có giới hạn.",
    "Em là lý do tôi tin vào điều không thể.",
    "Một ngày không thấy em là một ngày thiếu vắng.",
    "Yêu em là quyết định dễ dàng nhất của tôi.",
    "Em làm cho mọi thứ có ý nghĩa, ngay cả những điều bình thường.",
    "Trái tim tôi chỉ biết nhịp đập khi em ở bên.",
    "Em là bài hát yêu thích mà tôi muốn nghe mãi mãi.",
    "Tôi không cần cả thế giới, nếu tôi có em.",
    "Cảm ơn em vì luôn ở đó khi anh cần.",
    "Em là hy vọng, em là mơ mộng, em là tương lai của tôi.",
    "Yêu em là việc tốt nhất tôi từng làm.",
    "Em là người mà anh muốn để buổi sáng đầu tiên và buổi tối cuối cùng.",
    "Tình yêu của anh là vĩnh viễn, không bao giờ thay đổi.",
    "Mỗi lần nhìn em, anh đều yêu em hơn.",
    "Em là chứng minh rằng những điều tốt nhất là không thể lên kế hoạch.",
    "Với em, anh tìm thấy rất nhiều lý do để cười.",
    "Em là con tim của anh bên ngoài cơ thể.",
    "Bình yên là khi anh nằm cạnh em.",
    "Em làm cho ngày tệ nhất của anh trở thành tốt.",
    "Anh yêu: nụ cười của em, tiếng cười của em, cách em nhìn anh.",
    "Em là điều duy nhất anh cần để hạnh phúc."
];

const loveBotGreetings = [
    "Em đang làm gì vậy? 😊",
    "Bạn vui không? 💖",
    "Em có khỏe không? 🥰",
    "Nhớ em lắm! 💕",
    "Chúc em một ngày tốt lành! ☀️",
    "Em đang bận rồi à? 🤔",
    "Anh/chị yêu em lắm lắm! 💘",
    "Cảm ơn em vì luôn ở bên cạnh! 🌹",
    "Em muốn ăn gì không? 🍰",
    "Anh/chị chỉ muốn em hạnh phúc! ✨",
    "Em đã uống nước chưa? 💧",
    "Cái mũi nước mắt anh/chị chỉ vì yêu em! 😭💕"
];

// ==================== FIREBASE INITIALIZATION WITH ERROR HANDLING ====================
async function initializeFirebase() {
    try {
        if (!window.firebaseConfig) {
            throw new Error('Firebase configuration not found');
        }

        showLoadingState('Đang kết nối...');

        firebase.initializeApp(window.firebaseConfig);
        database = firebase.database();
        pagesRef = database.ref('valentinePages');
        photosRef = database.ref('photos');
        presenceRef = database.ref('presence');
        connectedRef = database.ref('.info/connected');

        // Monitor connection status with better error handling
        connectedRef.on('value', (snap) => {
            if (snap.val() === true) {
                console.log('🔗 Firebase đã kết nối!');
                hideLoadingState();
                initializePresence();
            } else {
                console.log('📡 Đang kết nối Firebase...');
                showLoadingState('Đang kết nối lại...');
            }
        }, (error) => {
            console.error('❌ Firebase connection error:', error);
            showError('Lỗi kết nối Firebase. Vui lòng thử lại sau.');
            hideLoadingState();
        });

        return true;
    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        showError('Không thể khởi tạo Firebase: ' + error.message);
        hideLoadingState();
        return false;
    }
}

// ==================== PRESENCE TRACKING ====================
function initializePresence() {
    try {
        const myConnectionRef = presenceRef.push();
        
        connectedRef.on('value', (snap) => {
            if (snap.val() === true) {
                myConnectionRef.set({
                    online: true,
                    timestamp: firebase.database.ServerValue.TIMESTAMP
                }).catch(error => console.error('Presence update error:', error));
                
                myConnectionRef.onDisconnect().remove();
            }
        });
        
        // Count online users
        presenceRef.on('value', (snapshot) => {
            const onlineCount = snapshot.numChildren();
            const countElement = document.getElementById('onlineCount');
            if (countElement) {
                countElement.textContent = onlineCount;
            }
        });
    } catch (error) {
        console.error('Presence tracking error:', error);
    }
}

// ==================== LOADING STATES ====================
function showLoadingState(message = 'Đang tải...') {
    let loader = document.getElementById('globalLoader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'globalLoader';
        loader.className = 'global-loader';
        loader.innerHTML = `
            <div class="loader-content">
                <div class="loader-spinner"></div>
                <div class="loader-text">${message}</div>
            </div>
        `;
        document.body.appendChild(loader);
    } else {
        loader.querySelector('.loader-text').textContent = message;
    }
    loader.classList.add('show');
}

function hideLoadingState() {
    const loader = document.getElementById('globalLoader');
    if (loader) {
        loader.classList.remove('show');
    }
}

function updateLoadingMessage(message) {
    const loader = document.getElementById('globalLoader');
    if (loader) {
        loader.querySelector('.loader-text').textContent = message;
    }
}

// ==================== PAGE NAVIGATION ====================
function showPage(pageNum) {
    for (let i = 1; i <= totalPages; i++) {
        const page = document.getElementById(`page${i}`);
        if (page) page.style.display = 'none';
    }
    
    const currentPageElement = document.getElementById(`page${pageNum}`);
    if (currentPageElement) {
        currentPageElement.style.display = 'flex';
    }
    
    currentPage = pageNum;
}

function nextPage() {
    if (currentPage >= totalPages) {
        createNewPage();
    }
    if (currentPage < totalPages) {
        playPageFlipSound();
        showPageWithAnimation(currentPage + 1);
    }
}

function prevPage() {
    if (currentPage > 1) {
        playPageFlipSound();
        showPageWithAnimation(currentPage - 1);
    }
}

function showPageWithAnimation(pageNum) {
    const currentPageElement = document.getElementById(`page${currentPage}`);
    const nextPageElement = document.getElementById(`page${pageNum}`);
    
    if (pageNum === currentPage) return;
    
    if (currentPageElement) {
        currentPageElement.classList.add('flipping-out');
        setTimeout(() => {
            currentPageElement.style.display = 'none';
            currentPageElement.classList.remove('flipping-out');
        }, 600);
    }
    
    if (nextPageElement) {
        setTimeout(() => {
            nextPageElement.style.display = 'flex';
            nextPageElement.classList.add('flipping-in');
            nextPageElement.classList.add('page-shimmer');
            
            setTimeout(() => {
                nextPageElement.classList.add('active');
            }, 50);
            
            setTimeout(() => {
                nextPageElement.classList.remove('flipping-in', 'page-shimmer', 'active');
            }, 600);
        }, 300);
    }
    
    currentPage = pageNum;
}

// ==================== AUDIO FUNCTIONS ====================
function playPageFlipSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    } catch (e) {
        // Silent fail for audio
    }
}

function playTypingSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(800 + Math.random() * 200, audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.02, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        // Silent fail
    }
}

// ==================== CONTENT EDITING ====================
function toggleEdit(pageNum) {
    const content = document.getElementById(`content${pageNum}`);
    const controls = document.getElementById(`controls${pageNum}`);
    const editBtn = document.querySelector(`#page${pageNum} .edit-btn`);
    
    if (content && content.contentEditable === 'false') {
        originalContent[pageNum] = content.innerHTML;
        content.contentEditable = 'true';
        content.classList.add('editing');
        content.focus();
        if (controls) controls.style.display = 'flex';
        if (editBtn) editBtn.style.display = 'none';
        
        content.addEventListener('input', playTypingSound);
    }
}

async function saveContent(pageNum) {
    const content = document.getElementById(`content${pageNum}`);
    const controls = document.getElementById(`controls${pageNum}`);
    const editBtn = document.querySelector(`#page${pageNum} .edit-btn`);
    
    if (!content) return;

    const dataToSave = {
        content: content.innerHTML,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };
    
    try {
        showLoadingState('Đang lưu...');
        
        await pagesRef.child(`page${pageNum}`).set(dataToSave);
        
        console.log(`✅ Đã lưu trang ${pageNum}`);
        
        content.contentEditable = 'false';
        content.classList.remove('editing');
        if (controls) controls.style.display = 'none';
        if (editBtn) editBtn.style.display = 'inline-block';
        
        content.removeEventListener('input', playTypingSound);
        
        showSuccess('💾 Đã lưu thành công!');
    } catch (error) {
        console.error('❌ Lỗi khi lưu:', error);
        showError('❌ Lỗi khi lưu: ' + error.message);
    } finally {
        hideLoadingState();
    }
}

function cancelEdit(pageNum) {
    const content = document.getElementById(`content${pageNum}`);
    const controls = document.getElementById(`controls${pageNum}`);
    const editBtn = document.querySelector(`#page${pageNum} .edit-btn`);
    
    if (content) {
        content.innerHTML = originalContent[pageNum];
        content.contentEditable = 'false';
        content.classList.remove('editing');
        if (controls) controls.style.display = 'none';
        if (editBtn) editBtn.style.display = 'inline-block';
        
        content.removeEventListener('input', playTypingSound);
    }
}

// ==================== FIREBASE DATA LOADING ====================
function loadSavedContent() {
    if (!pagesRef) return;

    pagesRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            Object.keys(data).forEach(key => {
                const match = key.match(/page(\d+)/);
                if (match) {
                    const pageNum = parseInt(match[1]);
                    const pageData = data[key];
                    
                    let pageElement = document.getElementById(`page${pageNum}`);
                    if (!pageElement && pageNum > 4) {
                        createPageWithNumber(pageNum);
                        pageElement = document.getElementById(`page${pageNum}`);
                    }
                    
                    if (pageData && pageData.content) {
                        const content = document.getElementById(`content${pageNum}`);
                        if (content && content.contentEditable === 'false') {
                            content.innerHTML = pageData.content;
                        }
                    }
                    
                    if (pageNum > totalPages) {
                        totalPages = pageNum;
                    }
                }
            });
            console.log(`✅ Đã load ${Object.keys(data).length} trang`);
        }
    }, (error) => {
        console.error('Lỗi khi load từ Firebase:', error);
        showError('Không thể tải dữ liệu. Vui lòng thử lại.');
    });
}

// [Continue in next part due to length...]
