// KronoPex PWA - Self-cleaning Service Worker
// Automatically purges stale caches to avoid SPA chunk reload loops on mobile
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    })
  );
  self.registration.unregister();
});
