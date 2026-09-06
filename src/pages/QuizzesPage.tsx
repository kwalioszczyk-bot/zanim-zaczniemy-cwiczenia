import trescJson from "../data/tresc-aplikacji.json";
import type { TrescAplikacji } from "../types";
import { Link } from "../router";
import { isQuizDone } from "../lib/storage";
import { useAppState } from "../hooks/useAppState";

const dane = trescJson as TrescAplikacji;

export function QuizzesPage() {
  useAppState();

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold">Quizy</h1>
      <p className="mt-1 text-sm text-ink/60">Cztery pytania do każdego modułu. Bez ocen — tylko po to, żeby sprawdzić, co już wiesz.</p>

      <div className="mt-6 space-y-3">
        {dane.quizy.map((quiz) => {
          const modul = dane.moduly.find((m) => m.nr === quiz.modul);
          const gotowy = isQuizDone(quiz.modul);
          return (
            <Link key={quiz.modul} to={`/quiz/${quiz.modul}`} className="flex items-center justify-between rounded-2xl border border-line p-4 hover:bg-panel">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Moduł {quiz.modul}</p>
                <h2 className="mt-1 font-heading text-lg font-semibold">{modul?.tytul}</h2>
              </div>
              <span className={`shrink-0 text-sm ${gotowy ? "text-[#6f8f6a]" : "text-ink/50"}`}>{gotowy ? "ukończony" : "→"}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
