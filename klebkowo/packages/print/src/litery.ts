/**
 * Litery A, B, C, D w stylu „Flipchart trenerki” — same litery, bez żadnych napisów.
 *
 *  • tabliczki na stoliki: jedna litera na całą kartkę A4,
 *  • karteczki do losowania miejsc: po 5 na literę (5 osób przy stoliku), do wycięcia i zwinięcia.
 *
 * Kolor litery odróżnia stoliki także z daleka, ale każda litera ma czarny obrys,
 * więc na drukarce czarno-białej nic nie ginie.
 */
import { ID_STOLIKOW, type IdStolika } from '@klebkowo/engine/typy';
import { arkuszKart, dokument, stronaPelna } from './elementy.ts';

const BARWY: Record<IdStolika, { litera: string; tlo: string }> = {
  A: { litera: '#f07a2b', tlo: '#f9c9a3' },
  B: { litera: '#7db83a', tlo: '#cfe7b0' },
  C: { litera: '#5fb4cc', tlo: '#bfe2ec' },
  D: { litera: '#f2b632', tlo: '#ffe9a8' },
};

/** Odręczna, lekko nierówna ramka: podwójny obrys markerem. */
function ramka(tlo: string): string {
  return `<svg class="lit-ramka" viewBox="0 0 200 280" preserveAspectRatio="none" aria-hidden="true">
    <path d="M14 10 C60 6 140 13 187 9 C192 60 190 210 188 270 C140 275 60 268 12 272 C9 210 12 60 14 10 Z"
          fill="${tlo}" fill-opacity="0.45" stroke="#232323" stroke-width="3.2" stroke-linejoin="round"/>
    <path d="M22 19 C70 15 135 21 180 18 C183 70 182 205 180 262 C135 265 70 260 20 263 C18 205 21 70 22 19 Z"
          fill="none" stroke="#232323" stroke-width="1.6" stroke-opacity="0.55" stroke-linejoin="round"/>
  </svg>`;
}

function tasma(pozycja: 'lewa' | 'prawa'): string {
  return `<span class="lit-tasma lit-tasma--${pozycja}"></span>`;
}

export const STYL_LITER = `
.lit-strona { position: relative; flex: 1; min-height: 0; overflow: hidden; display: grid; place-items: center; }
.lit-ramka { position: absolute; inset: 0; width: 100%; height: 100%; }
.lit-litera {
  position: relative;
  font-family: 'Caveat Brush', cursive;
  line-height: 0.72;
  color: var(--kolor);
  -webkit-text-stroke: 0.9mm #232323;
  paint-order: stroke fill;
  text-shadow: 3mm 3mm 0 #232323;
  transform: rotate(-3deg);
}
.lit-zakreslacz {
  position: absolute; left: 12%; right: 12%; bottom: 14%; height: 14%;
  background: var(--tlo); opacity: 0.85; border-radius: 40% 60% 45% 55% / 60% 45% 55% 40%;
  transform: rotate(-2deg);
}
.lit-tasma {
  position: absolute; top: -4mm; width: 34mm; height: 9mm;
  background: #f5e6c8; border: 0.4mm solid rgba(35,35,35,0.5);
}
.lit-tasma--lewa { left: 10mm; transform: rotate(-9deg); }
.lit-tasma--prawa { right: 10mm; transform: rotate(8deg); }
.lit-duza { font-size: 800pt; }
.lit-mala { font-size: 175pt; -webkit-text-stroke: 0.55mm #232323; text-shadow: 1.4mm 1.4mm 0 #232323; }
.lit-losowanie { position: relative; flex: 1; min-height: 0; overflow: hidden; display: grid; place-items: center; margin: 1.5mm; }
`;

/** 4 kartki A4 — jedna litera na kartkę. */
export function tabliczkiStolikow(baza: string): string {
  const strony = ID_STOLIKOW.map((id) => {
    const b = BARWY[id];
    return stronaPelna(`
      <div class="lit-strona" style="--kolor:${b.litera};--tlo:${b.tlo}">
        ${ramka(b.tlo)}${tasma('lewa')}${tasma('prawa')}
        <span class="lit-zakreslacz"></span>
        <span class="lit-litera lit-duza">${id}</span>
      </div>`);
  }).join('');
  return dokument('Litery na stoliki', `<style>${STYL_LITER}</style>${strony}`, baza);
}

/**
 * Karteczki do losowania: po 5 dla każdej litery (5 osób przy stoliku), 8 na stronie A4.
 * Karteczki są identyczne z tyłu, więc po wycięciu i zwinięciu nie da się ich rozpoznać.
 */
export function karteczkiDoLosowania(baza: string, naStolik = 5): string {
  const karteczki = ID_STOLIKOW.flatMap((id) =>
    Array.from({ length: naStolik }, () => {
      const b = BARWY[id];
      return `<div class="lit-losowanie" style="--kolor:${b.litera};--tlo:${b.tlo}">
        ${ramka(b.tlo)}
        <span class="lit-litera lit-mala">${id}</span>
      </div>`;
    }),
  );
  return dokument('Litery do losowania miejsc', `<style>${STYL_LITER}</style>${arkuszKart(karteczki, 8)}`, baza);
}
