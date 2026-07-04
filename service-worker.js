const CACHE_NAME = 'mola-takip-v9';
const ASSETS = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // 'reload' tarayıcı HTTP önbelleğini atlar; her zaman gerçekten güncel
      // dosyaları alıp yeni cache'e koyar. addAll() burada kullanılmıyor çünkü
      // o, HTTP cache'inden eski (bayat) bir kopya döndürebiliyordu.
      return Promise.all(
        ASSETS.map((url) =>
          fetch(url, { cache: 'reload' }).then((response) => {
            if (!response.ok) throw new Error('Fetch failed: ' + url);
            return cache.put(url, response);
          })
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => cached);
    })
  );
});

