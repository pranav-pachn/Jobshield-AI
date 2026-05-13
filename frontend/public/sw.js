// Minimal service worker stub — prevents 404 on /sw.js
// Upgrade to a full Workbox SW when PWA support is needed.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
