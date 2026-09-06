// Cała trwałość danych użytkownika żyje pod jednym kluczem localStorage.
// Nic z tego pliku nigdy nie trafia do sieci — to jest fundament prywatności aplikacji.

const NAMESPACE = "tur-cwiczenia:v1";

export interface AppState {
  wpisyKart: Record<string, unknown>;
  ukonczoneQuizy: Record<number, true>;
  zabawy: Record<string, { wyprobowane?: boolean; ulubione?: boolean }>;
  notatkiPytan: { id: string; tresc: string; data: string }[];
  seriaDni: { ostatniaData: string | null; liczbaDni: number };
  authOk: { until: string } | null;
}

function emptyState(): AppState {
  return {
    wpisyKart: {},
    ukonczoneQuizy: {},
    zabawy: {},
    notatkiPytan: [],
    seriaDni: { ostatniaData: null, liczbaDni: 0 },
    authOk: null,
  };
}

function read(): AppState {
  try {
    const raw = localStorage.getItem(NAMESPACE);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    return { ...emptyState(), ...parsed };
  } catch {
    return emptyState();
  }
}

function write(state: AppState) {
  try {
    localStorage.setItem(NAMESPACE, JSON.stringify(state));
  } catch {
    // Brak miejsca lub localStorage niedostępny (np. tryb prywatny) — nie mamy dokąd
    // się przełączyć, więc po prostu tracimy ten konkretny zapis w milczeniu.
  }
}

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l());
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getState(): AppState {
  return read();
}

export function setCardEntry(cardId: string, value: unknown) {
  const state = read();
  state.wpisyKart[cardId] = value;
  write(state);
  notify();
}

export function getCardEntry<T = unknown>(cardId: string): T | undefined {
  return read().wpisyKart[cardId] as T | undefined;
}

export function markQuizDone(modul: number) {
  const state = read();
  state.ukonczoneQuizy[modul] = true;
  write(state);
  notify();
}

export function isQuizDone(modul: number): boolean {
  return !!read().ukonczoneQuizy[modul];
}

export function setZabawaStatus(tytul: string, patch: { wyprobowane?: boolean; ulubione?: boolean }) {
  const state = read();
  state.zabawy[tytul] = { ...state.zabawy[tytul], ...patch };
  write(state);
  notify();
}

export function getZabawaStatus(tytul: string) {
  return read().zabawy[tytul] ?? {};
}

export function addNotatkaPytania(tresc: string) {
  const state = read();
  state.notatkiPytan.push({ id: crypto.randomUUID(), tresc, data: new Date().toISOString() });
  write(state);
  notify();
}

export function removeNotatkaPytania(id: string) {
  const state = read();
  state.notatkiPytan = state.notatkiPytan.filter((n) => n.id !== id);
  write(state);
  notify();
}

const DZIEN_MS = 24 * 60 * 60 * 1000;

function dzisiajISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Rejestruje aktywność dnia (specjalny czas / pochwały) i aktualizuje serię — informacyjnie, bez presji. */
export function odnotujAktywnoscDnia() {
  const state = read();
  const dzis = dzisiajISO();
  const { ostatniaData, liczbaDni } = state.seriaDni;
  if (ostatniaData === dzis) return;
  if (ostatniaData) {
    const roznicaDni = Math.round((new Date(dzis).getTime() - new Date(ostatniaData).getTime()) / DZIEN_MS);
    state.seriaDni = { ostatniaData: dzis, liczbaDni: roznicaDni === 1 ? liczbaDni + 1 : 1 };
  } else {
    state.seriaDni = { ostatniaData: dzis, liczbaDni: 1 };
  }
  write(state);
  notify();
}

export function getSeriaDni() {
  const { ostatniaData, liczbaDni } = read().seriaDni;
  if (!ostatniaData) return 0;
  const roznicaDni = Math.round((new Date(dzisiajISO()).getTime() - new Date(ostatniaData).getTime()) / DZIEN_MS);
  return roznicaDni <= 1 ? liczbaDni : 0;
}

export function setAuthOk(until: Date) {
  const state = read();
  state.authOk = { until: until.toISOString() };
  write(state);
  notify();
}

export function isAuthOk(): boolean {
  const authOk = read().authOk;
  if (!authOk) return false;
  return new Date(authOk.until).getTime() > Date.now();
}

export function clearAuth() {
  const state = read();
  state.authOk = null;
  write(state);
  notify();
}

/** Twarde, natychmiastowe usunięcie wszystkiego — bez kosza, bez potwierdzeń po stronie kodu. */
export function wipeAllData() {
  localStorage.removeItem(NAMESPACE);
  notify();
}

export function exportStateJSON(): string {
  const state = read();
  return JSON.stringify({ namespace: NAMESPACE, exportedAt: new Date().toISOString(), state }, null, 2);
}

export function importStateJSON(json: string): { ok: true } | { ok: false; error: string } {
  try {
    const parsed = JSON.parse(json);
    const incoming = parsed.state ?? parsed;
    const merged: AppState = { ...emptyState(), ...incoming };
    write(merged);
    notify();
    return { ok: true };
  } catch {
    return { ok: false, error: "Plik nie jest poprawnym eksportem tej aplikacji (nieprawidłowy JSON)." };
  }
}
