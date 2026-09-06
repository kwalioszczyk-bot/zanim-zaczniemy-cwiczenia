import { useState } from "react";
import type { KartaPracy } from "../types";
import { CardShell } from "./CardShell";
import { SavedProvider } from "./SavedContext";
import { LicznikCard, ListaCard, PojedynczaCard, PowtarzalnaCard } from "./simpleCards";
import { RutynaCard, TydzienCard, WykresDwaTygodnieCard } from "./weekCards";
import { SkalaWielokrotnaCard, TermometrCard, TrzyKolumnyCard, ZasadyCard } from "./structuredCards";
import { PlanAwaryjnyCard, PlanPodtrzymaniaCard, PrzegladCard } from "./reflectiveCards";

export function CardRenderer({ karta }: { karta: KartaPracy }) {
  const [saved, setSaved] = useState(false);

  return (
    <SavedProvider onVisibleChange={setSaved}>
      <CardShell
        tytul={karta.tytul}
        wstep={karta.wstep}
        podpowiedz={karta.podpowiedz}
        ostrzezenie={karta.ostrzezenie}
        doWydruku={karta.doWydruku}
        saved={saved}
      >
        {renderujTresc(karta)}
      </CardShell>
    </SavedProvider>
  );
}

function renderujTresc(karta: KartaPracy) {
  switch (karta.typ) {
    case "pojedyncza":
      return <PojedynczaCard karta={karta} />;
    case "powtarzalna":
      return <PowtarzalnaCard karta={karta} />;
    case "tydzien":
      return <TydzienCard karta={karta} />;
    case "licznik":
      return <LicznikCard karta={karta} />;
    case "lista":
      return <ListaCard karta={karta} />;
    case "skalaWielokrotna":
      return <SkalaWielokrotnaCard karta={karta} />;
    case "trzyKolumny":
      return <TrzyKolumnyCard karta={karta} />;
    case "rutyna":
      return <RutynaCard karta={karta} />;
    case "wykresDwaTygodnie":
      return <WykresDwaTygodnieCard karta={karta} />;
    case "zasady":
      return <ZasadyCard karta={karta} />;
    case "termometr":
      return <TermometrCard karta={karta} />;
    case "planAwaryjny":
      return <PlanAwaryjnyCard karta={karta} />;
    case "przeglad":
      return <PrzegladCard karta={karta} />;
    case "planPodtrzymania":
      return <PlanPodtrzymaniaCard karta={karta} />;
    default:
      return null;
  }
}
