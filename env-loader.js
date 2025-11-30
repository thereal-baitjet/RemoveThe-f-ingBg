// Loads environment variables into window.__ENV for browser usage.
// Attempts to synchronously fetch a .env file served from the same origin.
(function loadEnv() {
    if (typeof window === 'undefined' || window.__ENV) return;

    try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', '.env', false); // synchronous on purpose so config.js sees values
        xhr.send(null);

        if (xhr.status >= 200 && xhr.status < 300) {
            const env = {};
            xhr.responseText.split('\n').forEach(line => {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('#')) return;
                const [key, ...rest] = trimmed.split('=');
                env[key] = rest.join('=');
            });
            window.__ENV = env;
            console.info('Loaded environment variables from .env');
        }
    } catch (err) {
        console.warn('Could not load .env in browser context:', err);
    }
})();
