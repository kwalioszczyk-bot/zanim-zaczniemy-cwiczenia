import { useState, type FormEvent } from "react";
import { verifyToken } from "../lib/auth";
import { navigate } from "../router";

export function StartPage() {
  const [token, setToken] = useState("");
  const [zaakceptowano, setZaakceptowano] = useState(false);
  const [status, setStatus] = useState<"idle" | "checking" | "error">("idle");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!zaakceptowano) return;
    setStatus("checking");
    const ok = await verifyToken(token);
    if (ok) {
      navigate("/pulpit");
    } else {
      setStatus("error");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <img src="./logo.png" alt="Centrum Psychologii i Psychoedukacji NewWay" className="mx-auto mb-6 h-24 w-24 rounded-full" />
        <h1 className="text-center font-heading text-2xl font-semibold leading-snug">Zanim zaczniemy — ćwiczenia</h1>
        <p className="mt-2 text-center text-sm text-ink/70">
          Ta aplikacja jest częścią Treningu Umiejętności Rodzicielskich. Wejście na indywidualny token, bez zakładania konta.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="token" className="mb-1.5 block text-sm font-medium">
              Token dostępu
            </label>
            <input
              id="token"
              type="text"
              autoComplete="off"
              autoCapitalize="characters"
              placeholder="TUR-2026-XXXX"
              className="w-full rounded-xl border border-line bg-bg px-4 py-3 text-center text-lg tracking-wide focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
                if (status === "error") setStatus("idle");
              }}
            />
          </div>

          {status === "error" && (
            <p role="alert" className="text-sm text-[#a85c50]">
              Ten token nie pasuje do żadnego z wydanych. Sprawdź, czy wpisałaś / wpisałeś go dokładnie tak, jak dostałaś / dostałeś.
            </p>
          )}

          <label className="flex items-start gap-3 text-sm leading-relaxed text-ink/80">
            <input
              type="checkbox"
              checked={zaakceptowano}
              onChange={(e) => setZaakceptowano(e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 rounded border-line"
            />
            <span>
              Akceptuję{" "}
              <a href="#/regulamin" target="_blank" rel="noopener" className="underline">
                Regulamin
              </a>{" "}
              i{" "}
              <a href="#/prywatnosc" target="_blank" rel="noopener" className="underline">
                Politykę prywatności
              </a>
              .
            </span>
          </label>

          <button
            type="submit"
            disabled={status === "checking" || !token.trim() || !zaakceptowano}
            className="w-full rounded-xl bg-ink px-4 py-3 text-base font-medium text-bg disabled:opacity-50"
          >
            {status === "checking" ? "Sprawdzam…" : "Wejdź"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs leading-relaxed text-ink/60">
          To jest prosta bramka dostępu, a nie zabezpieczenie treści programu. Nie udostępniaj tego linku ani tokena dalej.
        </p>
      </div>
    </div>
  );
}
