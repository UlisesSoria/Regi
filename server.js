const express = require('express');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Sanitize filename and add timestamp to make it unique
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, uniqueSuffix + '-' + sanitizedName);
    }
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Rate limiting for upload endpoint
const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 upload requests per windowMs
    message: { error: 'Too many upload requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Serve static files
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// API endpoint to upload image
app.post('/api/upload', uploadLimiter, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    
    res.json({
        message: 'File uploaded successfully',
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        path: `/uploads/${req.file.filename}`
    });
});

// API endpoint to get list of uploaded images
app.get('/api/images', async (req, res) => {
    try {
        const files = await fs.promises.readdir(uploadsDir);
        
        // Filter only image files and get their stats asynchronously
        const filePromises = files
            .filter(file => file !== '.gitkeep')
            .map(async file => {
                const filePath = path.join(uploadsDir, file);
                const stats = await fs.promises.stat(filePath);
                return {
                    filename: file,
                    path: `/uploads/${file}`,
                    size: stats.size,
                    uploadedAt: stats.mtime
                };
            });
        
        const imageFiles = await Promise.all(filePromises);
        imageFiles.sort((a, b) => b.uploadedAt - a.uploadedAt); // Sort by most recent
        
        res.json({ images: imageFiles });
    } catch (err) {
        res.status(500).json({ error: 'Failed to read uploads directory' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File size too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ error: err.message });
    }
    
    if (err) {
        return res.status(400).json({ error: err.message });
    }
    
    next();
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
