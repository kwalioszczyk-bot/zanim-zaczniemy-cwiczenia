import { useRef, useState } from "react";
import { exportStateJSON, importStateJSON, wipeAllData } from "../lib/storage";
import { downloadTextFile, dzisiajDoNazwyPliku, readTextFile } from "../lib/files";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { signOut } from "../lib/auth";
import { navigate } from "../router";
import analizaJson from "../data/analiza-skutecznosci.json";
import type { AnalizaSkutecznosci } from "../types";

const analiza = analizaJson as AnalizaSkutecznosci;

export function SettingsPage() {
  const plikRef = useRef<HTMLInputElement>(null);
  const [potwierdzUsuniecie, setPotwierdzUsuniecie] = useState(false);
  const [komunikatImportu, setKomunikatImportu] = useState<string | null>(null);

  const pobierzJSON = () => downloadTextFile(`kopia-zapasowa-${dzisiajDoNazwyPliku()}.json`, exportStateJSON());

  const wczytajPlik = async (file: File) => {
    const tresc = await readTextFile(file);
    const wynik = importStateJSON(tresc);
    setKomunikatImportu(wynik.ok ? "Wczytano kopię zapasową." : wynik.error);
  };

  const usunWszystko = () => {
    wipeAllData();
    setPotwierdzUsuniecie(false);
    navigate("/");
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold">Ustawienia</h1>

      <section className="mt-6 rounded-2xl border border-line p-5">
        <h2 className="font-heading text-lg font-semibold">Prywatność</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink/80">
          Wszystko, co tu wpisujesz, zostaje wyłącznie w pamięci tej przeglądarki na tym urządzeniu. Nie ma kont, nie ma serwera, nie ma
          analityki. Nikt — łącznie z autorką programu — nie ma wglądu w Twoje odpowiedzi.
        </p>
        <p className="mt-3 text-xs text-ink/50">Przegląd badań w module „Co działa" zaktualizowano: {analiza.meta.aktualizacja}.</p>
      </section>

      <section className="mt-6 rounded-2xl border border-line p-5">
        <h2 className="font-heading text-lg font-semibold">Kopia zapasowa</h2>
        <p className="mt-2 text-sm text-ink/70">
          Eksportuj wszystkie wpisy do pliku JSON — możesz go potem wczytać na tym samym lub innym urządzeniu. Sam plik trzymaj tak, jak
          trzymasz inne prywatne dokumenty.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={pobierzJSON} className="rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-bg">
            Pobierz kopię JSON
          </button>
          <button type="button" onClick={() => plikRef.current?.click()} className="rounded-xl border border-line px-4 py-2.5 text-sm font-medium">
            Wczytaj kopię z pliku
          </button>
          <input
            ref={plikRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) wczytajPlik(file);
              e.target.value = "";
            }}
          />
        </div>
        {komunikatImportu && <p className="mt-3 text-sm text-ink/70">{komunikatImportu}</p>}

        <p className="mt-4 text-sm text-ink/70">
          Pełny, drukowalny eksport wszystkich wpisów znajdziesz w{" "}
          <a href="#/moje-wpisy" className="underline">
            Moich wpisach
          </a>{" "}
          — przycisk „Eksportuj do PDF”.
        </p>
      </section>

      <section className="mt-6 rounded-2xl border border-line p-5">
        <h2 className="font-heading text-lg font-semibold">Dostęp</h2>
        <p className="mt-2 text-sm text-ink/70">Możesz wylogować się z tego urządzenia — przy kolejnym wejściu poprosimy o token ponownie.</p>
        <button
          type="button"
          onClick={() => {
            signOut();
            navigate("/");
          }}
          className="mt-4 rounded-xl border border-line px-4 py-2.5 text-sm font-medium"
        >
          Wyloguj
        </button>
      </section>

      <section className="mt-6 rounded-2xl border border-[#a85c50]/40 p-5">
        <h2 className="font-heading text-lg font-semibold">Usuń wszystkie moje dane</h2>
        <p className="mt-2 text-sm text-ink/70">
          Usuwa natychmiast i nieodwracalnie wszystkie wpisy, notatki i ustawienia z tego urządzenia. Zrób najpierw kopię zapasową, jeśli
          chcesz coś zachować.
        </p>
        <button type="button" onClick={() => setPotwierdzUsuniecie(true)} className="mt-4 rounded-xl bg-[#a85c50] px-4 py-2.5 text-sm font-medium text-bg">
          Usuń wszystkie moje dane
        </button>
      </section>

      <ConfirmDialog
        open={potwierdzUsuniecie}
        title="Usunąć wszystkie dane?"
        description="Ta operacja jest natychmiastowa i nieodwracalna. Wszystkie karty, quizy, notatki i ulubione zabawy znikną z tego urządzenia."
        confirmLabel="Usuń wszystko"
        danger
        onConfirm={usunWszystko}
        onCancel={() => setPotwierdzUsuniecie(false)}
      />
    </div>
  );
}
