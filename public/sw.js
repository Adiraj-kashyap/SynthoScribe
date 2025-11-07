// Service Worker for caching Firebase and Google API resources
const CACHE_NAME = 'synthoscribe-v1';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Resources to cache with longer lifetimes - using cache-first strategy
const CACHE_RESOURCES = [
  // Firebase Auth iframe (cached for 7 days)
  /^https:\/\/.*\.firebaseapp\.com\/.*\/auth\/iframe\.js/,
  // Google user content (profile images, etc.)
  /^https:\/\/lh3\.googleusercontent\.com\/.*/,
  // Google APIs
  /^https:\/\/apis\.google\.com\/.*/,
  // Google API endpoints
  /^https:\/\/www\.googleapis\.com\/.*/,
  /^https:\/\/identitytoolkit\.googleapis\.com\/.*/,
  /^https:\/\/firestore\.googleapis\.com\/.*/,
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Activate immediately
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - implement aggressive cache-first strategy for Firebase resources
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip POST, PUT, DELETE, PATCH requests - Cache API only supports GET
  if (request.method !== 'GET') {
    return; // Let the browser handle non-GET requests normally
  }

  // Check if this is a resource we want to cache aggressively
  const shouldCache = CACHE_RESOURCES.some((pattern) => pattern.test(url.href));

  if (shouldCache) {
    // Cache-first strategy: check cache first, then network
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request, { ignoreSearch: false, ignoreMethod: false, ignoreVary: false }).then((cachedResponse) => {
          if (cachedResponse) {
            // Check if cache is still valid (within 7 days)
            const cachedDate = cachedResponse.headers.get('sw-cached-date');
            if (cachedDate) {
              const cacheAge = Date.now() - parseInt(cachedDate, 10);
              if (cacheAge < CACHE_DURATION) {
                // Return cached response immediately (cache-first)
                // Update cache in background for next time
                fetch(request)
                  .then((response) => {
                    if (response.status === 200) {
                      const responseToCache = response.clone();
                      const headers = new Headers(responseToCache.headers);
                      headers.set('sw-cached-date', Date.now().toString());
                      headers.set('Cache-Control', 'public, max-age=604800'); // 7 days
                      
                      const cachedResponse = new Response(responseToCache.body, {
                        status: responseToCache.status,
                        statusText: responseToCache.statusText,
                        headers: headers,
                      });
                      
                      cache.put(request, cachedResponse);
                    }
                  })
                  .catch(() => {
                    // Ignore background fetch errors
                  });
                
                return cachedResponse;
              }
            } else {
              // No date header, but we have a cached response - use it
              // Update cache in background
              fetch(request)
                .then((response) => {
                  if (response.status === 200) {
                    const responseToCache = response.clone();
                    const headers = new Headers(responseToCache.headers);
                    headers.set('sw-cached-date', Date.now().toString());
                    headers.set('Cache-Control', 'public, max-age=604800');
                    
                    const cachedResponse = new Response(responseToCache.body, {
                      status: responseToCache.status,
                      statusText: responseToCache.statusText,
                      headers: headers,
                    });
                    
                    cache.put(request, cachedResponse);
                  }
                })
                .catch(() => {
                  // Ignore background fetch errors
                });
              
              return cachedResponse;
            }
          }

          // No cache - fetch from network
          return fetch(request, {
            cache: 'no-cache', // Force fresh fetch, but we'll cache it
            mode: 'cors', // Ensure CORS for cross-origin requests
            credentials: 'omit' // Don't send credentials for caching
          })
            .then((response) => {
              // Clone the response
              const responseToCache = response.clone();

              // Override cache headers to extend cache lifetime
              const headers = new Headers(responseToCache.headers);
              headers.set('sw-cached-date', Date.now().toString());
              headers.set('Cache-Control', 'public, max-age=604800'); // 7 days
              
              // Remove any short-lived cache headers from Firebase
              headers.delete('expires');
              
              // Create new response with extended cache headers
              const cachedResponse = new Response(responseToCache.body, {
                status: responseToCache.status,
                statusText: responseToCache.statusText,
                headers: headers,
              });

              // Cache the response
              if (response.status === 200) {
                cache.put(request, cachedResponse);
              }

              return response;
            })
            .catch(() => {
              // If fetch fails, return cached version if available (even if expired)
              return cachedResponse || new Response('Offline', { status: 503 });
            });
        });
      })
    );
  } else {
    // For other resources, use network-first strategy
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match(request);
      })
    );
  }
});

