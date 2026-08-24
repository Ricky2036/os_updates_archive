self.addEventListener('install', event => {
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
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
        's01.mifile.cn',
        'honor.com',
        'hihonor.com',
        'www-file.honor.com'
    ];

    const url = new URL(event.request.url);

    if (url.pathname.startsWith('/_next/')) {
        const referer = event.request.headers.get('referer') || '';
        let domain = 'hyperos.mi.com';
        if (referer.includes('os1.hyperos.mi.com') || referer.includes('/hyperos/1')) domain = 'os1.hyperos.mi.com';
        else if (referer.includes('os2.hyperos.mi.com') || referer.includes('/hyperos/2')) domain = 'os2.hyperos.mi.com';
        else if (referer.includes('os3.hyperos.mi.com') || referer.includes('/hyperos/3')) domain = 'os3.hyperos.mi.com';
        else if (referer.includes('hyperos.mi.com') || referer.includes('/hyperos/4')) domain = 'hyperos.mi.com';
        
        const scopeUrl = new URL(self.registration.scope);
        const basePath = scopeUrl.pathname.replace(/\/$/, '');
        const targetPath = `${basePath}/official_archives/${domain}${url.pathname}`;
        
        event.respondWith(
            fetch(targetPath).then(response => {
                if (!response.ok) return fetch(event.request);
                return response;
            }).catch(() => fetch(event.request))
        );
        return;
    }

    if (url.pathname.startsWith('/content/dam/') || url.pathname.startsWith('/etc/') || url.pathname.startsWith('/etc.clientlibs/')) {
        const scopeUrl = new URL(self.registration.scope);
        const basePath = scopeUrl.pathname.replace(/\/$/, '');
        const targetPath = `${basePath}/official_archives/www.honor.com${url.pathname}`;
        event.respondWith(
            fetch(targetPath).then(response => {
                if (!response.ok) return fetch(event.request);
                return response;
            }).catch(() => fetch(event.request))
        );
        return;
    }

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
