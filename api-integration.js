// API Configuration and Integration Module
class BackgroundRemovalAPI {
    constructor() {
        const config = (typeof API_CONFIG !== 'undefined') ? API_CONFIG : null;

        this.apis = {
            removebg: {
                name: 'Remove.bg',
                endpoint: config?.removebg?.endpoint || '/api/removebg',
                key: config?.removebg?.key || 'serverless',
                enabled: config?.removebg?.enabled ?? false,
                rateLimit: 50, // Free tier: 50 images/month
                uses: 0
            },
            photoroom: {
                name: 'PhotoRoom',
                endpoint: config?.photoroom?.endpoint || '/api/photoroom',
                key: config?.photoroom?.key || 'serverless',
                enabled: config?.photoroom?.enabled ?? false,
                rateLimit: 1000, // Free tier: 1000 images/month
                uses: 0
            }
        };
        
        this.currentAPI = null;
        this.fallbackOrder = Object.keys(this.apis);
    }

    // Check if API key is available
    isAPIKeyAvailable(apiName) {
        return Boolean(this.apis[apiName].key);
    }

    // Get the best available API
    getBestAvailableAPI() {
        for (let apiName of this.fallbackOrder) {
            const api = this.apis[apiName];
            if (!api) continue;
            if (!api.enabled) continue;
            if (api.uses >= api.rateLimit) continue;
            if (this.isAPIKeyAvailable(apiName)) {
                return apiName;
            }
        }
        return null;
    }

    // Process image with background removal
    async processImage(imageFile, options = {}) {
        const availableAPIs = this.fallbackOrder.filter(apiName => {
            const api = this.apis[apiName];
            return api && api.enabled && api.uses < api.rateLimit && this.isAPIKeyAvailable(apiName);
        });

        if (availableAPIs.length === 0) {
            throw new Error('No live API is configured or available.');
        }

        let lastError = null;

        for (const apiName of availableAPIs) {
            this.currentAPI = apiName;
            console.log(`Using API: ${this.apis[apiName].name}`);

            try {
                let result;
                switch (apiName) {
                    case 'removebg':
                        result = await this.processWithRemoveBG(imageFile, options);
                        break;
                    case 'photoroom':
                        result = await this.processWithPhotoRoom(imageFile, options);
                        break;
                    default:
                        throw new Error(`Unsupported API ${apiName}`);
                }

                this.apis[apiName].uses++;
                return {
                    success: true,
                    apiUsed: apiName,
                    apiName: this.apis[apiName].name,
                    result: result,
                    isLive: true
                };
            } catch (error) {
                lastError = error;
                console.error(`API ${apiName} failed:`, error);
                
                // If PhotoRoom returns a 403 (common when used directly from browser),
                // disable it for this session to avoid repeated failures.
                if (apiName === 'photoroom' && error && error.status === 403) {
                    this.apis[apiName].enabled = false;
                    console.warn('PhotoRoom disabled for this session after 403 (likely API/key or CORS restriction).');
                }
            }
        }

        return {
            success: false,
            error: lastError ? lastError.message : 'All live APIs failed.',
            apiUsed: availableAPIs[availableAPIs.length - 1]
        };
    }

    // Remove.bg API integration
    async processWithRemoveBG(imageFile, options = {}) {
        const response = await fetch(this.apis.removebg.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': imageFile.type || 'application/octet-stream',
                'x-file-name': imageFile.name || 'upload'
            },
            body: imageFile
        });

        if (!response.ok) {
            throw new Error(`Remove.bg API error: ${response.status} ${response.statusText}`);
        }

        const blob = await response.blob();
        return URL.createObjectURL(blob);
    }

    // PhotoRoom API integration
    async processWithPhotoRoom(imageFile, options = {}) {
        const response = await fetch(this.apis.photoroom.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': imageFile.type || 'application/octet-stream',
                'x-file-name': imageFile.name || 'upload'
            },
            body: imageFile
        });

        if (!response.ok) {
            const error = new Error(`PhotoRoom API error: ${response.status} ${response.statusText}`);
            error.status = response.status;
            throw error;
        }

        const blob = await response.blob();
        return URL.createObjectURL(blob);
    }

    // Mock API for demonstration
    async processWithMock(imageFile, options = {}) {
        // Simulate API processing time
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
        
        // For demo purposes, return the pre-generated demo image
        // In a real implementation, this would simulate the background removal
        return 'resources/demo-after.jpg';
    }

    // Get API usage statistics
    getUsageStats() {
        return Object.keys(this.apis).map(apiName => ({
            name: this.apis[apiName].name,
            uses: this.apis[apiName].uses,
            limit: this.apis[apiName].rateLimit,
            remaining: this.apis[apiName].rateLimit - this.apis[apiName].uses,
            enabled: this.apis[apiName].enabled,
            hasKey: this.isAPIKeyAvailable(apiName)
        }));
    }

    // Reset API usage (for testing)
    resetUsage() {
        Object.keys(this.apis).forEach(apiName => {
            this.apis[apiName].uses = 0;
        });
    }
}

