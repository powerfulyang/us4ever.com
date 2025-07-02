const FONT_CACHE_NAME = 'resource-hub-fonts-v1';

/** @type {ServiceWorkerGlobalScope} */
// @ts-ignore
const globalSelf = self;

/** @type {Clients} */
// @ts-ignore
const clients = globalSelf.clients;

// 需要缓存的字体资源
const fontUrlsToCache = [
  'https://help.littleeleven.com/font.css',
  'https://help.littleeleven.com/FiraCode/FiraCode-Regular.ttf',
  'https://help.littleeleven.com/FiraCode/FiraCode-Bold.ttf',
  'https://help.littleeleven.com/FiraCode/FiraCode-Medium.ttf',
  'https://help.littleeleven.com/FiraCode/FiraCode-Light.ttf',
  'https://help.littleeleven.com/FiraCode/FiraCode-SemiBold.ttf',
  'https://help.littleeleven.com/LXGW-WENKAI/LXGWWenKaiLite-Light.ttf',
  'https://help.littleeleven.com/LXGW-WENKAI/LXGWWenKaiLite-Regular.ttf',
  'https://help.littleeleven.com/LXGW-WENKAI/LXGWWenKaiLite-Medium.ttf',
];

// 安装 Service Worker
globalSelf.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      // 缓存字体资源
      caches.open(FONT_CACHE_NAME)
        .then((cache) => {
          return cache.addAll(fontUrlsToCache);
        })
    ])
  );
});

// 激活 Service Worker
globalSelf.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== FONT_CACHE_NAME) {
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

  // 处理字体资源请求
  if (url.origin === 'https://help.littleeleven.com') {
    event.respondWith(
      caches.open(FONT_CACHE_NAME)
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
                });
            });
        })
    );
  }
});
