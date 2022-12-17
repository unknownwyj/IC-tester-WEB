// This is the "Offline copy of pages" service worker
const CACHE = "pwabuilder-offline";
importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

workbox.routing.registerRoute(
  new RegExp('/IC-tester-WEB/.*'),
  new workbox.strategies.NetworkFirst()
  
);
workbox.precaching.precacheAndRoute([
  {url: '/', revision: null},
  {url: '/IC-tester-WEB/icons/16pinIC.svg', revision: null},
  {url: '/IC-tester-WEB/index.html', revision: null},
  {url: '/IC-tester-WEB/', revision: null},
  {url: '/IC-tester-WEB/css/styles.css', revision: null},
  {url: '/IC-tester-WEB/js/main.js', revision: null},
  {url: '/IC-tester-WEB/js/BluetoothTerminal.js', revision: null}
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
        "/",
        "/IC-tester-WEB/",
        "/IC-tester-WEB/icons/16pinIC.svg",
        "/IC-tester-WEB/index.html",
        "/IC-tester-WEB/css/styles.css",
        "/IC-tester-WEB/js/main.js",
        "/IC-tester-WEB/js/BluetoothTerminal.js"
       ]);
    })
   );
});