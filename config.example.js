// Firebase Configuration Template
// Copy this file to config.js and fill in your own credentials
const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID.firebasedatabase.app",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Cloudinary Cloud Name
const CLOUDINARY_CLOUD_NAME = 'your_cloudinary_cloud_name';

// Love Bot API URL
const LOVEBOT_API_URL = 'https://your-api-url.com/api/chat';

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { firebaseConfig, CLOUDINARY_CLOUD_NAME, LOVEBOT_API_URL };
}
