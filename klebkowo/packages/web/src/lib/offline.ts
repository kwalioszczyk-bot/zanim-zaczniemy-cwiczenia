/** Rejestracja service workera — dzięki niemu aplikacja otwiera się także bez sieci. */
export function wlaczTrybOffline(): void {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // brak service workera nie przeszkadza w grze — po prostu nie ma trybu offline
    });
  });
}
