// Global variables
let particleSystem;
let testimonialsCarousel;
let processedImages = 47832;
let freeUsesRemaining = 3;
let backgroundRemovalApp;

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeParticleSystem();
    initializeCounters();
    initializeBackgroundRemovalApp();
    initializeUploadZone();
    initializeTestimonials();
    initializeCountdownTimer();
    initializeScrollAnimations();
    initializeComparisonSlider();
    showUsageWarning();
    initializeAPIStatus();
});

// Particle system for hero background
function initializeParticleSystem() {
    const container = document.getElementById('particle-container');
    if (!container) return;
    
    // p5.js sketch for particles
    new p5(function(p) {
        let particles = [];
        let numParticles = 50;
        
        p.setup = function() {
            const canvas = p.createCanvas(container.offsetWidth, container.offsetHeight);
            canvas.parent(container);
            
            // Create particles
            for (let i = 0; i < numParticles; i++) {
                particles.push({
                    x: p.random(p.width),
                    y: p.random(p.height),
                    vx: p.random(-0.5, 0.5),
                    vy: p.random(-0.5, 0.5),
                    size: p.random(2, 6),
                    opacity: p.random(0.1, 0.3)
                });
            }
        };
        
        p.draw = function() {
            p.clear();
            
            // Update and draw particles
            particles.forEach(particle => {
                // Update position
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                // Wrap around edges
                if (particle.x < 0) particle.x = p.width;
                if (particle.x > p.width) particle.x = 0;
                if (particle.y < 0) particle.y = p.height;
                if (particle.y > p.height) particle.y = 0;
                
                // Draw particle
                p.fill(79, 209, 199, particle.opacity * 255);
                p.noStroke();
                p.ellipse(particle.x, particle.y, particle.size);
            });
            
            // Draw connections
            particles.forEach((particle, i) => {
                particles.slice(i + 1).forEach(other => {
                    const distance = p.dist(particle.x, particle.y, other.x, other.y);
                    if (distance < 100) {
                        p.stroke(79, 209, 199, (1 - distance / 100) * 50);
                        p.strokeWeight(1);
                        p.line(particle.x, particle.y, other.x, other.y);
                    }
                });
            });
        };
        
        p.windowResized = function() {
            p.resizeCanvas(container.offsetWidth, container.offsetHeight);
        };
    });
}

// Animated counters
function initializeCounters() {
    const counter = document.getElementById('processed-counter');
    if (!counter) return;
    
    // Animate processed images counter
    anime({
        targets: { count: 0 },
        count: processedImages,
        duration: 2000,
        easing: 'easeOutExpo',
        update: function(anim) {
            counter.textContent = Math.floor(anim.animatables[0].target.count).toLocaleString();
        }
    });
    
    // Update counter periodically
    setInterval(() => {
        processedImages += Math.floor(Math.random() * 5) + 1;
        anime({
            targets: { count: parseInt(counter.textContent.replace(/,/g, '')) },
            count: processedImages,
            duration: 1000,
            easing: 'easeOutQuad',
            update: function(anim) {
                counter.textContent = Math.floor(anim.animatables[0].target.count).toLocaleString();
            }
        });
    }, 5000);
}

// Upload zone functionality
function initializeUploadZone() {
    const uploadZone = document.getElementById('upload-zone');
    const fileInput = document.getElementById('file-input');
    const processingArea = document.getElementById('processing-area');
    const resultsArea = document.getElementById('results-area');
    
    if (!uploadZone || !fileInput) return;
    
    // Click to upload
    uploadZone.addEventListener('click', () => {
        fileInput.click();
    });
    
    // Drag and drop
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });
    
    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });
    
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    });
    
    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });
    
    // Handle file upload and processing
    function handleFileUpload(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.');
            return;
        }
        
        if (file.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB.');
            return;
        }
        
        // Use new API-based handler if available
        if (typeof handleFileUploadWithAPI !== 'undefined') {
            handleFileUploadWithAPI(file);
            return;
        }
        
        // Fallback to original simulation
        // Show processing
        uploadZone.style.display = 'none';
        processingArea.classList.remove('hidden');
        
        // Simulate processing with progress
        let progress = 0;
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-text');
        
        const processingInterval = setInterval(() => {
            progress += Math.random() * 15 + 5;
            if (progress > 100) progress = 100;
            
            progressBar.style.width = progress + '%';
            progressText.textContent = Math.floor(progress) + '%';
            
            if (progress >= 100) {
                clearInterval(processingInterval);
                setTimeout(() => {
                    processingArea.classList.add('hidden');
                    resultsArea.classList.remove('hidden');
                    freeUsesRemaining--;
                    showUsageWarning();
                }, 500);
            }
        }, 200);
        
        // Update processed images counter
        processedImages++;
    }
}

