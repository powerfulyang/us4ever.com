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

globalSelf.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.origin === 'https://help.littleeleven.com' && event.request.method === 'GET') {
    event.respondWith(
      (async () => {
        const cache = await caches.open(HELP_CENTER_CACHE_NAME);

        // 创建两个 Promise 进行竞速
        const cachePromise = cache.match(event.request);
        const networkPromise = fetch(event.request);

        try {
          // 使用 Promise.race 竞速
          // 注意：通常我们需要对 Race 结果进行筛选，因为 cache.match 没命中会返回 undefined
          const response = await Promise.race([
            cachePromise.then(res => {
              if (res) return res;
              // 如果缓存没中，返回一个永远 pending 的 promise，把机会让给网络
              return new Promise(() => { });
            }),
            networkPromise.then(networkRes => {
              if (networkRes.ok) {
                cache.put(event.request, networkRes.clone());
              }
              return networkRes;
            })
          ]);

          return response;
        } catch (error) {
          // 如果两者都失败（或网络断开且缓存无数据）
          const cachedResponse = await cachePromise;
          if (cachedResponse) return cachedResponse;

          return new Response('Network error and no cache', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' }
          });
        }
      })()
    );
  }
});
