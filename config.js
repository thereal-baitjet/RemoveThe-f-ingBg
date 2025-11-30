// ClearBG API Configuration
// Keys are loaded from environment variables (env.js in browser or .env in Node)

const ENV = (typeof window !== 'undefined' ? window.__ENV : (typeof process !== 'undefined' ? process.env : {})) || {};

const API_CONFIG = {
    // Remove.bg API Configuration
    // Get your key from: https://www.remove.bg/dashboard#api-key
    removebg: {
        enabled: true, // Set to true to enable
        key: ENV.REMOVE_BG_KEY || 'serverless', // placeholder; real key stays server-side
        endpoint: '/api/removebg', // proxied through Vercel Function
        // Free tier: 50 images/month, 1 credit per image
        // Paid plans start at $0.20/image
    },
    
    // PhotoRoom API Configuration  
    // Get your key from: https://www.photoroom.com/api
    photoroom: {
        enabled: true, // Set to true to enable
        key: ENV.PHOTOROOM_KEY || 'serverless', // placeholder; real key stays server-side
        endpoint: '/api/photoroom', // proxied through Vercel Function
        // Free tier: 1000 images/month, 1 credit per image
        // Paid plans start at $0.05/image
    },
    
    // Mock API Configuration (disabled in live mode)
    mock: {
        enabled: false,
        // This uses pre-generated demo images for demonstration only
        // No API key required, unlimited usage
    }
};

// Instructions for getting API keys:
/*

REMOVE.BG:
1. Go to https://www.remove.bg/
2. Sign up for a free account
3. Visit https://www.remove.bg/dashboard#api-key
4. Copy your API key
5. Replace 'YOUR_REMOVE_BG_API_KEY_HERE' with your actual key
6. Set enabled: true

PHOTOROOM:
1. Go to https://www.photoroom.com/api
2. Sign up for a free account  
3. Get your API key from the dashboard
4. Replace 'YOUR_PHOTOROOM_API_KEY_HERE' with your actual key
5. Set enabled: true

*/

// Export for use in the application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
}

// Make available globally for browser
if (typeof window !== 'undefined') {
    window.API_CONFIG = API_CONFIG;
}
