/**
 * Proste rysunki liniowe w SVG — rysowane w projekcie, bez gotowych zestawów ikon.
 * Każdy doodle jest dekoracją: ma `aria-hidden`, a znaczenie niosą zawsze słowa obok.
 */
import type { CSSProperties } from 'react';

export type NazwaDoodla =
  | 'kot'
  | 'slonce'
  | 'chmurka'
  | 'zegar'
  | 'strzalka'
  | 'sadzonka'
  | 'ekran'
  | 'garnek'
  | 'sciezka'
  | 'koperta'
  | 'kostka'
  | 'kawa'
  | 'megafon'
  | 'gwiazdka'
  | 'kartka'
  | 'ludzie';

interface Props {
  nazwa: NazwaDoodla;
  rozmiar?: number;
  kolor?: string;
  obrot?: number;
  style?: CSSProperties;
  className?: string;
}

const rysunki: Record<NazwaDoodla, JSX.Element> = {
  // kot Kierownik — siedzi i przygląda się całej dzielnicy
  kot: (
    <>
      <path d="M20 54c0-11 5-19 12-19s12 8 12 19c0 6-1 9-2 11H22c-1-2-2-5-2-11Z" />
      <path d="M32 35c-8 0-13-6-13-13 0-7 6-12 13-12s13 5 13 12c0 7-5 13-13 13Z" />
      <path d="M21 13 18 4l9 4M43 13l3-9-9 4" />
      <path d="M27 20v3M37 20v3" />
      <path d="M32 26l-2 2h4l-2-2Z" />
      <path d="M26 29h-9M26 32l-9 3M38 29h9M38 32l9 3" />
      <path d="M44 62c8-2 12-8 11-16-1-6-5-9-8-8" />
    </>
  ),
  slonce: (
    <>
      <circle cx="32" cy="32" r="13" />
      <path d="M32 6v7M32 51v7M6 32h7M51 32h7M13 13l5 5M46 46l5 5M51 13l-5 5M18 46l-5 5" />
    </>
  ),
  chmurka: (
    <>
      <path d="M17 44c-6 0-11-5-11-11s5-11 11-11c1-8 8-14 16-14 9 0 16 6 17 15 6 1 11 6 11 12 0 5-4 9-9 9H17Z" />
      <path d="M22 52c2 3 6 5 10 5" />
    </>
  ),
  zegar: (
    <>
      <circle cx="32" cy="34" r="24" />
      <path d="M32 19v16l10 7" />
      <path d="M21 8 13 13M43 8l8 5" />
    </>
  ),
  strzalka: (
    <>
      <path d="M6 40c10-14 22-22 38-24" />
      <path d="M33 8l11 8-8 11" />
    </>
  ),
  sadzonka: (
    <>
      <path d="M32 58V26" />
      <path d="M32 34c-9 0-15-5-16-14 9-1 15 4 16 14Z" />
      <path d="M32 30c1-9 7-14 16-13-1 9-7 14-16 13Z" />
      <path d="M18 58h28l-3 4H21l-3-4Z" />
    </>
  ),
  ekran: (
    <>
      <rect x="6" y="12" width="52" height="34" rx="3" />
      <path d="M22 54h20M32 46v8" />
      <path d="M18 22l14 7-14 7V22Z" />
    </>
  ),
  garnek: (
    <>
      <path d="M12 26h40l-4 26a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4l-4-26Z" />
      <path d="M8 26h48" />
      <path d="M26 18c0-4 4-4 4-8M36 18c0-4 4-4 4-8" />
    </>
  ),
  sciezka: (
    <>
      <path d="M14 58c0-12 10-12 10-22S12 24 12 14" />
      <path d="M34 58c0-14 12-14 12-24S36 20 36 8" />
      <path d="M52 30h6M52 44h6" />
    </>
  ),
  koperta: (
    <>
      <rect x="6" y="14" width="52" height="36" rx="2" />
      <path d="M6 16l26 19 26-19" />
    </>
  ),
  kostka: (
    <>
      <rect x="10" y="10" width="44" height="44" rx="6" />
      <circle cx="22" cy="22" r="2.6" fill="currentColor" />
      <circle cx="42" cy="22" r="2.6" fill="currentColor" />
      <circle cx="32" cy="32" r="2.6" fill="currentColor" />
      <circle cx="22" cy="42" r="2.6" fill="currentColor" />
      <circle cx="42" cy="42" r="2.6" fill="currentColor" />
    </>
  ),
  kawa: (
    <>
      <path d="M12 22h34v20a12 12 0 0 1-12 12H24a12 12 0 0 1-12-12V22Z" />
      <path d="M46 26h5a7 7 0 0 1 0 14h-5" />
      <path d="M22 8c0 4-3 4-3 8M32 8c0 4-3 4-3 8" />
    </>
  ),
  megafon: (
    <>
      <path d="M8 26v12l28 12V14L8 26Z" />
      <path d="M36 22c7 2 11 5 11 10s-4 8-11 10" />
      <path d="M14 39l3 15h7l-2-13" />
    </>
  ),
  gwiazdka: (
    <>
      <path d="M32 8l6 16 17 1-13 11 4 17-14-9-14 9 4-17L9 25l17-1 6-16Z" />
    </>
  ),
  kartka: (
    <>
      <path d="M14 8h26l12 12v36H14V8Z" />
      <path d="M40 8v12h12" />
      <path d="M22 32h20M22 40h20M22 48h12" />
    </>
  ),
  ludzie: (
    <>
      <circle cx="20" cy="20" r="8" />
      <path d="M8 54c0-9 5-14 12-14s12 5 12 14" />
      <circle cx="44" cy="24" r="7" />
      <path d="M33 54c0-8 5-12 11-12s11 4 11 12" />
    </>
  ),
};

export function Doodle({ nazwa, rozmiar = 48, kolor = 'currentColor', obrot = 0, style, className }: Props) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={rozmiar}
      height={rozmiar}
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{ color: kolor, transform: obrot ? `rotate(${obrot}deg)` : undefined, flex: '0 0 auto', ...style }}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {rysunki[nazwa]}
    </svg>
  );
}
