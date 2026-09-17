/**
 * Klient API. Trzy rzeczy, na których zależy najbardziej w sali szkoleniowej:
 * 1. operacje są idempotentne — ponowne wysłanie po zerwaniu sieci nic nie dubluje,
 * 2. gdy Server-Sent Events nie działają, klient sam wraca do odpytywania co 3 s,
 * 3. nic nie wychodzi poza własny serwer.
 */

export class BladApi extends Error {
  constructor(message: string, public readonly status = 0) {
    super(message);
    this.name = 'BladApi';
  }
}

async function zadanie<T>(url: string, opcje: RequestInit = {}): Promise<T> {
  let odpowiedz: Response;
  try {
    odpowiedz = await fetch(url, {
      ...opcje,
      headers: { 'Content-Type': 'application/json', ...(opcje.headers ?? {}) },
    });
  } catch {
    throw new BladApi('Brak połączenia z serwerem gry. Sprawdź sieć — gra czeka.');
  }
  const tekst = await odpowiedz.text();
  const dane = tekst ? (JSON.parse(tekst) as unknown) : null;
  if (!odpowiedz.ok) {
    const blad = (dane as { blad?: string } | null)?.blad ?? 'Coś poszło nie tak.';
    throw new BladApi(blad, odpowiedz.status);
  }
  return dane as T;
}

export const api = {
  get: <T>(url: string, token?: string) =>
    zadanie<T>(url, { headers: token ? { 'x-klebkowo-token': token } : {} }),
  post: <T>(url: string, ciało: unknown, token?: string) =>
    zadanie<T>(url, {
      method: 'POST',
      body: JSON.stringify(ciało ?? {}),
      headers: token ? { 'x-klebkowo-token': token } : {},
    }),
  del: <T>(url: string, token?: string) =>
    zadanie<T>(url, { method: 'DELETE', headers: token ? { 'x-klebkowo-token': token } : {} }),
};

/** Identyfikator operacji — stabilny dla danego kroku, żeby powtórka była rozpoznana. */
export function idOperacji(czesci: (string | number)[]): string {
  return czesci.join(':');
}

export interface Polaczenie {
  rozlacz(): void;
}

/**
 * Nasłuch zmian: najpierw SSE, a gdy strumień milknie — odpytywanie co 3 s.
 * `naZmiane` może być wywołane wielokrotnie; widok zawsze pobiera pełny stan.
 */
export function sluchaj(idSesji: string, naZmiane: () => void, naStan?: (polaczony: boolean) => void): Polaczenie {
  let zrodlo: EventSource | null = null;
  let odpytywanie: ReturnType<typeof setInterval> | null = null;
  let zamkniete = false;

  const wlaczOdpytywanie = () => {
    if (odpytywanie || zamkniete) return;
    naStan?.(false);
    odpytywanie = setInterval(naZmiane, 3000);
  };
  const wylaczOdpytywanie = () => {
    if (!odpytywanie) return;
    clearInterval(odpytywanie);
    odpytywanie = null;
  };

  try {
    zrodlo = new EventSource(`/api/strumien/${encodeURIComponent(idSesji)}`);
    zrodlo.onopen = () => {
      wylaczOdpytywanie();
      naStan?.(true);
      naZmiane();
    };
    for (const typ of ['faza', 'stoliki', 'ustawienia', 'koniec'])
      zrodlo.addEventListener(typ, () => naZmiane());
    zrodlo.onerror = () => wlaczOdpytywanie();
  } catch {
    wlaczOdpytywanie();
  }

  return {
    rozlacz() {
      zamkniete = true;
      wylaczOdpytywanie();
      zrodlo?.close();
    },
  };
}