// Initialize testimonials carousel
function initializeTestimonials() {
    const carousel = document.getElementById('testimonials-carousel');
    if (!carousel) return;
    
    testimonialsCarousel = new Splide('#testimonials-carousel', {
        type: 'loop',
        autoplay: true,
        interval: 5000,
        pauseOnHover: true,
        arrows: false,
        pagination: true,
        gap: '2rem'
    });
    
    testimonialsCarousel.mount();
}

// Countdown timer for limited offer
function initializeCountdownTimer() {
    const timer = document.getElementById('countdown-timer');
    if (!timer) return;
    
    let hours = 23;
    let minutes = 59;
    let seconds = 45;
    
    setInterval(() => {
        seconds--;
        if (seconds < 0) {
            seconds = 59;
            minutes--;
            if (minutes < 0) {
                minutes = 59;
                hours--;
                if (hours < 0) {
                    hours = 23;
                    minutes = 59;
                    seconds = 59;
                }
            }
        }
        
        timer.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// Scroll animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for scroll animations
    document.querySelectorAll('.feature-card, .testimonial-card, .feature-teaser').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Comparison slider functionality
function initializeComparisonSlider() {
    const slider = document.querySelector('.slider-handle');
    const afterImage = document.querySelector('.after-image');
    
    if (!slider || !afterImage) return;
    
    let isDragging = false;
    
    slider.addEventListener('mousedown', (e) => {
        isDragging = true;
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const container = document.querySelector('.comparison-slider');
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
        
        slider.style.left = percentage + '%';
        afterImage.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
    
    // Touch events for mobile
    slider.addEventListener('touchstart', (e) => {
        isDragging = true;
        e.preventDefault();
    });
    
    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        
        const container = document.querySelector('.comparison-slider');
        const rect = container.getBoundingClientRect();
        const x = e.touches[0].clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
        
        slider.style.left = percentage + '%';
        afterImage.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
    });
    
    document.addEventListener('touchend', () => {
        isDragging = false;
    });
}

// Show usage warning
function showUsageWarning() {
    const warning = document.getElementById('usage-warning');
    if (!warning) return;
    
    if (freeUsesRemaining <= 3) {
        warning.classList.remove('hidden');
        const text = warning.querySelector('strong');
        if (text) {
            text.textContent = `${freeUsesRemaining} free images remaining today`;
        }
        
        if (freeUsesRemaining === 0) {
            // Disable free download button
            const freeButton = document.getElementById('download-free');
            if (freeButton) {
                freeButton.disabled = true;
                freeButton.textContent = 'Free Limit Reached';
                freeButton.classList.add('opacity-50', 'cursor-not-allowed');
            }
        }
    }
}

// Download functionality
document.addEventListener('DOMContentLoaded', function() {
    const downloadFree = document.getElementById('download-free');
    const upgradePremium = document.getElementById('upgrade-premium');
    
    if (downloadFree) {
        downloadFree.addEventListener('click', function() {
            if (freeUsesRemaining > 0) {
                // Simulate download with watermark
                const link = document.createElement('a');
                link.href = 'resources/demo-after.jpg';
                link.download = 'clearbg-result-watermarked.jpg';
                link.click();
                
                // Show success message
                showNotification('Free image downloaded with watermark!', 'success');
            } else {
                showNotification('Free limit reached. Please upgrade to premium.', 'warning');
            }
        });
    }
    
    if (upgradePremium) {
        upgradePremium.addEventListener('click', function() {
            // Track conversion event
            console.log('Premium upgrade clicked');
            window.location.href = 'pricing.html';
        });
    }
});

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-20 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transform translate-x-full transition-transform duration-300 ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'warning' ? 'bg-yellow-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        'bg-blue-500 text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
        notification.style.transform = 'translateX(full)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Mobile menu toggle (if needed)
function toggleMobileMenu() {
    const menu = document.querySelector('.mobile-menu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

// Performance optimization - lazy load images
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading
document.addEventListener('DOMContentLoaded', lazyLoadImages);

// Error handling for missing elements
function safeQuerySelector(selector, callback) {
    const element = document.querySelector(selector);
    if (element && typeof callback === 'function') {
        callback(element);
    }
}

// Analytics tracking (placeholder)
function trackEvent(eventName, properties = {}) {
    console.log('Analytics Event:', eventName, properties);
    // Integrate with your analytics service here
}

// Initialize background removal app
function initializeBackgroundRemovalApp() {
    if (typeof BackgroundRemovalApp !== 'undefined') {
        backgroundRemovalApp = new BackgroundRemovalApp();
        console.log('Background removal app initialized');
    } else {
        console.warn('Background removal API not available');
    }
}

// Initialize API status display
function initializeAPIStatus() {
    if (!backgroundRemovalApp) return;
    
    const status = backgroundRemovalApp.getAPIStatus();
    console.log('API Status:', status);
    
    // Update UI with API status if needed
    // This can be expanded to show API usage in the UI
}

// Enhanced file upload handler with real API integration
async function handleFileUploadWithAPI(file) {
    if (!backgroundRemovalApp) {
        // Fallback to original simulation
        handleFileUpload(file);
        return;
    }
    
    if (!file.type.startsWith('image/')) {
        showNotification('Please select an image file.', 'error');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
        showNotification('File size must be less than 10MB.', 'error');
        return;
    }
    
    // Show processing
    const uploadZone = document.getElementById('upload-zone');
    const processingArea = document.getElementById('processing-area');
    const resultsArea = document.getElementById('results-area');
    
    uploadZone.style.display = 'none';
    processingArea.classList.remove('hidden');
    
    try {
        // Process with progress tracking
        const result = await backgroundRemovalApp.processImageWithProgress(file, (progress) => {
            const progressBar = document.getElementById('progress-bar');
            const progressText = document.getElementById('progress-text');
            
            if (progressBar) progressBar.style.width = progress + '%';
            if (progressText) progressText.textContent = progress + '%';
        });
        
        if (result.success) {
            // Show results
            processingArea.classList.add('hidden');
            resultsArea.classList.remove('hidden');
            
            // Update result image
            const afterImage = document.getElementById('after-image');
            if (afterImage && result.result) {
                afterImage.src = result.result;
            }
            
            // Update API info
            const apiInfo = document.getElementById('api-info');
            if (apiInfo) {
                const isLiveAPI = result.isLive !== false;
                apiInfo.textContent = `Processed with ${result.apiName}`;
                apiInfo.className = `text-sm text-${isLiveAPI ? 'green' : 'yellow'}-600`;
            }
            
            freeUsesRemaining--;
            showUsageWarning();
            
            showNotification('Background removed successfully!', 'success');
        } else {
            throw new Error(result.error || 'Processing failed');
        }
        
    } catch (error) {
        console.error('Processing failed:', error);
        processingArea.classList.add('hidden');
        uploadZone.style.display = 'block';
        showNotification('Processing failed: ' + error.message, 'error');
    }
}

// API configuration interface
function showAPIConfiguration() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 class="text-lg font-semibold text-primary mb-4">API Configuration</h3>
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Remove.bg API Key</label>
                    <input type="text" id="removebg-key" class="w-full px-3 py-2 border border-gray-300 rounded-md" 
                           placeholder="Enter your Remove.bg API key">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">PhotoRoom API Key</label>
                    <input type="text" id="photoroom-key" class="w-full px-3 py-2 border border-gray-300 rounded-md" 
                           placeholder="Enter your PhotoRoom API key">
                </div>
                <div class="flex space-x-3">
                    <button onclick="saveAPIKeys()" class="bg-secondary text-white px-4 py-2 rounded-md">Save</button>
                    <button onclick="closeAPIModal()" class="bg-gray-300 text-gray-700 px-4 py-2 rounded-md">Cancel</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Load existing keys
    if (backgroundRemovalApp) {
        const status = backgroundRemovalApp.getAPIStatus();
        document.getElementById('removebg-key').value = status.stats.find(s => s.name === 'Remove.bg')?.hasKey ? '••••••••••••••••' : '';
        document.getElementById('photoroom-key').value = status.stats.find(s => s.name === 'PhotoRoom')?.hasKey ? '••••••••••••••••' : '';
    }
}

function saveAPIKeys() {
    const removebgKey = document.getElementById('removebg-key').value;
    const photoroomKey = document.getElementById('photoroom-key').value;
    
    if (backgroundRemovalApp) {
        if (removebgKey && !removebgKey.includes('•')) {
            backgroundRemovalApp.configureAPI('removebg', removebgKey);
        }
        if (photoroomKey && !photoroomKey.includes('•')) {
            backgroundRemovalApp.configureAPI('photoroom', photoroomKey);
        }
        
        showNotification('API keys saved successfully!', 'success');
    }
    
    closeAPIModal();
}

function closeAPIModal() {
    const modal = document.querySelector('.fixed.inset-0');
    if (modal) {
        document.body.removeChild(modal);
    }
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeCounters,
        initializeUploadZone,
        showNotification,
        trackEvent,
        handleFileUploadWithAPI
    };
}
