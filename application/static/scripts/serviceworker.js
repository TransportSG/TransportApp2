let cacheName = 'transportsg';

let cachedURLs = [
    '/',
    '/static/css/base-style.css',
    '/static/css/home.css',
    '/static/css/offline.css',
    '/static/fonts/bree-serif.otf',
    '/static/fonts/ff-meta.otf',
    '/static/images/about_this_site.svg',
    '/static/images/broken-bus-stop.svg',
    '/static/images/bus_timings.svg',
    '/static/images/bus-stop.svg',
    '/static/images/favicon.png',
    '/static/images/general_search.svg',
    '/static/images/magnifying-glass.svg',
    '/static/images/mrt_timings.svg',
    '/static/images/nearby_bus_stops.svg',
    '/static/images/nearby_nwabs.svg',
    '/static/images/non-wheelchair.svg',
    '/static/images/wheelchair.svg',
    '/static/scripts/base.js',
    '/static/scripts/helper.js',
    '/serviceworker.js',
    '/offline'
];

self.addEventListener('install', event => {
    console.log('[TransportSG]: service worker installed');

    event.waitUntil(
        caches.open(cacheName).then(cache => {
            cache.addAll(cachedURLs);
        })
    );
});

self.addEventListener('fetch', event => {
    console.log('[TransportSG]: fetching resource', event.request.url);

    event.respondWith(fetchWithCache(event.request));
});

function fetchWithCache(request) {
    return caches.open(cacheName).then(cache => {
        if (request.mode === 'navigate' || (request.method === 'GET' && request.headers.get('accept').includes('text/html'))) {
            return fetch(request.url).catch(error => {
                return cache.match(request.url).then(cachedResponse => {
                    if (cachedResponse) return cachedResponse;

                    return cache.match('/offline');
                });
            });
       } else {
            return cache.match(request).then(response => {
                return response || fetch(request);
            });
        }
    });
}
