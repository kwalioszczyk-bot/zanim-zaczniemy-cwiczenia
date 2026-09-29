/**
 * Warianty budowania aplikacji.
 *
 * Domyślnie aplikacja działa z własnym serwerem na laptopie prowadzącej.
 * Wariant „pokaz” to ta sama aplikacja zbudowana tak, żeby dało się ją otworzyć
 * z dowolnego adresu bez backendu: adresy w odnośniku (hash), ścieżki względne,
 * i tylko te widoki, które naprawdę działają bez serwera.
 */
export const TRYB_HASH = import.meta.env.VITE_TRYB_HASH === '1';
export const POKAZ = import.meta.env.VITE_POKAZ === '1';

/** Skąd ładować czcionki w podglądzie materiałów do druku. */
export const BAZA_FONTOW = POKAZ ? 'fonts' : '/fonts';
