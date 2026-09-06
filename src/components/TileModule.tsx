import type { Modul } from "../types";
import { Link } from "../router";
import { ProgressBar } from "./ProgressBar";
import { policzPostepModulu } from "../lib/progress";
import { useAppState } from "../hooks/useAppState";

export function TileModule({ modul }: { modul: Modul }) {
  useAppState();
  const postep = policzPostepModulu(modul.nr);

  return (
    <Link to={`/modul/${modul.nr}`} className="block rounded-2xl border border-line bg-panel p-5 transition-colors hover:bg-line/30">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-ink/50">Moduł {modul.nr}</span>
        {postep.procent === 100 && <span className="text-xs font-medium text-[#6f8f6a]">ukończony</span>}
      </div>
      <h3 className="mt-1 font-heading text-lg font-semibold leading-snug">{modul.tytul}</h3>
      <p className="mt-1 text-sm text-ink/60">{modul.temat}</p>
      <div className="mt-4">
        <ProgressBar procent={postep.procent} />
      </div>
    </Link>
  );
}
