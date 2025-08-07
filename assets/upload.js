class ImageUploader {
    constructor() {
        this.uploadArea = document.getElementById('upload-area');
        this.fileInput = document.getElementById('file-input');
        this.fileList = document.getElementById('file-list');
        this.progressContainer = document.getElementById('progress-container');
        this.progressFill = document.getElementById('progress-fill');
        this.progressText = document.getElementById('progress-text');
        this.status = document.getElementById('status');
        
        this.init();
    }
    
    init() {
        this.setupDragAndDrop();
        this.setupFileInput();
        this.loadExistingFiles();
    }
    
    setupDragAndDrop() {
        const uploadContent = this.uploadArea.querySelector('.upload-content');
        
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.uploadArea.addEventListener(eventName, this.preventDefaults, false);
            document.body.addEventListener(eventName, this.preventDefaults, false);
        });
        
        // Highlight drop area when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            this.uploadArea.addEventListener(eventName, () => {
                uploadContent.classList.add('dragover');
            }, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            this.uploadArea.addEventListener(eventName, () => {
                uploadContent.classList.remove('dragover');
            }, false);
        });
        
        // Handle dropped files
        this.uploadArea.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            this.handleFiles(files);
        }, false);
        
        // Click to select files
        uploadContent.addEventListener('click', () => {
            this.fileInput.click();
        });
    }
    
    setupFileInput() {
        this.fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });
    }
    
    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    handleFiles(files) {
        const imageFiles = Array.from(files).filter(file => 
            file.type.startsWith('image/')
        );
        
        if (imageFiles.length === 0) {
            this.showStatus('Bitte wählen Sie nur Bilddateien aus.', 'error');
            return;
        }
        
        this.uploadFiles(imageFiles);
    }
    
    async uploadFiles(files) {
        this.showProgress();
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            await this.uploadFile(file, i + 1, files.length);
        }
        
        this.hideProgress();
        this.showStatus(`${files.length} Bild(er) erfolgreich hochgeladen!`, 'success');
        this.loadExistingFiles();
        
        // Clear file input
        this.fileInput.value = '';
        
        // Nach erfolgreichem Upload zur Slideshow zurückkehren
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }
    
    async uploadFile(file, current, total) {
        const formData = new FormData();
        formData.append('image', file);
        
        try {
            const response = await fetch('api/upload.php', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                const result = await response.json();
                this.addFileToList(file.name, 'success');
            } else {
                throw new Error(`Upload failed: ${response.status}`);
            }
        } catch (error) {
            console.error('Upload error:', error);
            this.addFileToList(file.name, 'error');
        }
        
        // Update progress
        const progress = (current / total) * 100;
        this.updateProgress(progress);
    }
    
    addFileToList(fileName, status) {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        const icon = status === 'success' ? '✅' : '❌';
        const statusText = status === 'success' ? 'Hochgeladen' : 'Fehler';
        
        fileItem.innerHTML = `
            <div class="file-icon">${icon}</div>
            <div class="file-info">
                <div class="file-name">${this.sanitizeFileName(fileName)}</div>
                <div class="file-size">${this.formatFileSize(fileName)}</div>
            </div>
            <div class="file-status ${status}">${statusText}</div>
        `;
        
        this.fileList.appendChild(fileItem);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (fileItem.parentNode) {
                fileItem.remove();
            }
        }, 5000);
    }
    
    sanitizeFileName(fileName) {
        // Remove potentially dangerous characters
        return fileName.replace(/[<>:"/\\|?*]/g, '');
    }
    
    formatFileSize(fileName) {
        // This is a placeholder - in a real implementation you'd get the actual file size
        return 'Bilddatei';
    }
    
    showProgress() {
        this.progressContainer.style.display = 'block';
        this.updateProgress(0);
    }
    
    hideProgress() {
        this.progressContainer.style.display = 'none';
    }
    
    updateProgress(percentage) {
        this.progressFill.style.width = `${percentage}%`;
        this.progressText.textContent = `${Math.round(percentage)}%`;
    }
    
    showStatus(message, type) {
        this.status.textContent = message;
        this.status.className = `status ${type}`;
        
        // Hide after 5 seconds
        setTimeout(() => {
            this.status.textContent = '';
            this.status.className = 'status';
        }, 5000);
    }
    
    async loadExistingFiles() {
        try {
            const response = await fetch('api/images.php');
            if (response.ok) {
                const images = await response.json();
                this.displayExistingFiles(images);
            }
        } catch (error) {
            console.error('Fehler beim Laden der vorhandenen Dateien:', error);
        }
    }
    
    displayExistingFiles(images) {
        // Clear existing list
        const existingFiles = this.fileList.querySelectorAll('.file-item.existing');
        existingFiles.forEach(item => item.remove());
        
        // Add existing files
        images.forEach(image => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item existing';
            
            fileItem.innerHTML = `
                <div class="file-icon">🖼️</div>
                <div class="file-info">
                    <div class="file-name">${this.sanitizeFileName(image)}</div>
                    <div class="file-size">Vorhanden</div>
                </div>
                <div class="file-status success">Verfügbar</div>
            `;
            
            this.fileList.appendChild(fileItem);
        });
    }
}

// Initialize uploader when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ImageUploader();
}); 