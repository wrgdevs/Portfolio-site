const ASSET_VERSION = "20260719e";
const CACHE_PREFIX = "wrg-portfolio-cache-";
const CACHE_NAME = `${CACHE_PREFIX}${ASSET_VERSION}`;
const LEGACY_CACHE_NAMES = new Set(["portfolio-cache-v13"]);
const versionedAsset = (path) => `${path}?v=${ASSET_VERSION}`;

const CORE_ASSETS_TO_CACHE = [
    "./index.html",
    versionedAsset("./styles.css"),
    versionedAsset("./projects.css"),
    versionedAsset("./experience.css"),
    versionedAsset("./effects.css"),
    versionedAsset("./script.bundle.js"),
];

const OPTIONAL_ASSETS_TO_CACHE = [
    versionedAsset("./assets/cursor/NORMAL.cur"),
    versionedAsset("./assets/cursor/SELECT.cur"),
    versionedAsset("./assets/images/backgroundw.webp"),
    versionedAsset("./assets/images/robot.webp"),
    versionedAsset("./assets/images/sky.webp"),
    "./assets/fonts/pressstart2p.ttf",
    "./assets/fonts/sharetechmono.ttf",
];

async function installAppShell() {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(CORE_ASSETS_TO_CACHE);
    await Promise.allSettled(OPTIONAL_ASSETS_TO_CACHE.map((asset) => cache.add(asset)));
    await self.skipWaiting();
}

async function removeOldCaches() {
    const cacheNames = await caches.keys();
    const oldCacheNames = cacheNames.filter(
        (name) => name !== CACHE_NAME && (name.startsWith(CACHE_PREFIX) || LEGACY_CACHE_NAMES.has(name)),
    );

    await Promise.all(oldCacheNames.map((name) => caches.delete(name)));
    await self.clients.claim();

    if (oldCacheNames.length) {
        const windowClients = await self.clients.matchAll({ type: "window" });
        await Promise.allSettled(windowClients.map((client) => client.navigate(client.url)));
    }
}

function isCacheableRequest(request) {
    return request.method === "GET" && new URL(request.url).origin === self.location.origin;
}

async function cacheFirst(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) return cachedResponse;

    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            await cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch {
        return new Response("", { status: 504, statusText: "Offline" });
    }
}

async function networkFirstNavigation(request) {
    const cache = await caches.open(CACHE_NAME);

    try {
        const networkResponse = await fetch(request, { cache: "no-store" });
        if (networkResponse.ok) {
            await cache.put("./index.html", networkResponse.clone());
        }
        return networkResponse;
    } catch {
        const offlinePage = await cache.match("./index.html");
        return offlinePage || new Response("", { status: 504, statusText: "Offline" });
    }
}

self.addEventListener("install", (event) => {
    event.waitUntil(installAppShell());
});

self.addEventListener("activate", (event) => {
    event.waitUntil(removeOldCaches());
});

self.addEventListener("fetch", (event) => {
    if (!isCacheableRequest(event.request)) return;

    event.respondWith(
        event.request.mode === "navigate" ? networkFirstNavigation(event.request) : cacheFirst(event.request),
    );
});
