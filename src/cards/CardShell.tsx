import type { ReactNode } from "react";
import { SavedIndicator } from "../components/SavedIndicator";

interface Props {
  tytul: string;
  wstep: string;
  podpowiedz: string;
  ostrzezenie?: string;
  doWydruku?: boolean;
  saved: boolean;
  children: ReactNode;
}

export function CardShell({ tytul, wstep, podpowiedz, ostrzezenie, doWydruku, saved, children }: Props) {
  return (
    <article className="print-page">
      <div className="no-print mb-4 flex items-start justify-between gap-4">
        <h1 className="font-heading text-2xl font-semibold">{tytul}</h1>
        {doWydruku && (
          <button
            type="button"
            onClick={() => window.print()}
            className="shrink-0 rounded-xl border border-line px-3 py-2 text-sm font-medium hover:bg-panel"
          >
            Drukuj
          </button>
        )}
      </div>
      <h1 className="hidden print:block font-heading text-2xl font-semibold mb-4">{tytul}</h1>

      <p className="text-base leading-relaxed text-ink/90">{wstep}</p>

      {ostrzezenie && (
        <div className="mt-4 rounded-2xl border border-accent/50 bg-panel px-4 py-3 text-sm leading-relaxed">
          <span className="font-medium">Zanim zaczniesz: </span>
          {ostrzezenie}
        </div>
      )}

      <div className="mt-6 space-y-6">{children}</div>

      <div className="mt-8 rounded-2xl border border-line bg-panel px-4 py-4 text-sm leading-relaxed text-ink/90">
        <span className="font-medium">Podpowiedź: </span>
        {podpowiedz}
      </div>

      <div className="no-print mt-4 flex justify-end">
        <SavedIndicator visible={saved} />
      </div>
    </article>
  );
}
