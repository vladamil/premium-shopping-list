const CACHE_NAME = 'cartographer-v2';

// Essential shell files to cache on initial install
const INITIAL_ASSETS = ['/', '/index.html', '/manifest.json', '/favicon.ico'];

// 1. Install Event: Cache essential shell
self.addEventListener('install', (event) => {
   self.skipWaiting(); // Force the new service worker to activate immediately
   event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
         return Promise.allSettled(INITIAL_ASSETS.map((url) => cache.add(url)));
      }),
   );
});

// 2. Activate Event: Clean up old caches (like v1)
self.addEventListener('activate', (event) => {
   event.waitUntil(
      caches
         .keys()
         .then((cacheNames) => {
            return Promise.all(
               cacheNames.map((cache) => {
                  if (cache !== CACHE_NAME) {
                     return caches.delete(cache); // Delete old caches automatically
                  }
               }),
            );
         })
         .then(() => self.clients.claim()),
   );
});

// 3. Fetch Event: Cache-First, then Network (Dynamic Caching)
self.addEventListener('fetch', (event) => {
   // Only intercept GET requests
   if (event.request.method !== 'GET') return;

   event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
         // A. If file (JS, CSS, Image) is already in cache, return it immediately!
         if (cachedResponse) {
            return cachedResponse;
         }

         // B. Otherwise, fetch it from the network AND save it into the cache for offline use
         return fetch(event.request)
            .then((networkResponse) => {
               // Verify valid response before caching
               if (
                  !networkResponse ||
                  networkResponse.status !== 200 ||
                  networkResponse.type !== 'basic'
               ) {
                  return networkResponse;
               }

               const responseToCache = networkResponse.clone();
               caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, responseToCache);
               });

               return networkResponse;
            })
            .catch(() => {
               // C. If completely offline and navigating, fall back to index.html
               if (event.request.mode === 'navigate') {
                  return caches.match('/index.html') || caches.match('/');
               }
               // Return a empty fallback instead of letting the promise reject
               return new Response('Offline resource unavailable', {
                  status: 533,
                  statusText: 'Offline',
               });
            });
      }),
   );
});
