/**
 * Tryb projektora — cała gra na jednym urządzeniu prowadzącej, bez serwera.
 * Pełna treść gry ładowana jest dopiero tutaj i dopiero na żądanie (osobna paczka),
 * dzięki czemu nie trafia do paczki urządzenia stolika.
 */
import type { StanSesji, Tresc } from '@klebkowo/engine';

const KLUCZ = 'klebkowo:projektor';

let pamiec: Tresc | null = null;

export async function wczytajPelnaTresc(): Promise<Tresc> {
  if (pamiec) return pamiec;
  const [{ wczytajTresc }, gra] = await Promise.all([
    import('@klebkowo/engine'),
    import('../../../../content/gra.json'),
  ]);
  pamiec = wczytajTresc((gra as { default: unknown }).default);
  return pamiec;
}

export function zapiszLokalnie(sesja: StanSesji): void {
  try {
    localStorage.setItem(KLUCZ, JSON.stringify(sesja));
  } catch {
    // brak pamięci albo prywatne okno — gra działa dalej, tylko bez zapisu
  }
}

export function wczytajLokalnie(): StanSesji | null {
  try {
    const zapis = localStorage.getItem(KLUCZ);
    return zapis ? (JSON.parse(zapis) as StanSesji) : null;
  } catch {
    return null;
  }
}

export function usunLokalnie(): void {
  try {
    localStorage.removeItem(KLUCZ);
  } catch {
    /* nic */
  }
}
