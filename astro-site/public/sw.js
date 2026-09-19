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
        'iqoo.com',
        'res.wx.qq.com',
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
        'www.honor.com',
        'www-file.honor.com',
        'consumer.huawei.com',
        'consumer-img.huawei.com',
        'huawei.com'
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

    if (url.pathname.startsWith('/content/') || url.pathname.startsWith('/etc/') || url.pathname.startsWith('/etc.clientlibs/') || url.pathname.startsWith('/libs/') || url.pathname.startsWith('/cn/')) {
        const referer = event.request.headers.get('referer') || '';
        const scopeUrl = new URL(self.registration.scope);
        const basePath = scopeUrl.pathname.replace(/\/$/, '');

        let primaryDomain = 'www.honor.com';
        let fallbackDomain = 'www-file.honor.com';

        if (referer.includes('consumer.huawei.com') || referer.includes('/harmonyos/') || url.pathname.includes('huawei-cbg-site') || url.pathname.includes('harmonyos')) {
            primaryDomain = 'consumer.huawei.com';
            fallbackDomain = 'consumer-img.huawei.com';
        }

        const targetPath = `${basePath}/official_archives/${primaryDomain}${url.pathname}`;

        event.respondWith(
            fetch(targetPath).then(response => {
                if (!response.ok) return fetch(`${basePath}/official_archives/${fallbackDomain}${url.pathname}`);
                return response;
            }).catch(() => fetch(event.request))
        );
        return;
    }

    if (url.pathname.startsWith('/zip/')) {
        const scopeUrl = new URL(self.registration.scope);
        const basePath = scopeUrl.pathname.replace(/\/$/, '');
        const targetPath = `${basePath}/official_archives/wwwstatic.vivo.com.cn/vivoportal/files/resource/funtouch/1789652280489${url.pathname}`;
        
        event.respondWith(
            fetch(targetPath).then(response => {
                if (!response.ok) return fetch(event.request);
                return response;
            }).catch(() => fetch(event.request))
        );
        return;
    }

    const lowerPath = url.pathname.toLowerCase();
    if (lowerPath.includes('/portal/open/api/') || lowerPath.includes('/header/login/') || lowerPath.includes('/eden/flyheart') || lowerPath.includes('/h5/monitor') || lowerPath.includes('/vmonitor')) {
        const cb = url.searchParams.get('callback') || url.searchParams.get('jsoncallback');
        const validCallback = cb && /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*$/.test(cb) ? cb : null;
        const body = validCallback ? `${validCallback}({"code":0,"data":{}})` : '{"code":0,"data":{}}';
        const reqOrigin = event.request.headers.get('origin') || '*';
        const reqHeaders = event.request.headers.get('access-control-request-headers') || '*';
        event.respondWith(
            new Response(body, {
                status: cb && !validCallback ? 400 : 200,
                headers: {
                    'Content-Type': validCallback ? 'application/javascript; charset=utf-8' : 'application/json; charset=utf-8',
                    'Access-Control-Allow-Origin': reqOrigin,
                    'Access-Control-Allow-Credentials': 'true',
                    'Access-Control-Allow-Headers': reqHeaders,
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
                    'X-Content-Type-Options': 'nosniff',
                    'Cache-Control': 'no-store'
                }
            })
        );
        return;
    }

    if (targetDomains.some(domain => url.hostname === domain || url.hostname.endsWith(`.${domain}`))) {
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
