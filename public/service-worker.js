/* eslint-disable no-restricted-globals */

// This service worker can be customized!
// See https://developers.google.com/web/tools/workbox/modules
// for more information.

// This is the simplest possible service worker. It does nothing but install
// and activate, which is enough to make the app installable (a PWA).

self.addEventListener('install', (event) => {
  console.log('Service worker installing...');
  // Add a call to skipWaiting here if you want the service worker to activate
  // immediately after installation.
  // self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service worker activating...');
});

self.addEventListener('fetch', (event) => {
  // This is a "no-op" fetch handler. It's required to make the app installable.
  // You can add caching strategies here later.
  // event.respondWith(fetch(event.request));
});
