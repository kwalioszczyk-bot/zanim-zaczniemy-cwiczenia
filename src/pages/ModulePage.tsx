import trescJson from "../data/tresc-aplikacji.json";
import analizaJson from "../data/analiza-skutecznosci.json";
import type { AnalizaSkutecznosci, TrescAplikacji } from "../types";
import { Link } from "../router";
import { CardRenderer } from "../cards/CardRenderer";
import { isQuizDone } from "../lib/storage";
import { useAppState } from "../hooks/useAppState";

const dane = trescJson as TrescAplikacji;
const analiza = analizaJson as AnalizaSkutecznosci;

function znajdzOpisWagi(kartaId: string): string | undefined {
  return analiza.obszaryPraktyki.find((o) => o.zrodlaWpisow.includes(kartaId))?.opisWagi;
}

export function ModulePage({ nr }: { nr: number }) {
  useAppState();
  const modul = dane.moduly.find((m) => m.nr === nr);
  const karty = dane.kartyPracy.filter((k) => k.modul === nr);
  const zabawy = dane.zabawy.filter((z) => z.modul === nr);
  const maQuiz = dane.quizy.some((q) => q.modul === nr);
  const quizGotowy = isQuizDone(nr);

  if (!modul) {
    return (
      <div>
        <p>Nie znaleziono modułu.</p>
        <Link to="/pulpit" className="underline">
          Wróć do pulpitu
        </Link>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm font-medium uppercase tracking-wide text-ink/50">Moduł {modul.nr}</p>
      <h1 className="mt-1 font-heading text-2xl font-semibold leading-snug">{modul.tytul}</h1>
      <p className="mt-1 text-ink/60">{modul.temat}</p>

      {maQuiz && (
        <Link
          to={`/quiz/${nr}`}
          className="mt-6 flex items-center justify-between rounded-2xl border border-line bg-panel p-4 hover:bg-line/30"
        >
          <span className="font-medium">Quiz do tego modułu</span>
          <span className="text-sm text-ink/60">{quizGotowy ? "ukończony — powtórz" : "jeszcze nie zrobiony"}</span>
        </Link>
      )}

      <h2 className="mt-8 font-heading text-lg font-semibold">Karty pracy</h2>
      <div className="mt-4 space-y-10">
        {karty.map((karta) => {
          const opisWagi = znajdzOpisWagi(karta.id);
          return (
            <div key={karta.id} className="rounded-2xl border border-line p-5">
              <CardRenderer karta={karta} />
              {opisWagi && (
                <p className="no-print mt-4 border-t border-line pt-4 text-xs leading-relaxed text-ink/50">
                  Dlaczego to ćwiczenie: {opisWagi}
                </p>
              )}
            </div>
          );
        })}
        {karty.length === 0 && <p className="text-sm text-ink/60">Ten moduł nie ma osobnej karty pracy.</p>}
      </div>

      {zabawy.length > 0 && (
        <>
          <h2 className="mt-8 font-heading text-lg font-semibold">Powiązane zabawy</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {zabawy.map((z) => (
              <div key={z.tytul} className="rounded-2xl border border-line bg-panel p-4">
                <h3 className="font-heading font-semibold">{z.tytul}</h3>
                <p className="mt-1 text-xs text-ink/60">
                  wiek {z.wiek} · {z.czas}
                </p>
                <p className="mt-2 text-sm leading-relaxed">{z.jak}</p>
              </div>
            ))}
          </div>
          <Link to={`/zabawy?modul=${nr}`} className="mt-3 inline-block text-sm font-medium text-accent underline">
            Zobacz wszystkie zabawy tego modułu →
          </Link>
        </>
      )}
    </div>
  );
}
