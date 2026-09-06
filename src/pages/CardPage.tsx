import trescJson from "../data/tresc-aplikacji.json";
import type { TrescAplikacji } from "../types";
import { Link } from "../router";
import { CardRenderer } from "../cards/CardRenderer";

const dane = trescJson as TrescAplikacji;

export function CardPage({ id }: { id: string }) {
  const karta = dane.kartyPracy.find((k) => k.id === id);

  if (!karta) {
    return (
      <div>
        <p>Nie znaleziono karty.</p>
        <Link to="/karty" className="underline">
          Wróć do biblioteki kart
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link to={`/modul/${karta.modul}`} className="no-print text-sm text-ink/60 underline">
        ← Moduł {karta.modul}
      </Link>
      <div className="mt-4">
        <CardRenderer karta={karta} />
      </div>
    </div>
  );
}
