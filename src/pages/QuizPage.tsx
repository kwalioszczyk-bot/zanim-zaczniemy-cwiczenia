import { useMemo, useState } from "react";
import trescJson from "../data/tresc-aplikacji.json";
import type { Pytanie, TrescAplikacji } from "../types";
import { Link, navigate } from "../router";
import { markQuizDone } from "../lib/storage";

const dane = trescJson as TrescAplikacji;

function przetasuj<T>(items: T[]): T[] {
  const kopia = [...items];
  for (let i = kopia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [kopia[i], kopia[j]] = [kopia[j], kopia[i]];
  }
  return kopia;
}

function przygotujPytanie(pytanie: Pytanie) {
  const opcjeZIndeksem = pytanie.opcje.map((tekst, indeksOryginalny) => ({ tekst, indeksOryginalny }));
  return przetasuj(opcjeZIndeksem);
}

export function QuizPage({ modul }: { modul: number }) {
  const quiz = dane.quizy.find((q) => q.modul === modul);
  const modulInfo = dane.moduly.find((m) => m.nr === modul);
  const [podejscie, setPodejscie] = useState(0);

  const potasowanePytania = useMemo(() => quiz?.pytania.map(przygotujPytanie) ?? [], [quiz, podejscie]);

  const [indeksPytania, setIndeksPytania] = useState(0);
  const [wybranyIndeks, setWybranyIndeks] = useState<number | null>(null);
  const [wyniki, setWyniki] = useState<boolean[]>([]);
  const [zakonczono, setZakonczono] = useState(false);

  if (!quiz || !modulInfo) {
    return (
      <div>
        <p>Nie znaleziono quizu.</p>
        <Link to="/quizy" className="underline">
          Wróć do listy quizów
        </Link>
      </div>
    );
  }

  const pytanie = quiz.pytania[indeksPytania];
  const opcje = potasowanePytania[indeksPytania];

  const wybierz = (indeksOryginalny: number) => {
    if (wybranyIndeks !== null) return;
    setWybranyIndeks(indeksOryginalny);
    setWyniki([...wyniki, indeksOryginalny === pytanie.poprawna]);
  };

  const dalej = () => {
    if (indeksPytania + 1 < quiz.pytania.length) {
      setIndeksPytania(indeksPytania + 1);
      setWybranyIndeks(null);
    } else {
      markQuizDone(modul);
      setZakonczono(true);
    }
  };

  const zacznijOdNowa = () => {
    setPodejscie((p) => p + 1);
    setIndeksPytania(0);
    setWybranyIndeks(null);
    setWyniki([]);
    setZakonczono(false);
  };

  if (zakonczono) {
    const umiane = quiz.pytania.filter((_, i) => wyniki[i]);
    const doPowrotu = quiz.pytania.filter((_, i) => !wyniki[i]);
    return (
      <div>
        <h1 className="font-heading text-2xl font-semibold">Podsumowanie</h1>
        <p className="mt-1 text-ink/60">Moduł {modul}: {modulInfo.tytul}</p>

        {umiane.length > 0 && (
          <div className="mt-6 rounded-2xl border border-[#6f8f6a]/50 bg-[#6f8f6a]/10 p-4">
            <h2 className="font-heading font-semibold">To już umiesz</h2>
            <ul className="mt-2 space-y-1 text-sm">
              {umiane.map((p) => (
                <li key={p.p}>{p.p}</li>
              ))}
            </ul>
          </div>
        )}

        {doPowrotu.length > 0 && (
          <div className="mt-4 rounded-2xl border border-line bg-panel p-4">
            <h2 className="font-heading font-semibold">Do tego warto wrócić</h2>
            <ul className="mt-2 space-y-1 text-sm">
              {doPowrotu.map((p) => (
                <li key={p.p}>{p.p}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={zacznijOdNowa} className="rounded-xl border border-line px-4 py-3 text-sm font-medium">
            Powtórz quiz
          </button>
          <button type="button" onClick={() => navigate(`/modul/${modul}`)} className="rounded-xl bg-ink px-4 py-3 text-sm font-medium text-bg">
            Wróć do modułu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm font-medium uppercase tracking-wide text-ink/50">
        Moduł {modul} · pytanie {indeksPytania + 1} / {quiz.pytania.length}
      </p>
      <h1 className="mt-2 font-heading text-xl font-semibold leading-relaxed">{pytanie.p}</h1>

      <div className="mt-6 space-y-3">
        {opcje.map(({ tekst, indeksOryginalny }) => {
          const wybrana = wybranyIndeks === indeksOryginalny;
          const poprawna = indeksOryginalny === pytanie.poprawna;
          let klasa = "border-line bg-bg";
          if (wybranyIndeks !== null) {
            if (poprawna) klasa = "border-[#6f8f6a] bg-[#6f8f6a]/10";
            else if (wybrana) klasa = "border-[#a85c50] bg-[#a85c50]/10";
          }
          return (
            <button
              key={indeksOryginalny}
              type="button"
              onClick={() => wybierz(indeksOryginalny)}
              disabled={wybranyIndeks !== null}
              className={`w-full rounded-xl border px-4 py-3 text-left text-base ${klasa} disabled:cursor-default`}
            >
              {tekst}
            </button>
          );
        })}
      </div>

      {wybranyIndeks !== null && (
        <div className="mt-6 rounded-2xl border border-line bg-panel p-4">
          <p className="font-medium">{wybranyIndeks === pytanie.poprawna ? "Dokładnie tak." : "Nie tym razem. Zobacz dlaczego:"}</p>
          <p className="mt-2 text-sm leading-relaxed">{pytanie.wyjasnienie}</p>
          <button type="button" onClick={dalej} className="mt-4 rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-bg">
            {indeksPytania + 1 < quiz.pytania.length ? "Dalej" : "Zobacz podsumowanie"}
          </button>
        </div>
      )}
    </div>
  );
}
