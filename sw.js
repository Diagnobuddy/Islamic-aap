const CACHE_NAME = 'islamic-pwa-v2';
const URLS_TO_CACHE = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/prayer-times.js',
  './js/quran.js',
  './js/hadith.js',
  './js/tasbeeh.js',
  './js/qaza.js',
  './js/adhan.min.js',
  './manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});