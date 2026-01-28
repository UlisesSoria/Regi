document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const imageInput = document.getElementById('imageInput');
    const uploadArea = document.getElementById('uploadArea');
    const preview = document.getElementById('preview');
    const uploadBtn = document.getElementById('uploadBtn');
    const messageDiv = document.getElementById('message');
    const gallery = document.getElementById('gallery');

    // Load existing images on page load
    loadGallery();

    // Handle file selection
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            if (validateFile(file)) {
                showPreview(file);
                uploadBtn.disabled = false;
            } else {
                imageInput.value = '';
                uploadBtn.disabled = true;
            }
        }
    });

    // Drag and drop functionality
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            if (validateFile(file)) {
                // Create a new DataTransfer to set the files
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                imageInput.files = dataTransfer.files;
                showPreview(file);
                uploadBtn.disabled = false;
            }
        }
    });

    // Handle form submission
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('image', imageInput.files[0]);
        
        uploadBtn.disabled = true;
        uploadBtn.textContent = 'Uploading...';
        hideMessage();
        
        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showMessage('Image uploaded successfully!', 'success');
                uploadForm.reset();
                preview.innerHTML = '';
                preview.classList.remove('active');
                uploadBtn.disabled = true;
                loadGallery(); // Refresh gallery
            } else {
                showMessage(data.error || 'Upload failed', 'error');
                uploadBtn.disabled = false;
            }
        } catch (error) {
            showMessage('Upload failed: ' + error.message, 'error');
            uploadBtn.disabled = false;
        } finally {
            uploadBtn.textContent = 'Upload Image';
        }
    });

    // Validate file on client side
    function validateFile(file) {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB
        
        if (!allowedTypes.includes(file.type)) {
            showMessage('Invalid file type. Please select a JPEG, PNG, GIF, or WebP image.', 'error');
            return false;
        }
        
        if (file.size > maxSize) {
            showMessage('File size too large. Maximum size is 5MB.', 'error');
            return false;
        }
        
        return true;
    }

    // Show image preview
    function showPreview(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            preview.classList.add('active');
        };
        
        reader.onerror = () => {
            showMessage('Failed to read file. Please try again.', 'error');
            preview.innerHTML = '';
            preview.classList.remove('active');
        };
        
        reader.readAsDataURL(file);
    }

    // Show message
    function showMessage(text, type) {
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`;
        
        setTimeout(() => {
            hideMessage();
        }, 5000);
    }

    // Hide message
    function hideMessage() {
        messageDiv.className = 'message';
        messageDiv.textContent = '';
    }

    // Load gallery
    async function loadGallery() {
        try {
            const response = await fetch('/api/images');
            const data = await response.json();
            
            if (data.images && data.images.length > 0) {
                displayGallery(data.images);
            } else {
                displayEmptyGallery();
            }
        } catch (error) {
            gallery.innerHTML = '<p class="error">Failed to load images</p>';
        }
    }

    // HTML escape function to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Display gallery
    function displayGallery(images) {
        gallery.innerHTML = images.map(image => {
            const date = new Date(image.uploadedAt);
            const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
            const sizeInKB = (image.size / 1024).toFixed(2);
            const escapedFilename = escapeHtml(image.filename);
            const escapedPath = escapeHtml(image.path);
            
            return `
                <div class="gallery-item">
                    <img src="${escapedPath}" alt="Uploaded image: ${escapedFilename}" loading="lazy">
                    <div class="gallery-item-info">
                        <p class="filename">${escapedFilename}</p>
                        <p>${sizeInKB} KB</p>
                        <p>${formattedDate}</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Display empty gallery message
    function displayEmptyGallery() {
        gallery.innerHTML = `
            <div class="empty-gallery">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>No images uploaded yet. Upload your first image above!</p>
            </div>
        `;
    }
});
