// Keep S-TV's installed shell current after each GitHub Pages deployment.
// Video streams and external IPTV data are deliberately never cached here.
const CACHE = 's-tv-shell-v3';
const ROOT = '/S-TV/';
const PRECACHE = [ROOT + 'index.html'];

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
  if (url.origin !== self.location.origin || !url.pathname.startsWith(ROOT)) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(new Request(request, { cache: 'no-store' })).then(response => {
        if (response.ok) {
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE).then(cache => cache.put(ROOT + 'index.html', copy)));
        }
        return response;
      }).catch(() => caches.match(ROOT + 'index.html').then(cached => cached || Response.error()))
    );
    return;
  }
  // Browser-managed HTTP caching + Vite fingerprinted assets; do not persist
  // JS/CSS across deployments in a service worker cache.
});
