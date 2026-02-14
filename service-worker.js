const CACHE_NAME = 'valentine-v1.0.0';
const urlsToCache = [
  '/',
  '/valentine.html',
  '/index.html',
  '/style.css',
  '/config.js',
  '/valentine.js',
  '/valentine-features.js',
  '/toast.js',
  '/audio/valentine.mp3',
  '/images/anhbia.jpg',
  '/images/avatar.jpg',
  '/images/favicon.svg'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('[Service Worker] Cache installation failed:', error);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip Firebase and external API requests
  if (event.request.url.includes('firebasedatabase.app') || 
      event.request.url.includes('cloudinary.com') ||
      event.request.url.includes('onrender.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          console.log('[Service Worker] Serving from cache:', event.request.url);
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch((error) => {
          console.error('[Service Worker] Fetch failed:', error);
          
          // Return offline page if available
          return caches.match('/offline.html');
        });
      })
  );
});

// Handle background sync
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);
  
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  }
});

async function syncMessages() {
  try {
    // Implement sync logic here
    console.log('[Service Worker] Syncing messages...');
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error);
  }
}

// Handle push notifications (future feature)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Có tin nhắn mới từ Love Bot!',
    icon: '/images/favicon.svg',
    badge: '/images/favicon.svg',
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification('Valentine Website', options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});
