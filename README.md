# Regi - Image Upload Repository

A simple and elegant web application for uploading and managing images.

## Features

- 📤 **Easy Image Upload**: Drag and drop or click to upload images
- 🖼️ **Image Gallery**: View all uploaded images in a beautiful grid layout
- 🎨 **Modern UI**: Clean, responsive design that works on all devices
- ✅ **File Validation**: Only accepts image files (JPEG, PNG, GIF, WebP)
- 📏 **Size Limits**: Maximum file size of 5MB per image
- 🔒 **Secure**: Filename sanitization and file type validation

## Installation

1. Clone the repository:
```bash
git clone https://github.com/UlisesSoria/Regi.git
cd Regi
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## Usage

1. **Upload an Image**:
   - Click the upload area or drag and drop an image file
   - Preview your image before uploading
   - Click "Upload Image" button to upload

2. **View Gallery**:
   - All uploaded images are displayed in the gallery
   - Images show filename, size, and upload timestamp
   - Images are sorted by most recent first

## API Endpoints

### POST /api/upload
Upload a single image file.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: Form data with `image` field containing the file

**Response:**
```json
{
  "message": "File uploaded successfully",
  "filename": "1234567890-image.jpg",
  "originalName": "image.jpg",
  "size": 123456,
  "path": "/uploads/1234567890-image.jpg"
}
```

### GET /api/images
Get a list of all uploaded images.

**Response:**
```json
{
  "images": [
    {
      "filename": "1234567890-image.jpg",
      "path": "/uploads/1234567890-image.jpg",
      "size": 123456,
      "uploadedAt": "2026-01-28T15:00:00.000Z"
    }
  ]
}
```

## Technology Stack

- **Backend**: Node.js with Express
- **File Upload**: Multer middleware
- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Styling**: Modern CSS with gradient backgrounds

## File Structure

```
Regi/
├── public/
│   ├── index.html      # Main HTML page
│   ├── style.css       # Styling
│   └── script.js       # Client-side JavaScript
├── uploads/            # Uploaded images directory
├── server.js           # Express server
├── package.json        # Node.js dependencies
└── README.md          # Documentation
```

## Security Features

- File type validation (only images allowed)
- File size limits (5MB maximum)
- Filename sanitization
- MIME type checking

## License

ISC