const CACHE_NAME = "portfolio-cache-v12";
const ASSETS_TO_CACHE = [
    "./",
    "./index.html",
    "./styles.css",
    "./projects.css",
    "./experience.css",
    "./effects.css",
    "./script.js",
    "./portfolio-data.js",
    "./assets/cursor/NORMAL.cur",
    "./assets/cursor/SELECT.cur",
    "./assets/images/backgroundw.webp",
    "./assets/images/robot.webp",
    "./assets/images/sky.webp",
    "./assets/fonts/pressstart2p.ttf",
    "./assets/fonts/sharetechmono.ttf"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener("fetch", event => {
    // Only handle GET requests originating from our origin
    if (event.request.method !== "GET" || !event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return cache.match(event.request).then(cachedResponse => {
                const fetchPromise = fetch(event.request).then(networkResponse => {
                    if (networkResponse.status === 200) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                }).catch(() => {
                    // Fail silently on network error (offline mode)
                });
                
                // Return cached response immediately, falling back to network fetch
                return cachedResponse || fetchPromise;
            });
        })
    );
});
