// Simple service worker for caching static assets
const CACHE_NAME = '5tl-registration-v1';
const urlsToCache = [
  '/',
  '/logo5tl.png',
  '/whatsapp.svg',
  '/motorcycle.svg',
  '/category.svg',
  '/instagram.svg',
  '/tiktok.svg'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});