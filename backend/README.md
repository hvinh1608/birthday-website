# Birthday Website Backend

Backend API server for managing images in the birthday website.

## 🚀 Features

- **Image Upload**: Single and multiple image upload with optimization
- **Image Management**: Assign, replace, and delete images
- **Admin Panel**: Beautiful web interface for image management
- **API Endpoints**: RESTful API for frontend integration
- **Auto Optimization**: Images are automatically resized and compressed
- **Backup System**: Old images are backed up before replacement

## 📋 Requirements

- Node.js 16+ 
- npm or yarn

## 🛠️ Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Start development server:**
```bash
npm run dev
```

3. **Start production server:**
```bash
npm start
```

## 🌐 Access Points

- **Server**: http://localhost:3001
- **Admin Panel**: http://localhost:3001/admin.html
- **API Base**: http://localhost:3001/api

## 📡 API Endpoints

### Images Management

- `GET /api/images` - Get current image configuration
- `GET /api/images-list` - Get all uploaded images
- `POST /api/upload` - Upload single image
- `POST /api/upload-multiple` - Upload multiple images
- `POST /api/assign-image` - Assign image to specific type
- `DELETE /api/images/:filename` - Delete image
- `GET /api/history` - Get image history

### Image Types

- `gift1` - First gift image
- `gift2` - Second gift image  
- `gift3` - Third gift image
- `background` - Background image
- `profile` - Profile image

## 📁 Directory Structure

```
backend/
├── server.js          # Main server file
├── package.json       # Dependencies
├── public/            # Static files
│   └── admin.html     # Admin panel
├── uploads/           # Uploaded images
│   ├── images/        # Current images
│   └── backup/        # Backup images
└── config.json        # Image configuration
```

## 🔧 Configuration

The server automatically creates a `config.json` file to track:
- Current image assignments
- Upload history
- Image metadata

## 🎨 Admin Panel Features

- **Dashboard**: Overview statistics
- **Current Images**: View and manage active images
- **Quick Upload**: Direct upload to specific image types
- **Image Library**: Browse all uploaded images
- **Drag & Drop**: Easy file upload interface
- **Image Assignment**: Assign images to different purposes
- **Progress Tracking**: Real-time upload progress

## 🔌 Frontend Integration

To use with your birthday website frontend:

1. **Get current images:**
```javascript
fetch('http://localhost:3001/api/images')
  .then(response => response.json())
  .then(images => {
    // Update your frontend with new images
    console.log(images);
  });
```

2. **Image URLs:**
```javascript
const imageUrl = `http://localhost:3001/uploads/images/${filename}`;
```

## 🔒 Security Notes

- File type validation (images only)
- File size limits (10MB max)
- Sanitized filenames
- No executable file uploads

## 🚀 Production Deployment

1. **Set environment variables:**
```bash
export PORT=3001
export NODE_ENV=production
```

2. **Use process manager:**
```bash
pm2 start server.js --name birthday-backend
```

## 🔧 Troubleshooting

- Ensure port 3001 is available
- Check file permissions for uploads directory
- Verify Node.js version compatibility
- Check network connectivity for frontend integration

## 📝 License

MIT License - Feel free to use and modify!
