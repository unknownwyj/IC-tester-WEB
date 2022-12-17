// This is the "Offline copy of pages" service worker

const CACHE = "pwabuilder-offline";

importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

workbox.routing.registerRoute(
  new RegExp('*'),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: CACHE
  })
);
self.addEventListener('fetch', function(event) {
  event.respondWith(async function() {
     try{
       var res = await fetch(event.request);
       var cache = await caches.open('cache');
       cache.put(event.request.url, res.clone());
       return res;
     }
     catch(error){
       return caches.match(event.request);
      }
    }());
});

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('cache').then(function(cache) {
      return cache.addAll([
        "./*",
        "./app/icons/*",
        "./app/index.html",
        "./app/style.css",
        "./app/app.js"
       ]);
    })
   );
});