class Slideshow {
    constructor() {
        this.currentIndex = 0;
        this.images = [];
        this.isPlaying = true;
        this.interval = null;
        this.autoPlayDelay = 5000; // 5 Sekunden
        
        this.init();
    }
    
    init() {
        this.loadImages();
        this.setupEventListeners();
        this.startAutoPlay();
        this.setupImageWatcher();
    }
    
    async loadImages() {
        try {
            const response = await fetch('api/images.php');
            if (response.ok) {
                this.images = await response.json();
                this.renderSlideshow();
                this.updateCounter();
            } else {
                console.error('Fehler beim Laden der Bilder:', response.status);
                this.showLoadingError();
            }
        } catch (error) {
            console.error('Fehler beim Laden der Bilder:', error);
            this.showLoadingError();
        }
    }
    
    // Funktion zum manuellen Neuladen der Bilder
    async refreshImages() {
        await this.loadImages();
    }
    
    renderSlideshow() {
        const slideshow = document.getElementById('slideshow');
        slideshow.innerHTML = '';
        
        if (this.images.length === 0) {
            slideshow.innerHTML = `
                <div class="loading">
                    <h2>Keine Bilder gefunden</h2>
                    <p>Laden Sie Bilder über die Upload-Seite hoch</p>
                </div>
            `;
            return;
        }
        
        this.images.forEach((image, index) => {
            const slide = document.createElement('div');
            slide.className = `slide ${index === 0 ? 'active' : ''}`;
            slide.innerHTML = `<img src="uploads/${image}" alt="Bild ${index + 1}">`;
            slideshow.appendChild(slide);
        });
        
        this.showSlide(0);
    }
    
    showSlide(index) {
        const slides = document.querySelectorAll('.slide');
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
        
        this.currentIndex = index;
        this.updateCounter();
    }
    
    nextSlide() {
        if (this.images.length === 0) return;
        
        const nextIndex = (this.currentIndex + 1) % this.images.length;
        this.showSlide(nextIndex);
    }
    
    prevSlide() {
        if (this.images.length === 0) return;
        
        const prevIndex = this.currentIndex === 0 ? this.images.length - 1 : this.currentIndex - 1;
        this.showSlide(prevIndex);
    }
    
    togglePlayPause() {
        this.isPlaying = !this.isPlaying;
        const playPauseBtn = document.getElementById('play-pause-btn');
        
        if (this.isPlaying) {
            playPauseBtn.textContent = '⏸';
            this.startAutoPlay();
        } else {
            playPauseBtn.textContent = '▶';
            this.stopAutoPlay();
        }
    }
    
    startAutoPlay() {
        if (this.interval) {
            clearInterval(this.interval);
        }
        
        if (this.isPlaying && this.images.length > 1) {
            this.interval = setInterval(() => {
                this.nextSlide();
            }, this.autoPlayDelay);
        }
    }
    
    stopAutoPlay() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error('Fehler beim Aktivieren des Vollbildmodus:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }
    
    updateCounter() {
        const currentImage = document.getElementById('current-image');
        const totalImages = document.getElementById('total-images');
        
        currentImage.textContent = this.images.length > 0 ? this.currentIndex + 1 : 0;
        totalImages.textContent = this.images.length;
    }
    
    setupEventListeners() {
        // Navigation buttons
        document.getElementById('prev-btn').addEventListener('click', () => {
            this.prevSlide();
            this.restartAutoPlay();
        });
        
        document.getElementById('next-btn').addEventListener('click', () => {
            this.nextSlide();
            this.restartAutoPlay();
        });
        
        document.getElementById('play-pause-btn').addEventListener('click', () => {
            this.togglePlayPause();
        });
        
        document.getElementById('fullscreen-btn').addEventListener('click', () => {
            this.toggleFullscreen();
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowLeft':
                    this.prevSlide();
                    this.restartAutoPlay();
                    break;
                case 'ArrowRight':
                    this.nextSlide();
                    this.restartAutoPlay();
                    break;
                case ' ':
                    e.preventDefault();
                    this.togglePlayPause();
                    break;
                case 'f':
                case 'F':
                    this.toggleFullscreen();
                    break;
            }
        });
        
        // Touch/swipe support
        let touchStartX = 0;
        let touchEndX = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        });
    }
    
    handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next slide
                this.nextSlide();
            } else {
                // Swipe right - previous slide
                this.prevSlide();
            }
            this.restartAutoPlay();
        }
    }
    
    restartAutoPlay() {
        if (this.isPlaying) {
            this.stopAutoPlay();
            this.startAutoPlay();
        }
    }
    
    setupImageWatcher() {
        // Polling für neue Bilder alle 10 Sekunden
        setInterval(async () => {
            try {
                const response = await fetch('api/images.php');
                if (response.ok) {
                    const newImages = await response.json();
                    
                    // Check if images have changed
                    if (JSON.stringify(newImages) !== JSON.stringify(this.images)) {
                        const wasEmpty = this.images.length === 0;
                        const oldLength = this.images.length;
                        this.images = newImages;
                        
                        if (wasEmpty && this.images.length > 0) {
                            // First images loaded
                            this.renderSlideshow();
                        } else if (this.images.length > oldLength) {
                            // New images added
                            this.renderSlideshow();
                            this.showSlide(this.currentIndex);
                        } else if (this.images.length !== oldLength) {
                            // Images changed (added or removed)
                            this.renderSlideshow();
                            // Keep current index if possible, otherwise reset to 0
                            if (this.currentIndex >= this.images.length) {
                                this.currentIndex = 0;
                            }
                            this.showSlide(this.currentIndex);
                        }
                        
                        this.updateCounter();
                    }
                }
            } catch (error) {
                console.error('Fehler beim Prüfen neuer Bilder:', error);
            }
        }, 10000); // Alle 10 Sekunden prüfen
    }
    
    showLoadingError() {
        const slideshow = document.getElementById('slideshow');
        slideshow.innerHTML = `
            <div class="loading">
                <h2>Fehler beim Laden der Bilder</h2>
                <p>Bitte überprüfen Sie die Verbindung</p>
            </div>
        `;
    }
}

// Initialize slideshow when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Slideshow();
}); 