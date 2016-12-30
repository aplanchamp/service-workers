
// SERVE DATA FROM CONTENT

// this cache is used to cache request
// here you can cache any request, from our origin or not
const CACHE_NAME = 'my-site-cache-v1';
// test cache to show deletion on install stage of cycle
const CACHE_TEST = 'my-site-cache-v2';
// urls to cache to CACHE_NAME
const urlsToCache = [
  'http://www.omdbapi.com/?t=star&y=&plot=short&r=json',
  'https://fonts.googleapis.com/css?family=Open+Sans:400,300',
];

// first stage of service worker lyfe cycle
self.addEventListener('install', (event) => {
  console.log('ServiceWorker installation with cache: ', CACHE_NAME);
  // Perform install steps
  // open both caches
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('open first cache and add urls', cache, urlsToCache);
        cache.addAll(urlsToCache);
      }),
    caches.open(CACHE_TEST)
      .then((cache) => (
        console.log('open second cache', cache)
      ))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        // force fetching from server regarding url param
        // if (event.request.url.split('&').pop().split('=').pop() === 'true') {
        //   return fetch(event.request).then(res => res);
        // }
        if (response) {
          console.log('ServiceWorker eventListener fetched from cache: ', event.request.url);
          return response;
        }

        // IMPORTANT: Clone the request. A request is a stream and
        // can only be consumed once. Since we are consuming this
        // once by cache and once by the browser for fetch, we need
        // to clone the response.
        const fetchRequest = event.request.clone();

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

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            console.log(
              'ServiceWorker eventListener fetched from server and put in cache: ',
              event.request.url
            );
            return res;
          }
        );
      })
    );
});

// activate STAGE of service worker life cycle : delete unecessary data
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => (
      Promise.all(keys.map((key, i) => { // eslint-disable-line
        console.log('ServiceWorker activation cache name: ', key);
        if (key !== CACHE_NAME) {
          console.log('ServiceWorker activation cache name to delete: ', key);
          return caches.delete(keys[i]);
        }
      }))
    ))
  );
  // event.waitUntil(
  //   self.clients.claim(),
  //   caches.keys().then((keys) => (
  //     Promise.all(keys.map((key, i) => { // eslint-disable-line
  //       console.log('ServiceWorker activation cache name: ', key);
  //       if (key !== CACHE_NAME) {
  //         console.log('ServiceWorker activation cache name to delete: ', key);
  //         return caches.delete(keys[i]);
  //       }
  //     }))
  //   ))
  // );
});

// BACKGOUND Sync

// make service worker listen to sync event
self.addEventListener('sync', (event) => {
  // console.log('sync', event);

  // wait for sync event 'syncTest' and make fetch request : if connectivity is on,
  // request is fetch, if not it will be resend once connectivity is back
  if (event.tag === 'syncTest') {
    event.waitUntil(
      fetch('http://httpbin.org/get')
        .then((response) => (
          response
        ))
        .then((res) => {
          console.log('Request successful', res);
        })
        .catch((error) => {
          console.log('Request failed', error);
        })
    );
  }

  // if (event.tag === 'syncTest') {
  //   event.waitUntil(
  //     fetch('http://httpbin.org/get')
  //       .then((response) => (
  //         response
  //       ))
  //       .then(() => {
  //         self.registration.showNotification('Request successful');
  //       })
  //       .catch((error) => {
  //         self.registration.showNotification('Request failed', { body: error });
  //       })
  //   );
  // }
});
