import { useState, type ReactNode } from "react";
import { Link } from "../router";
import { HelpButton } from "./HelpPanel";
import { AppFooterNote } from "./AppFooterNote";

const NAV_LINKS: { to: string; label: string }[] = [
  { to: "/pulpit", label: "Pulpit" },
  { to: "/karty", label: "Karty pracy" },
  { to: "/quizy", label: "Quizy" },
  { to: "/zabawy", label: "Zabawy" },
  { to: "/co-dziala", label: "Co działa" },
  { to: "/pytania", label: "Pytania i odpowiedzi" },
  { to: "/moje-wpisy", label: "Moje wpisy" },
  { to: "/ustawienia", label: "Ustawienia" },
];

export function Layout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="no-print sticky top-0 z-30 flex items-center justify-between border-b border-line bg-bg/95 px-4 py-3 backdrop-blur">
        <Link to="/pulpit" className="flex items-center gap-2 font-heading text-base font-semibold">
          <img src="./logo.png" alt="" className="h-8 w-8 rounded-full" />
          Zanim zaczniemy
        </Link>
        <button
          type="button"
          aria-label={menuOpen ? "Zamknij menu" : "Otwórz menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="rounded-xl border border-line p-2"
        >
          {menuOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </header>

      {menuOpen && (
        <nav aria-label="Nawigacja główna" className="no-print fixed inset-0 z-20 flex flex-col bg-bg pt-16">
          <ul className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-4">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="block rounded-xl px-4 py-4 text-lg hover:bg-panel"
                  ariaLabel={link.label}
                >
                  <span onClick={() => setMenuOpen(false)}>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="border-t border-line p-4">
            <HelpButton className="w-full justify-center" />
          </div>
        </nav>
      )}

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-24 pt-6">{children}</main>

      <footer className="no-print border-t border-line px-4 py-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-4 text-sm text-ink/70">
            <Link to="/prywatnosc" className="underline">
              Prywatność
            </Link>
            <Link to="/regulamin" className="underline">
              Regulamin
            </Link>
          </div>
          <HelpButton />
        </div>
        <AppFooterNote />
      </footer>
    </div>
  );
}
