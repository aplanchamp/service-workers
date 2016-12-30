
/* global clients */

// SERVE DATA FROM CONTENT

// this cache is used to cache request
// here you can cache any request, from our origin or not
const STATIC_CACHE = 'static_cache';
const DYNAMIC_CACHE = 'dynamic_cache';

// urls to cache to STATIC_CACHE
const staticUrlsToCache = [
  '/',
  'bundle.js',
  'https://fonts.googleapis.com/css?family=Open+Sans:400,300',
];

// urls to cache to DYNAMIC_CACHE
const dynamicUrlsToCache = [
  'http://www.omdbapi.com/?t=star&y=&plot=short&r=json?both=true',
];

// first stage of service worker lyfe cycle
self.addEventListener('install', (event) => {
  // Perform install steps
  // open both caches
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('open static cache and add urls', cache, staticUrlsToCache);
        cache.addAll(staticUrlsToCache);
      }),
    caches.open(DYNAMIC_CACHE)
      .then((cache) => {
        console.log('open dynamic cache and add urls', cache, dynamicUrlsToCache);
        cache.addAll(dynamicUrlsToCache);
      })
  );
});

// Cache hit - return response
// force fetching from server regarding url param
// if (event.request.url.split('&').pop().split('=').pop() === 'true') {
//   return fetch(event.request).then(res => res);
// }


function handleFetchRequests(request) {
  console.log('request.url', request.url);
  // request from cache
  if (request.headers.get('x-use-cache-only')) {
    return caches.match(request);
  } else if (request.url === dynamicUrlsToCache[0]) {
    console.log('COUCOU');
    return fetch(request).then(
      (res) => {
        const responseToCache = res.clone();
        // const customReponse = new Response(
        // JSON.stringify({ Plot: 'my Custom Response' }), { status: 200, statusText: 'well done' }
        // );
        console.log('delete old DYNAMIC_CACHE');
        caches.delete(DYNAMIC_CACHE);
        console.log('add new DYNAMIC_CACHE');
        caches.open(DYNAMIC_CACHE)
          .then((cache) => {
            cache.put(request, responseToCache);
          });
        console.log('return result from network');
        return res;
      }
    );
  }
  return caches.match(request)
  .then((response) => {
    // Cache hit - return response
    // force fetching from server regarding url param
    // if (event.request.url.split('&').pop().split('=').pop() === 'true') {
    //   return fetch(event.request).then(res => res);
    // }
    if (response) {
      console.log('ServiceWorker eventListener fetched from cache: ', request.url);
      return response;
    }

    // IMPORTANT: Clone the request. A request is a stream and
    // can only be consumed once. Since we are consuming this
    // once by cache and once by the browser for fetch, we need
    // to clone the response.
    const fetchRequest = request.clone();

    return fetch(fetchRequest).then(
      (res) => {
        // Check if we received a valid response and if request from our origin
        if (!res || res.status !== 200 || res.type !== 'basic') {
          return res;
        }

        // IMPORTANT: Clone the response. A response is a stream
        // and because we want the browser to consume the response
        // as well as the cache consuming the response, we need
        // to clone it so we have two streams.
        const responseToCache = res.clone();

        caches.open(STATIC_CACHE)
          .then((cache) => {
            cache.put(request, responseToCache);
          });
        console.log(
          'ServiceWorker eventListener fetched from server and put in cache: ',
          request.url
        );
        return res;
      }
    );
  });
}


// function handleFetchRequests(request) {
//   console.log('request.url', request.url);
//   // request from cache
//   if (request.headers.get('x-use-cache-only')) {
//     return caches.match(request);
//   }
//   return fetch(request).then(
//     (res) => {
//       const responseToCache = res.clone();
//       // const customReponse = new Response(
//       //   JSON.stringify({ Plot: 'my Custom Response' }),
//              { status: 200, statusText: 'well done' }
//       // );
//       if (request.url === dynamicUrlsToCache[0]) {
//         console.log('delete old DYNAMIC_CACHE');
//         caches.delete(DYNAMIC_CACHE);
//         console.log('add new DYNAMIC_CACHE');
//         caches.open(DYNAMIC_CACHE)
//           .then((cache) => {
//             cache.put(request, responseToCache);
//           });
//       }
//       console.log('return result from network');
//       return res;
//     }
//   );
// }


self.onfetch = event => (event.respondWith(handleFetchRequests(event.request)));

// activate STAGE of service worker life cycle : delete unecessary data
self.addEventListener('activate', (event) => {
  if (self.clients && clients.claim) {
    clients.claim();
  }
  event.waitUntil(
    caches.keys().then((keys) => (
      Promise.all(keys.map((key, i) => { // eslint-disable-line
        console.log('ServiceWorker activation cache name: ', key);
        if (key !== STATIC_CACHE && key !== DYNAMIC_CACHE) {
          console.log('ServiceWorker activation cache name to delete: ', key);
          return caches.delete(keys[i]);
        }
      }))
    ))
  );
});
