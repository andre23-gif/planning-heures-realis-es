// sw.js — Service Worker (mode hors connexion)
const CACHE_NAME = "planning-scolaire-v1";

const CORE_FILES = [
  "./",
  "./index.html",
  "./offline.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png"
];

// Installation : mise en cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_FILES))
      .then(() => self.skipWaiting())
  );
});

// Activation : nettoyage anciens caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : null)))
    ).then(() => self.clients.claim())
  );
});

// Interception des requêtes
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Navigation (rechargement de page)
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put("./index.html", copy));
          return res;
        })
        .catch(() =>
          caches.match("./index.html") || caches.match("./offline.html")
        )
    );
    return;
  }

  // Autres fichiers
  event.respondWith(
    caches.match(req)
      .then(cached => cached || fetch(req))
      .catch(() => caches.match("./offline.html"))
  );
});
