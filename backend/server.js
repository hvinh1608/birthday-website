const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
const sharp = require('sharp');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Create directories if they don't exist
const ensureDirectories = () => {
  const dirs = ['uploads', 'uploads/images', 'uploads/backup', 'public'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/images/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

// Universal upload middleware that accepts any field name
const universalUpload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
}).any(); // Accept any field names

// Image management data
let imageConfig = {
  currentImages: {
    gift1: null,
    gift2: null,
    gift3: null,
    gift4: null,
    gift5: null,
    profile: null,
    cover: null // ảnh bìa cho birthday-wish.html
  },
  imageHistory: []
};

// Load existing config
const loadConfig = () => {
  try {
    if (fs.existsSync('config.json')) {
      imageConfig = JSON.parse(fs.readFileSync('config.json', 'utf8'));
    }
  } catch (error) {
    console.log('Using default config');
  }
};

// Save config
const saveConfig = () => {
  fs.writeFileSync('config.json', JSON.stringify(imageConfig, null, 2));
};

// Routes

// Serve placeholder for missing images
app.get('/uploads/images/:filename', (req, res) => {
  const { filename } = req.params;
  const imagePath = path.join('uploads/images', filename);
  
  if (fs.existsSync(imagePath)) {
    res.sendFile(path.resolve(imagePath));
  } else {
    // Send placeholder SVG for missing images
    res.redirect('/placeholder.svg');
  }
});

// Get current image configuration
app.get('/api/images', (req, res) => {
  res.json(imageConfig.currentImages);
});

// Get specific image by type
app.get('/api/images/:type', (req, res) => {
  const { type } = req.params;
  const filename = imageConfig.currentImages[type];
  
  if (!filename) {
    return res.status(404).json({ error: 'Image not found' });
  }
  
  res.json({
    type,
    filename,
    url: `/uploads/images/${filename}`
  });
});

// Get frontend config - returns URLs ready for frontend use
app.get('/api/frontend-config', (req, res) => {
  const frontendConfig = {};
  
  Object.entries(imageConfig.currentImages).forEach(([type, filename]) => {
    if (filename) {
      frontendConfig[type] = `http://localhost:3001/uploads/images/${filename}`;
    } else {
      frontendConfig[type] = null;
    }
  });
  
  res.json({
    images: frontendConfig,
    lastUpdated: new Date().toISOString(),
    totalImages: Object.keys(frontendConfig).length
  });
});

