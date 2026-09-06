// Prosta, zależna wyłącznie od przeglądarki wyszukiwarka rozmyta — bez bibliotek zewnętrznych,
// żeby żadna treść pytań użytkownika nie musiała nigdzie wyjeżdżać poza kod aplikacji.

const COMBINING_MARKS = /\p{M}/gu;

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(COMBINING_MARKS, ""); // usuwa znaki diakrytyczne do porównań
}

function tokenize(text: string): string[] {
  return normalize(text)
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1);
}

export interface SearchableItem<T> {
  item: T;
  haystacks: string[];
}

export function search<T>(items: SearchableItem<T>[], query: string): T[] {
  const q = query.trim();
  if (!q) return items.map((i) => i.item);

  const qTokens = tokenize(q);
  const qNorm = normalize(q);

  const scored = items.map((entry) => {
    const combined = normalize(entry.haystacks.join(" "));
    let score = 0;

    if (combined.includes(qNorm)) score += 10;

    for (const token of qTokens) {
      if (combined.includes(token)) score += 3;
      else {
        // dopasowanie częściowe (literówki, odmiana) — sprawdź czy jakiś wyraz zaczyna się podobnie
        const words = combined.split(/\s+/);
        if (words.some((w) => w.length > 2 && token.length > 2 && (w.startsWith(token.slice(0, -1)) || token.startsWith(w.slice(0, -1))))) {
          score += 1;
        }
      }
    }

    return { entry, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.entry.item);
}
