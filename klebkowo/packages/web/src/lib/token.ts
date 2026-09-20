/**
 * Token prowadzącej — klucz do sterowania grą i do trybu omówienia.
 * Trzymany w localStorage, żeby omówienie dało się otworzyć w nowej karcie,
 * a odświeżenie strony w trakcie szkolenia nie wymagało podawania PIN-u od nowa.
 * Token wygasa razem z sesją; nie jest daną osobową i nie opisuje żadnego uczestnika.
 */
const KLUCZ = 'klebkowo:prowadzaca';

export function wczytajToken(): string {
  try {
    return localStorage.getItem(KLUCZ) ?? sessionStorage.getItem(KLUCZ) ?? '';
  } catch {
    // prywatne okno albo zablokowane dane stron — prowadząca poda PIN ponownie
    return '';
  }
}

export function zapiszToken(token: string): void {
  try {
    if (token) localStorage.setItem(KLUCZ, token);
    else localStorage.removeItem(KLUCZ);
  } catch {
    /* brak pamięci nie może zatrzymać gry */
  }
}
