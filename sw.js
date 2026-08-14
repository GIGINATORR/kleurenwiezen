// Kleurenwiezen service worker — verhoog het versienummer bij elke nieuwe release
const CACHE = "kleurenwiezen-v5";
const BESTANDEN = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-192.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(BESTANDEN)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Netwerk eerst, cache als vangnet: bezoekers krijgen altijd de nieuwste
// versie als er internet is, en de gecachte versie als ze offline zijn.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((antwoord) => {
        const kopie = antwoord.clone();
        caches.open(CACHE).then((c) => c.put(e.request, kopie));
        return antwoord;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match("./index.html")))
  );
});
