/* public/sw.js */
const CACHE_NAME = 'cartographer-v1';

// Keep this minimal so nothing triggers a 404 failure!
const ASSETS_TO_CACHE = ['/', '/index.html', '/manifest.json', '/favicon.ico'];

// 1. Install Event: Cache essential shell
self.addEventListener('install', (e) => {
   self.skipWaiting(); // Force active immediately
   e.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
         // Use Promise.allSettled or cache individually so 1 missing asset doesn't break the whole app
         return Promise.all(
            ASSETS_TO_CACHE.map((url) => {
               return cache.add(url).catch((err) => {
                  console.warn(`Failed to cache asset: ${url}`, err);
               });
            }),
         );
      }),
   );
});

// 2. Activate Event: Clean up old caches
self.addEventListener('activate', (e) => {
   e.waitUntil(clients.claim());
});

// 3. Fetch Event: Serve from cache, fall back to network
self.addEventListener('fetch', (e) => {
   // Only intercept GET requests
   if (e.request.method !== 'GET') return;

   e.respondWith(
      caches.match(e.request).then((cachedResponse) => {
         if (cachedResponse) {
            return cachedResponse;
         }
         return fetch(e.request).catch(() => {
            // Fallback for page navigation when completely offline
            if (e.request.mode === 'navigate') {
               return caches.match('/index.html') || caches.match('/');
            }
         });
      }),
   );
});
