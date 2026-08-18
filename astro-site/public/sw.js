self.addEventListener('install', event => {
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    
    // Only intercept requests for specific external domains used by the official archives
    const targetDomains = [
        'www.coloros.com',
        'coloros-website-cn.allawnfs.com',
        'hm.baidu.com',
        'dsfs.oppo.com',
        'vivo.com.cn',
        'hyperos.mi.com',
        'os1.hyperos.mi.com',
        'os2.hyperos.mi.com',
        'os3.hyperos.mi.com',
        'cdn-file.hyperos.mi.com',
        'cdn-font.hyperos.mi.com',
        'cdn.cnbj1.fds.api.mi-img.com',
        'ssl-cdn.static.browser.mi-img.com',
        'cia.hyperos.mi.com',
        's01.mifile.cn'
    ];

    if (targetDomains.some(domain => url.hostname.includes(domain))) {
        // Compute the base path from the SW registration scope (e.g., '/' or '/os_updates_archive/')
        const scopeUrl = new URL(self.registration.scope);
        const basePath = scopeUrl.pathname.replace(/\/$/, '');
        
        // Map to local static folder: /official_archives/domain/path
        const targetPath = `${basePath}/official_archives/${url.hostname}${url.pathname}`;
        
        const headers = new Headers(event.request.headers);
        
        event.respondWith(
            fetch(targetPath, { headers }).then(response => {
                if (!response.ok) {
                    // Fallback to original network request if local file is missing
                    return fetch(event.request);
                }
                return response;
            }).catch(err => fetch(event.request))
        );
    }
});
