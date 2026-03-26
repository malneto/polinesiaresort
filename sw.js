var CACHE_NAME = 'polinesia-v2';
var urlsToCache = ['/', '/index.html'];

self.addEventListener('install', function(e) {
    e.waitUntil(caches.open(CACHE_NAME).then(function(cache) { return cache.addAll(urlsToCache); }));
    self.skipWaiting();
});

self.addEventListener('activate', function(e) {
    e.waitUntil(caches.keys().then(function(names) {
        return Promise.all(names.filter(function(n) { return n !== CACHE_NAME; }).map(function(n) { return caches.delete(n); }));
    }));
});

self.addEventListener('fetch', function(e) {
    e.respondWith(
        fetch(e.request).then(function(resp) {
            var clone = resp.clone();
            caches.open(CACHE_NAME).then(function(cache) { cache.put(e.request, clone); });
            return resp;
        }).catch(function() {
            return caches.match(e.request);
        })
    );
});
