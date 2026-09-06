// Prosty service worker: cache-first dla zasobów aplikacji, żeby po pierwszym wejściu
// wszystko (łącznie z treścią programu) działało bez internetu. Bez żadnych wywołań sieciowych
// do usług zewnętrznych — jedyne, co jest cache'owane, to pliki tej samej aplikacji.

const CACHE_NAME = "tur-cwiczenia-cache-v1";
const APP_SHELL = ["./", "./index.html", "./manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request);
      const siecFetch = fetch(request)
        .then((response) => {
          if (response && response.ok) cache.put(request, response.clone());
          return response;
        })
        .catch(() => undefined);

      if (cached) {
        // Stale-while-revalidate: oddaj od razu z cache'u, odśwież w tle.
        siecFetch;
        return cached;
      }

      const siecOwaOdpowiedz = await siecFetch;
      if (siecOwaOdpowiedz) return siecOwaOdpowiedz;

      if (request.mode === "navigate") {
        const shell = await cache.match("./index.html");
        if (shell) return shell;
      }

      return new Response("Brak połączenia i brak zasobu w pamięci podręcznej.", { status: 503, statusText: "Offline" });
    })
  );
});
