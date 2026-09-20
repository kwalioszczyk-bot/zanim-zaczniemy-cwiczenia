/** Elementy składowe wersji papierowej — małe funkcje zwracające HTML. */
import { stylDruku } from './styl.ts';

export function bezpieczny(tekst: string): string {
  return tekst
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function dokument(tytul: string, tresc: string, bazaFontow: string): string {
  return `<!doctype html>
<html lang="pl">
<head>
<meta charset="utf-8">
<title>${bezpieczny(tytul)}</title>
<style>${stylDruku(bazaFontow)}</style>
</head>
<body>
<span class="znacznik znacznik--lg"></span><span class="znacznik znacznik--pg"></span>
<span class="znacznik znacznik--ld"></span><span class="znacznik znacznik--pd"></span>
${tresc}
</body>
</html>`;
}

export function strona(tresc: string, poziomo = false): string {
  return `<section class="strona${poziomo ? ' strona--pozioma' : ''}">${tresc}</section>`;
}

/** Strona o dokładnej wysokości arkusza — treść nie przelewa się na kolejną kartkę. */
export function stronaPelna(tresc: string): string {
  return `<section class="strona strona--pelna">${tresc}</section>`;
}

export function naglowekArkusza(tytul: string, podpis: string): string {
  return `<header class="naglowek-arkusza">
    <span class="tytul">${bezpieczny(tytul)}</span>
    <span class="podpis">${bezpieczny(podpis)}</span>
  </header>`;
}

export interface OpisKarty {
  naglowek: string;
  etykieta?: string;
  tresc: string;
  stopka?: string;
  kod?: string;
  wariant?: 'blekit' | 'zielen' | 'bez' | 'brzoskwinia' | '';
}

export function karta(k: OpisKarty): string {
  return `<div class="karta${k.wariant ? ` karta--${k.wariant}` : ''}">
    <div class="karta__naglowek">
      <span>${bezpieczny(k.naglowek)}</span>
      ${k.etykieta ? `<span class="etykieta">${bezpieczny(k.etykieta)}</span>` : ''}
    </div>
    <div>${k.tresc}</div>
    ${k.stopka || k.kod ? `<div class="karta__stopka">${k.stopka ?? ''}${k.kod ? `<span class="karta__kod"> ${bezpieczny(k.kod)}</span>` : ''}</div>` : ''}
  </div>`;
}

/** Układa karty na stronach A4 wraz z liniami cięcia. */
export function arkuszKart(karty: string[], naStronie: 2 | 4 | 8, naglowek?: string): string {
  const klasa = naStronie === 2 ? 'a5' : naStronie === 4 ? 'a6' : 'a7';
  const strony: string[] = [];
  for (let i = 0; i < karty.length; i += naStronie) {
    const grupa = karty.slice(i, i + naStronie);
    while (grupa.length < naStronie) grupa.push('');
    strony.push(
      stronaPelna(
        `${naglowek && i === 0 ? naglowek : ''}<div class="siatka-kart siatka-kart--${klasa}">` +
          grupa.map((k) => `<div class="karta-ciecia">${k}</div>`).join('') +
          '</div>',
      ),
    );
  }
  return strony.join('');
}

/** Tor licznika do zaznaczania pionkiem. */
export function torDruku(nazwa: string, start: number, min = 0, max = 10): string {
  const pola = Array.from({ length: max - min + 1 }, (_, i) => i + min)
    .map((w) => `<span class="tor-druk__pole${w === start ? ' tor-druk__pole--start' : ''}">${w}</span>`)
    .join('');
  return `<div class="tor-druk"><span class="tor-druk__nazwa">${bezpieczny(nazwa)}</span><span class="tor-druk__pola">${pola}</span></div>`;
}

export function linie(ile: number): string {
  return Array.from({ length: ile }, () => '<div class="linie"></div>').join('');
}

export function opiszEfekt(efekt: Record<string, number | undefined>, nazwy: Record<string, string>): string {
  const wpisy = Object.entries(efekt).filter(([, d]) => typeof d === 'number' && d !== 0);
  if (!wpisy.length) return 'bez zmian';
  return wpisy.map(([id, d]) => `${nazwy[id] ?? id} ${(d as number) > 0 ? '+' : '−'}${Math.abs(d as number)}`).join(', ');
}

/** Prosty doodle liniowy w SVG — ten sam język graficzny co w aplikacji. */
export function doodle(sciezki: string, rozmiar = 26): string {
  return `<svg class="doodle" viewBox="0 0 64 64" width="${rozmiar}" height="${rozmiar}" fill="none" stroke="#232323" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${sciezki}</svg>`;
}

export const KOT =
  '<path d="M20 54c0-11 5-19 12-19s12 8 12 19c0 6-1 9-2 11H22c-1-2-2-5-2-11Z"/><path d="M32 35c-8 0-13-6-13-13 0-7 6-12 13-12s13 5 13 12c0 7-5 13-13 13Z"/><path d="M21 13 18 4l9 4M43 13l3-9-9 4"/><path d="M27 20v3M37 20v3"/><path d="M26 29h-9M38 29h9"/><path d="M44 62c8-2 12-8 11-16-1-6-5-9-8-8"/>';
export const NOZYCZKI =
  '<circle cx="14" cy="50" r="7"/><circle cx="50" cy="50" r="7"/><path d="M19 45 48 12M45 45 16 12"/>';
