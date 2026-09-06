import { useEffect, useRef } from "react";
import trescJson from "../data/tresc-aplikacji.json";
import type { TrescAplikacji } from "../types";

const dane = trescJson as TrescAplikacji;

export function HelpButton({ className = "" }: { className?: string }) {
  return (
    <a
      href="#/pomoc"
      className={
        "inline-flex items-center gap-2 rounded-xl border border-line bg-panel px-4 py-3 text-sm font-medium text-ink hover:bg-line/40 focus:outline-none " +
        className
      }
    >
      <span aria-hidden="true">☕</span>
      Potrzebuję pomocy teraz
    </a>
  );
}

export function HelpPanelPage() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-heading font-semibold outline-none">
        Wsparcie
      </h1>
      <p className="mt-4 text-lg leading-relaxed">{dane.kryzys.komunikat}</p>

      <ul className="mt-8 space-y-4">
        {dane.kryzys.kontakty.map((k) => (
          <li key={k.nazwa} className="rounded-2xl border border-line bg-panel p-5">
            <p className="text-sm text-ink/70">{k.opis}</p>
            <p className="mt-1 font-heading text-xl font-semibold">{k.nazwa}</p>
            <a href={`tel:${k.numer.replace(/\s+/g, "")}`} className="mt-1 inline-block text-2xl font-semibold tracking-wide text-accent underline">
              {k.numer}
            </a>
          </li>
        ))}
      </ul>

      <p className="mt-8 text-sm text-ink/70">
        Nie musisz teraz niczego wyjaśniać ani tłumaczyć. Wystarczy zadzwonić.
      </p>

      <a href="#/" className="mt-8 inline-block text-sm underline text-ink/70">
        ← Wróć do aplikacji
      </a>
    </div>
  );
}
