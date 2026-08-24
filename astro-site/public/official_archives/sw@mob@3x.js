self.addEventListener('install', event => {
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    
    // Ignore local requests, express will handle them natively!
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        return; 
    }
    
    // Map external domains to local paths mapped in express
    const targetPath = '/' + url.hostname + url.pathname;
    
    const headers = new Headers(event.request.headers);
    
    event.respondWith(
        fetch(targetPath, { headers }).then(response => {
            return response;
        }).catch(err => fetch(event.request))
    );
});
