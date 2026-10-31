const CACHE_NAME = 'volt-flow-shell-v2';
const APP_ROOT = new URL('./', self.registration.scope).href;
const APP_INDEX = new URL('./index.html', self.registration.scope).href;
const APP_SHELL = [
    APP_ROOT,
    APP_INDEX,
    new URL('./manifest.webmanifest', self.registration.scope).href,
    new URL('./icons/volt-flow-192.png', self.registration.scope).href,
    new URL('./icons/volt-flow-512.png', self.registration.scope).href
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys
                .filter(key => key.startsWith('volt-flow-shell-') && key !== CACHE_NAME)
                .map(key => caches.delete(key))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    const request = event.request;
    if (request.method !== 'GET') return;

    const requestUrl = new URL(request.url);
    if (requestUrl.origin !== self.location.origin) return;

    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    if (response.ok) {
                        const copy = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(APP_ROOT, copy));
                    }
                    return response;
                })
                .catch(async () => (await caches.match(APP_ROOT)) || (await caches.match(APP_INDEX)) || Response.error())
        );
        return;
    }

    event.respondWith(
        caches.match(request).then(cached => {
            if (cached) return cached;
            return fetch(request).then(response => {
                if (response.ok) {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
                }
                return response;
            });
        })
    );
});

