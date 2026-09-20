/*
 * Service worker gry „KŁĘBKOWO. Sprawa się plącze”.
 *
 * Zadanie jest jedno: po pierwszym wczytaniu aplikacja ma się otworzyć nawet wtedy,
 * gdy sieć w sali padnie. Dlatego cache'ujemy wyłącznie własne pliki aplikacji
 * (HTML, JavaScript, style, czcionki, ikony).
 *
 * Czego NIE cache'ujemy: niczego spod /api/. Stan gry musi być zawsze świeży —
 * lepiej pokazać „słaba sieć” niż wczorajszą rundę.
 */
const WERSJA = 'klebkowo-v1';
const SZKIELET = ['/', '/stolik', '/ikona.svg', '/manifest.webmanifest'];

self.addEventListener('install', (zdarzenie) => {
  zdarzenie.waitUntil(
    caches
      .open(WERSJA)
      .then((cache) => cache.addAll(SZKIELET).catch(() => undefined))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (zdarzenie) => {
  zdarzenie.waitUntil(
    caches
      .keys()
      .then((klucze) => Promise.all(klucze.filter((k) => k !== WERSJA).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (zdarzenie) => {
  const zadanie = zdarzenie.request;
  if (zadanie.method !== 'GET') return;

  const adres = new URL(zadanie.url);
  if (adres.origin !== self.location.origin) return;
  // stan gry i strumień zmian zawsze prosto z serwera
  if (adres.pathname.startsWith('/api/')) return;

  // nawigacja: najpierw sieć, a gdy jej nie ma — wersja z pamięci
  if (zadanie.mode === 'navigate') {
    zdarzenie.respondWith(
      fetch(zadanie)
        .then((odpowiedz) => {
          const kopia = odpowiedz.clone();
          caches.open(WERSJA).then((cache) => cache.put(zadanie, kopia)).catch(() => undefined);
          return odpowiedz;
        })
        .catch(() =>
          caches
            .match(zadanie)
            .then((z) => z ?? caches.match(adres.pathname.startsWith('/stolik') ? '/stolik' : '/'))
            .then((z) => z ?? Response.error()),
        ),
    );
    return;
  }

  // pliki aplikacji: najpierw pamięć, w tle odświeżenie
  zdarzenie.respondWith(
    caches.match(zadanie).then((zPamieci) => {
      const zSieci = fetch(zadanie)
        .then((odpowiedz) => {
          if (odpowiedz.ok) {
            const kopia = odpowiedz.clone();
            caches.open(WERSJA).then((cache) => cache.put(zadanie, kopia)).catch(() => undefined);
          }
          return odpowiedz;
        })
        .catch(() => zPamieci);
      return zPamieci ?? zSieci;
    }),
  );
});