// Canvas-based background removal simulation (fallback when no APIs available)
class CanvasBackgroundRemover {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
    }

    // Simple background removal simulation using canvas
    async removeBackground(imageFile, options = {}) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const reader = new FileReader();

            reader.onload = (e) => {
                img.onload = () => {
                    // Set canvas size to image size
                    this.canvas.width = img.width;
                    this.canvas.height = img.height;

                    // Draw image to canvas
                    this.ctx.drawImage(img, 0, 0);

                    // Get image data
                    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
                    const data = imageData.data;

                    // Simple background removal algorithm
                    // This is a basic implementation for demonstration
                    // Real background removal uses complex AI models
                    for (let i = 0; i < data.length; i += 4) {
                        const r = data[i];
                        const g = data[i + 1];
                        const b = data[i + 2];
                        const a = data[i + 3];

                        // Simple color-based background detection
                        // This is just for demonstration - real AI uses much more complex algorithms
                        const isBackground = this.isLikelyBackground(r, g, b);
                        
                        if (isBackground) {
                            data[i + 3] = 0; // Make transparent
                        }
                    }

                    // Put modified image data back
                    this.ctx.putImageData(imageData, 0, 0);

                    // Convert canvas to blob
                    this.canvas.toBlob((blob) => {
                        const url = URL.createObjectURL(blob);
                        resolve(url);
                    }, 'image/png');
                };

                img.src = e.target.result;
            };

            reader.onerror = reject;
            reader.readAsDataURL(imageFile);
        });
    }

    // Simple background detection based on color
    isLikelyBackground(r, g, b) {
        // This is a very basic implementation
        // Real background removal uses AI models trained on millions of images
        
        // Detect white/light backgrounds
        if (r > 200 && g > 200 && b > 200) {
            return true;
        }
        
        // Detect very dark backgrounds
        if (r < 50 && g < 50 && b < 50) {
            return true;
        }
        
        // Detect green screen backgrounds (approximate)
        if (g > r + 30 && g > b + 30) {
            return true;
        }
        
        return false;
    }
}

// Main application integration
class BackgroundRemovalApp {
    constructor() {
        this.api = new BackgroundRemovalAPI();
        this.canvasRemover = new CanvasBackgroundRemover();
        this.isProcessing = false;
    }

    // Process image with progress tracking
    async processImageWithProgress(imageFile, onProgress) {
        if (this.isProcessing) {
            throw new Error('Already processing an image');
        }

        this.isProcessing = true;
        let progressInterval = null;

        try {
            // Simulate progress for better UX
            let progress = 0;
            progressInterval = setInterval(() => {
                progress += Math.random() * 15 + 5;
                if (progress > 90) progress = 90;
                if (onProgress) onProgress(Math.floor(progress));
            }, 200);

            // Process the image
            const result = await this.api.processImage(imageFile);

            if (onProgress) onProgress(100);

            return result;

        } finally {
            if (progressInterval) clearInterval(progressInterval);
            this.isProcessing = false;
        }
    }

    // Get current API status
    getAPIStatus() {
        const currentAPI = this.api.currentAPI;
        const stats = this.api.getUsageStats();
        
        return {
            currentAPI: currentAPI,
            currentAPIName: currentAPI ? this.api.apis[currentAPI].name : 'Not connected',
            stats: stats,
            isUsingRealAPI: Boolean(currentAPI)
        };
    }

    // Configure API keys
    configureAPI(apiName, apiKey) {
        if (this.api.apis[apiName]) {
            this.api.apis[apiName].key = apiKey;
            return true;
        }
        return false;
    }

    // Enable/disable APIs
    toggleAPI(apiName, enabled) {
        if (this.api.apis[apiName]) {
            this.api.apis[apiName].enabled = enabled;
            return true;
        }
        return false;
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BackgroundRemovalAPI,
        CanvasBackgroundRemover,
        BackgroundRemovalApp
    };
}

// Global instance for browser use
if (typeof window !== 'undefined') {
    window.BackgroundRemovalAPI = BackgroundRemovalAPI;
    window.BackgroundRemovalApp = BackgroundRemovalApp;
}
