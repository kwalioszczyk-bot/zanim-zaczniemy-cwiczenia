/** Adresy, pod którymi serwer gry jest widoczny dla urządzeń stolików. */
import { networkInterfaces } from 'node:os';

/**
 * Adresy IPv4 w sieci lokalnej, posortowane tak, żeby typowe sieci Wi-Fi i domowe
 * były pierwsze, a adresy kart wirtualnych (VirtualBox, WSL, Hyper-V) na końcu.
 * Na laptopie prowadzącej potrafi być ich kilka — wybór zostaje przy niej.
 */
export function adresyWSieciLokalnej(port: number): string[] {
  const znalezione: { adres: string; waga: number }[] = [];
  for (const [nazwa, karty] of Object.entries(networkInterfaces()))
    for (const karta of karty ?? []) {
      if (karta.family !== 'IPv4' || karta.internal) continue;
      const wirtualna = /virtualbox|vmware|hyper-v|wsl|docker|vethernet|loopback/i.test(nazwa);
      const typowaSiecDomowa = /^192\.168\./.test(karta.address);
      const prywatna = typowaSiecDomowa || /^10\./.test(karta.address) || /^172\.(1[6-9]|2\d|3[01])\./.test(karta.address);
      znalezione.push({
        adres: `http://${karta.address}:${port}`,
        waga: (wirtualna ? 100 : 0) + (typowaSiecDomowa ? 0 : prywatna ? 1 : 10),
      });
    }
  return znalezione.sort((a, b) => a.waga - b.waga).map((x) => x.adres);
}