// Universal upload endpoint - handles all upload scenarios
app.post('/api/upload', universalUpload, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const results = [];
    const processedFiles = [];

    for (const file of req.files) {
      try {
        // Determine image type from field name or body parameter
        const imageType = file.fieldname === 'image' ? req.body.imageType : file.fieldname;
        
        // Backup current image if exists and type is specified
        if (imageType && imageConfig.currentImages[imageType]) {
          const currentImagePath = path.join('uploads/images', imageConfig.currentImages[imageType]);
          if (fs.existsSync(currentImagePath)) {
            const backupPath = path.join('uploads/backup', Date.now() + '-' + imageConfig.currentImages[imageType]);
            fs.copyFileSync(currentImagePath, backupPath);
          }
        }

        // Optimize image with Sharp
        const optimizedPath = path.join('uploads/images', 'optimized-' + file.filename);
        await sharp(file.path)
          .resize(1200, 800, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toFile(optimizedPath);

        // Remove original and use optimized
        fs.unlinkSync(file.path);
        const finalFilename = 'optimized-' + file.filename;

        // Update config if image type is specified
        if (imageType && imageConfig.currentImages.hasOwnProperty(imageType)) {
          imageConfig.currentImages[imageType] = finalFilename;
          imageConfig.imageHistory.push({
            imageType,
            filename: finalFilename,
            uploadedAt: new Date().toISOString(),
            originalName: file.originalname,
            action: 'upload_and_assign'
          });
        } else {
          // Just upload without assigning
          imageConfig.imageHistory.push({
            filename: finalFilename,
            uploadedAt: new Date().toISOString(),
            originalName: file.originalname,
            action: 'upload_only'
          });
        }

        processedFiles.push({
          originalName: file.originalname,
          filename: finalFilename,
          imageType: imageType || 'unassigned',
          url: `/uploads/images/${finalFilename}`,
          size: file.size
        });

      } catch (error) {
        console.error('Error processing file:', error);
        results.push({
          originalName: file.originalname,
          error: error.message
        });
      }
    }

    saveConfig();

    const successCount = processedFiles.length;
    const errorCount = results.length;

    res.json({
      success: true,
      message: `Successfully processed ${successCount} file(s)${errorCount > 0 ? `, ${errorCount} error(s)` : ''}`,
      files: processedFiles,
      errors: results,
      totalProcessed: successCount,
      totalErrors: errorCount
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed: ' + error.message });
  }
});

// Update image assignment
app.post('/api/assign-image', (req, res) => {
  try {
    const { filename, imageType } = req.body;
    console.log('assign-image body:', req.body);
    if (!imageType) {
      return res.status(400).json({ error: 'imageType is required' });
    }
    // Nếu filename là null, undefined, hoặc chuỗi rỗng, bỏ gán ảnh khỏi mục này
    if (filename === null || filename === undefined || filename === "") {
      imageConfig.currentImages[imageType] = null;
      imageConfig.imageHistory.push({
        imageType,
        filename: null,
        assignedAt: new Date().toISOString()
      });
      saveConfig();
      return res.json({
        success: true,
        message: 'Image unassigned',
        imageType,
        filename: null
      });
    }
    // Check if file exists
    const imagePath = path.join('uploads/images', filename);
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ error: 'Image file not found' });
    }
    // Backup current image
    if (imageConfig.currentImages[imageType]) {
      const currentImagePath = path.join('uploads/images', imageConfig.currentImages[imageType]);
      if (fs.existsSync(currentImagePath)) {
        const backupPath = path.join('uploads/backup', Date.now() + '-' + imageConfig.currentImages[imageType]);
        fs.copyFileSync(currentImagePath, backupPath);
      }
    }
    // Update assignment
    imageConfig.currentImages[imageType] = filename;
    imageConfig.imageHistory.push({
      imageType,
      filename,
      assignedAt: new Date().toISOString()
    });
    saveConfig();
    res.json({
      success: true,
      message: 'Image assigned successfully',
      imageType,
      filename,
      url: `/uploads/images/${filename}`
    });
  } catch (error) {
    console.error('Assign error:', error);
    res.status(500).json({ error: 'Assignment failed: ' + error.message });
  }
});

// Get uploaded images list
app.get('/api/images-list', (req, res) => {
  try {
    const imagesDir = 'uploads/images';
    if (!fs.existsSync(imagesDir)) {
      return res.json({ images: [] });
    }

    const files = fs.readdirSync(imagesDir)
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
      })
      .map(file => {
        const filePath = path.join(imagesDir, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          url: `/uploads/images/${file}`,
          size: stats.size,
          uploadedAt: stats.birthtime,
          isAssigned: Object.values(imageConfig.currentImages).includes(file)
        };
      })
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    res.json({ images: files });

  } catch (error) {
    console.error('List error:', error);
    res.status(500).json({ error: 'Failed to get images list' });
  }
});

// Delete image
app.delete('/api/images/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const imagePath = path.join('uploads/images', filename);

    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Check if image is currently assigned
    const assignedType = Object.keys(imageConfig.currentImages)
      .find(type => imageConfig.currentImages[type] === filename);

    if (assignedType) {
      return res.status(400).json({ 
        error: `Cannot delete image. It's currently assigned as ${assignedType}` 
      });
    }

    // Delete file
    fs.unlinkSync(imagePath);

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Delete failed: ' + error.message });
  }
});

// Get image history
app.get('/api/history', (req, res) => {
  res.json({ history: imageConfig.imageHistory });
});

// Initialize
ensureDirectories();
loadConfig();

// Redirect root to admin panel
app.get('/', (req, res) => {
  res.redirect('/admin.html');
});

// Test sync page route
app.get('/test', (req, res) => {
  res.redirect('/test-sync.html');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Birthday Backend Server running on http://localhost:${PORT}`);
  console.log(`📁 Admin Panel: http://localhost:${PORT}/admin`);
  console.log(`📸 Upload API: http://localhost:${PORT}/api/upload`);
});

module.exports = app;
