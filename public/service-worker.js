const APP_PREFIX = 'BudgetTracker-';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./css/style.js",
    "./manifest.json",
    "./js/index.js",
    "./service-worker.js",
    "./icons/icon_512x512.png",
    "./icons/icon_384x384.png",
    "./icons/icon_192x192.png",
    "./icons/icon_152x152.png",
    "./icons/icon_144x144.png",
    "./icons/icon_128x128.png",
    "./icons/icon_96x96.png",
    "./icons/icon_72x72.png",
];

// 'self' instantiates listeners on server worker
self.addEventListener("install", function (e) {
    // app waits until work is complete to terminate service worker
    e.waitUntil(
      // find specific cache by name
      caches.open(CACHE_NAME).then(function (cache) {
        console.log("installing cache : " + CACHE_NAME);
        return cache.addAll(FILES_TO_CACHE);
      })
    );
    self.skipWaiting();
  });
  
  // event listener to activate event
  self.addEventListener("activate", function (e) {
    e.waitUntil(
      caches.keys().then(function (keyList) {
        // `keyList` contains all cache names under a username.github.io; filters out those w/ this app prefix to create keeplist
        let cacheKeeplist = keyList.filter(function (key) {
          return key.indexOf(APP_PREFIX);
        });
        // add current cache name to keeplist
        cacheKeeplist.push(CACHE_NAME);
  
        return Promise.all(
          keyList.map(function (key, i) {
            if (cacheKeeplist.indexOf(key) === -1) {
              console.log("deleting cache : " + keyList[i]);
              return caches.delete(keyList[i]);
            }
          })
        );
      })
    );
    self.clients.claim();
  });
  
  // listen for response of cached resources
  self.addEventListener("fetch", function (e) {
    // listen for event, fetch event, log URL of requested resource
    console.log("fetch request : " + e.request.url);
    e.respondWith(
      // if resource matches one already saved in cache, URL will be logged
      caches.match(e.request).then(function (request) {
        if (request) {
          // if cache is available, respond with cache
          console.log("responding with cache : " + e.request.url);
          return request;
        } else {
          // if there are no cache, try fetching request from online network
          console.log("file is not cached, fetching : " + e.request.url);
          return fetch(e.request);
        }
      })
    );
  });
  