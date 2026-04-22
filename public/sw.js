const CACHE_NAME = 'bookmanager-cache-v2';

// Ficheiros estáticos essenciais
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/icon-512x512.png',
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name.startsWith('bookmanager-') && name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Não cachear chamadas de API (elas podem ter lógica no servidor) 
  // exceto se quisermos criar fallback (veremos com IndexedDB no lado do cliente).
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Network-first strategy for HTML pages and Next.js data (RSC)
  if (
    event.request.mode === 'navigate' || 
    url.pathname.startsWith('/_next/data/') || 
    event.request.headers.get('accept')?.includes('text/html') ||
    event.request.headers.get('rsc') === '1'
  ) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone the response to save it in cache
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Se falhar a rede, procura na cache
          return caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Fallback para offline page se existir (opcional)
            return caches.match('/');
          });
        })
    );
    return;
  }

  // Stale-while-revalidate para recursos estáticos (_next/static, css, imagens)
  if (url.pathname.startsWith('/_next/static/') || event.request.destination === 'image' || event.request.destination === 'style') {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
          });
          return networkResponse;
        }).catch(() => {
           // Silenciosamente falha no background se estiver offline
        });
        
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Default fallback (Cache First)
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// Push Notifications
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : { 
    title: 'BookManager', 
    body: 'Tens novidades na tua biblioteca!' 
  };
  
  const options = {
    body: data.body,
    icon: '/icon-512x512.png',
    badge: '/icon-512x512.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
