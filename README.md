# Valentine Website 💖

Một website chúc mừng Valentine tương tác với PWA support, offline-first approach, và nhiều tính năng nâng cao.

## ✨ Tính năng

- 🎨 **Giao diện đẹp mắt**: Hiệu ứng 3D, animations mượt mà
- 📖 **Sổ lời chúc**: Chỉnh sửa và lưu trữ trên Firebase real-time
- 📸 **Gallery ảnh**: Upload và quản lý ảnh với Cloudinary
- 💬 **Love Bot**: Chat bot AI với tin nhắn tự động
- 📅 **Bộ đếm ngày**: Theo dõi số ngày bên nhau
- 💝 **Lời yêu thương**: Collection quotes ngọt ngào
- 🎵 **Nhạc nền**: Tự động phát khi mở sổ
- 🌐 **PWA Support**: Cài đặt như app native, hoạt động offline
- 🔄 **Real-time sync**: Đồng bộ dữ liệu giữa các thiết bị
- 👥 **Online counter**: Hiển thị số người đang xem

## 🛠️ Cấu trúc Technical

### Files chính:
- `index.html` - Trang chủ với keypad đăng nhập
- `valentine.html` - Trang sổ lời chúc Valentine
- `style.css` - CSS tổng hợp với animations
- `script.js` - JavaScript cho trang chủ
- `config.js` - Firebase & API credentials (không commit)
- `config.example.js` - Template cho config.js
- `valentine.js` - Main JavaScript với error handling
- `valentine-features.js` - Additional features (toast, notifications)
- `service-worker.js` - Service worker cho PWA
- `manifest.json` - PWA manifest
- `offline.html` - Offline fallback page

### Thư mục:
- `images/` - Ảnh và assets
- `audio/` - File nhạc
- `music/` - Thư viện nhạc bổ sung
- `backend/` - Server code (Node.js)

## 🚀 Setup & Installation

### 1. Clone repository
```bash
git clone https://github.com/hvinh1608/birthday-website.git
cd birthday-website
```

### 2. Cấu hình Firebase

Tạo file `config.js` từ template:
```bash
cp config.example.js config.js
```

Điền thông tin Firebase của bạn vào `config.js`:
```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT.firebasedatabase.app",
    // ... other configs
};
```

### 3. Firebase Rules

Cấu hình Firebase Realtime Database rules:
```json
{
  "rules": {
    "valentinePages": {
      ".read": true,
      ".write": true
    },
    "photos": {
      ".read": true,
      ".write": true
    },
    "presence": {
      ".read": true,
      ".write": true
    },
    "shared": {
      ".read": true,
      ".write": true
    }
  }
}
```

### 4. Cloudinary Setup

1. Tạo account tại [cloudinary.com](https://cloudinary.com)
2. Tạo upload preset: Settings → Upload → Add upload preset
3. Cập nhật `CLOUDINARY_CLOUD_NAME` trong `config.js`

### 5. Deploy

#### Netlify (Recommended):
```bash
# Push code lên GitHub
git add .
git commit -m "Initial commit"
git push origin main

# Connect với Netlify và deploy
```

#### Local Development:
```bash
# Use any static server, e.g., Python
python -m http.server 8000

# Or Node.js
npx serve
```

## 🔒 Bảo mật

- ✅ Firebase credentials đã tách ra `config.js` (không commit vào git)
- ✅ Sử dụng Firebase Rules để kiểm soát quyền truy cập
- ✅ Config file được gitignore
- ✅ Template `config.example.js` cho developers

## 📱 PWA Features

- ✅ **Offline Support**: Hoạt động khi không có mạng
- ✅ **Install to Home Screen**: Cài đặt như app native
- ✅ **Background Sync**: Đồng bộ dữ liệu khi có mạng trở lại
- ✅ **Push Notifications**: (Coming soon)
- ✅ **App Shell Model**: Load nhanh, smooth transitions

## 🎯 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (iOS 11.3+)
- Mobile browsers

## 🤝 Contributing

1. Fork the project
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add some AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

## 📝 To-Do

- [ ] Dark mode support
- [ ] Multi-language support
- [ ] More Love Bot personalities
- [ ] Video upload support
- [ ] Calendar events integration
- [ ] Push notifications for special dates

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

Created with 💖 by hvinh & GitHub Copilot

## 🙏 Acknowledgments

- Firebase for real-time database
- Cloudinary for image hosting
- Font Awesome for icons
- Google Fonts for typography

---

**⭐ Star this repo if you like it!**
