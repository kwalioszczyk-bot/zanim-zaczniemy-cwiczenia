// Lokalny, w pełni działający offline detektor słów kluczowych. Nic nie blokuje i nic nie
// wysyła — jedyny efekt trafienia to delikatna podpowiedź w interfejsie, żeby pokazać
// odnośnik do panelu pomocy. Wszystko dzieje się w przeglądarce użytkownika.
//
// Dopasowanie działa na tekście pozbawionym polskich znaków diakrytycznych (ę→e, ć→c, ...),
// bo natywne \w w JS nie obejmuje liter spoza ASCII — bez tego kroku odmiana słów typu
// „skrzywdzę” nigdy by się nie złapała.

const COMBINING_MARKS = /\p{M}/gu;

function normalize(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(COMBINING_MARKS, "");
}

// Pojedyncze rdzenie — wystarczy, że któryś wystąpi gdziekolwiek w tekście.
const RDZENIE: string[] = [
  "przemoc",
  "maltretow",
  "znecani",
  "zneca",
  "samobojcz",
  "samookaleczen",
  "chce sie zabic",
  "chce zabic sie",
  "nie chce zyc",
  "nie chce juz zyc",
];

// Pary rdzeni — oba muszą wystąpić w tekście (niekoniecznie obok siebie), np. "biję" + "dziecko".
const PARY: [string, string][] = [
  ["bij", "dzieck"],
  ["uderz", "dzieck"],
  ["krzywdz", "dzieck"],
  ["skrzywdz", "dzieck"],
];

export function zawieraSlowaAlarmowe(text: string): boolean {
  if (!text || text.trim().length < 3) return false;
  const znormalizowany = normalize(text);

  if (RDZENIE.some((rdzen) => znormalizowany.includes(rdzen))) return true;
  if (PARY.some(([a, b]) => znormalizowany.includes(a) && znormalizowany.includes(b))) return true;

  return false;
}
