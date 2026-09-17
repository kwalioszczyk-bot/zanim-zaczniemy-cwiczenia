/** Minimalny router — bez zależności, żeby paczka stolika została mała. */
import { useEffect, useState } from 'react';
import { TRYB_HASH } from './tryb.ts';

const biezaca = () => (TRYB_HASH ? window.location.hash.slice(1) || '/' : window.location.pathname);

export function useSciezka(): string {
  const [sciezka, ustaw] = useState(biezaca);
  useEffect(() => {
    const reakcja = () => ustaw(biezaca());
    window.addEventListener('popstate', reakcja);
    window.addEventListener('hashchange', reakcja);
    window.addEventListener('klebkowo:nawigacja', reakcja as EventListener);
    return () => {
      window.removeEventListener('popstate', reakcja);
      window.removeEventListener('hashchange', reakcja);
      window.removeEventListener('klebkowo:nawigacja', reakcja as EventListener);
    };
  }, []);
  return sciezka;
}

/** Adres do wstawienia w atrybut href — w trybie pokazu trafia do odnośnika. */
export function adres(sciezka: string): string {
  return TRYB_HASH ? `#${sciezka}` : sciezka;
}

export function idz(sciezka: string): void {
  if (biezaca() === sciezka) return;
  if (TRYB_HASH) {
    window.location.hash = sciezka;
    return;
  }
  window.history.pushState({}, '', sciezka);
  window.dispatchEvent(new Event('klebkowo:nawigacja'));
}

/** Dopasowanie prostych wzorców typu „/stolik/:kod”. */
export function dopasuj(wzorzec: string, sciezka: string): Record<string, string> | null {
  const czesciW = wzorzec.split('/').filter(Boolean);
  const czesciS = sciezka.split('/').filter(Boolean);
  if (czesciW.length !== czesciS.length) return null;
  const parametry: Record<string, string> = {};
  for (let i = 0; i < czesciW.length; i++) {
    const w = czesciW[i] as string;
    const s = czesciS[i] as string;
    if (w.startsWith(':')) parametry[w.slice(1)] = decodeURIComponent(s);
    else if (w !== s) return null;
  }
  return parametry;
}
