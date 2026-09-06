import trescJson from "../data/tresc-aplikacji.json";
import type { TrescAplikacji } from "../types";
import { getState } from "./storage";

const dane = trescJson as TrescAplikacji;

export interface PostepModulu {
  modul: number;
  kartyRazem: number;
  kartyUkonczone: number;
  quizUkonczony: boolean;
  procent: number;
}

function czyWpisPusty(wartosc: unknown): boolean {
  if (wartosc == null) return true;
  if (Array.isArray(wartosc)) return wartosc.length === 0;
  if (typeof wartosc === "object") return Object.keys(wartosc as object).length === 0;
  if (typeof wartosc === "string") return wartosc.trim() === "";
  return false;
}

export function policzPostepModulu(nrModulu: number): PostepModulu {
  const state = getState();
  const karty = dane.kartyPracy.filter((k) => k.modul === nrModulu);
  const kartyUkonczone = karty.filter((k) => !czyWpisPusty(state.wpisyKart[k.id])).length;
  const quizUkonczony = !!state.ukonczoneQuizy[nrModulu];

  const kartyRazem = karty.length;
  const elementowRazem = kartyRazem + 1; // +1 za quiz
  const elementowGotowych = kartyUkonczone + (quizUkonczony ? 1 : 0);

  return {
    modul: nrModulu,
    kartyRazem,
    kartyUkonczone,
    quizUkonczony,
    procent: elementowRazem === 0 ? 0 : Math.round((elementowGotowych / elementowRazem) * 100),
  };
}

export function policzPostepCalosci(): { procent: number } {
  const wyniki = dane.moduly.map((m) => policzPostepModulu(m.nr));
  const suma = wyniki.reduce((acc, w) => acc + w.procent, 0);
  return { procent: wyniki.length === 0 ? 0 : Math.round(suma / wyniki.length) };
}
