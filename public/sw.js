const HELP_CENTER_CACHE_NAME = 'help-center-v1';

/** @type {ServiceWorkerGlobalScope} */
// @ts-ignore
const globalSelf = self;

/** @type {Clients} */
const clients = globalSelf.clients;



// 安装 Service Worker
globalSelf.addEventListener('install', () => {
  globalSelf.skipWaiting();
});

// 激活 Service Worker
globalSelf.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== HELP_CENTER_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 处理推送通知
globalSelf.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2'
      }
    };
    event.waitUntil(
      globalSelf.registration.showNotification(data.title, options)
    );
  }
});

// 处理通知点击
globalSelf.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

// 处理请求
globalSelf.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 处理帮助中心域名下的所有 GET 请求
  if (url.origin === 'https://help.littleeleven.com' && event.request.method === 'GET') {
    event.respondWith(
      caches.open(HELP_CENTER_CACHE_NAME)
        .then((cache) => {
          return cache.match(event.request)
            .then((response) => {
              if (response) {
                return response;
              }

              // 如果缓存中没有，则从网络获取并缓存
              return fetch(event.request)
                .then((networkResponse) => {
                  if (networkResponse.ok) {
                    cache.put(event.request, networkResponse.clone());
                  }
                  return networkResponse;
                })
                .catch(() => {
                  // 网络请求失败的处理
                  return new Response('Network error occurred', {
                    status: 408,
                    headers: { 'Content-Type': 'text/plain' }
                  });
                });
            });
        })
    );
  }
});
