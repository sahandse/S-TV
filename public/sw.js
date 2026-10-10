const CACHE = 's-tv-shell-v2';
const APP_ROOT = '/S-TV/';
const PRECACHE = [APP_ROOT, APP_ROOT + 'index.html'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith('s-tv-') && key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(APP_ROOT)) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => (await caches.match(APP_ROOT)) || (await caches.match(APP_ROOT + 'index.html')) || Response.error())
    );
    return;
  }

  if (!['script', 'style', 'font', 'image', 'manifest'].includes(request.destination)) return;
  event.respondWith(
    caches.match(request).then(async cached => {
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(CACHE);
        await cache.put(request, response.clone());
      }
      return response;
    })
  );
});
