// This is the "Offline copy of pages" service worker
const CACHE = "pwabuilder-offline";
importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

workbox.routing.registerRoute(
  new RegExp('/.*'),
  new workbox.strategies.NetworkFirst()
  
);
workbox.precaching.precacheAndRoute([
  {url: '/icons/16pinIC.svg', revision: null},
  {url: '/index.html', revision: null},
  {url: '/', revision: null},
  {url: '/css/styles.css', revision: null},
  {url: '/js/main.js', revision: null},
  {url: '/js/BluetoothTerminal.js', revision: null}
]);
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
        "/icons/16pinIC.svg",
        "/index.html",
        "/css/styles.css",
        "/js/main.js",
        "/js/BluetoothTerminal.js"
       ]);
    })
   );
});