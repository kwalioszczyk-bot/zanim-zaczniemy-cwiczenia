// Typy opisujące strukturę src/data/tresc-aplikacji.json.
// Renderer kart (src/cards) jest generyczny — zmiana treści w JSON nie wymaga zmian w kodzie,
// o ile trzyma się tych kształtów.

export type PoleTyp =
  | "tekst"
  | "tekstDlugi"
  | "liczba"
  | "skala"
  | "wybor"
  | "wieloWybor"
  | "wieloWyborZDopisem"
  | "tak_nie"
  | "data"
  | "godzina";

export interface PoleDef {
  klucz: string;
  etykieta: string;
  typ: PoleTyp;
  wiersze?: number;
  min?: number;
  max?: number;
  opcje?: string[];
  placeholder?: string;
}

export interface Modul {
  nr: number;
  tytul: string;
  temat: string;
}

interface KartaBase {
  id: string;
  modul: number;
  tytul: string;
  wstep: string;
  podpowiedz: string;
  ostrzezenie?: string;
  doWydruku?: boolean;
}

export interface KartaPojedyncza extends KartaBase {
  typ: "pojedyncza";
  pola: PoleDef[];
}

export interface KartaPowtarzalna extends KartaBase {
  typ: "powtarzalna";
  maksWpisow: number;
  pola: PoleDef[];
}

export interface KartaTydzien extends KartaBase {
  typ: "tydzien";
  poleDnia: PoleDef[];
  polaStale?: PoleDef[];
  licznikDzienny?: { klucz: string; etykieta: string; cel: number };
}

export interface LicznikDef {
  klucz: string;
  etykieta: string;
  kierunek: "rosnie" | "maleje";
}

export interface KartaLicznik extends KartaBase {
  typ: "licznik";
  liczniki: LicznikDef[];
}

export interface KartaLista extends KartaBase {
  typ: "lista";
  liczbaPol: number;
  placeholder?: string;
}

export interface KartaSkalaWielokrotna extends KartaBase {
  typ: "skalaWielokrotna";
  pozycje: string[];
  skala: { min: number; max: number; opisMin: string; opisMax: string };
}

export interface KolumnaDef {
  klucz: string;
  etykieta: string;
  opis: string;
  kolor: string;
  limit?: number;
}

export interface KartaTrzyKolumny extends KartaBase {
  typ: "trzyKolumny";
  kolumny: KolumnaDef[];
}

export interface KartaRutyna extends KartaBase {
  typ: "rutyna";
  polaStale: PoleDef[];
  kroki: { min: number; maks: number; etykieta: string };
  ocenaDzienna: { klucz: string; etykieta: string; min: number; max: number; dni: number };
}

export interface KartaWykresDwaTygodnie extends KartaBase {
  typ: "wykresDwaTygodnie";
  polaStale: PoleDef[];
  poleDnia: PoleDef[];
}

export interface KartaZasady extends KartaBase {
  typ: "zasady";
  maksZasad: number;
  polaZasady: PoleDef[];
  podpisy?: boolean;
}

export interface PoziomTermometru {
  poziom: string;
  kolor: string;
  pola: string[];
}

export interface KartaTermometr extends KartaBase {
  typ: "termometr";
  poziomy: PoziomTermometru[];
}

export interface SekcjaPlanuAwaryjnego {
  klucz: string;
  etykieta: string;
  typ: "wieloWyborZDopisem";
  opcje: string[];
}

export interface KartaPlanAwaryjny extends KartaBase {
  typ: "planAwaryjny";
  sekcje: (SekcjaPlanuAwaryjnego | PoleDef)[];
  stalyKrok: string[];
}

export interface KartaPrzeglad extends KartaBase {
  typ: "przeglad";
  pytania: PoleDef[];
  komunikatWspierajacy: string;
}

export interface SekcjaPodtrzymania {
  klucz: string;
  etykieta: string;
  typ: "lista" | "tekstDlugi";
  liczbaPol?: number;
  wiersze?: number;
}

export interface KartaPlanPodtrzymania extends KartaBase {
  typ: "planPodtrzymania";
  sekcje: SekcjaPodtrzymania[];
}

export type KartaPracy =
  | KartaPojedyncza
  | KartaPowtarzalna
  | KartaTydzien
  | KartaLicznik
  | KartaLista
  | KartaSkalaWielokrotna
  | KartaTrzyKolumny
  | KartaRutyna
  | KartaWykresDwaTygodnie
  | KartaZasady
  | KartaTermometr
  | KartaPlanAwaryjny
  | KartaPrzeglad
  | KartaPlanPodtrzymania;

export interface Pytanie {
  p: string;
  opcje: string[];
  poprawna: number;
  wyjasnienie: string;
}

export interface Quiz {
  modul: number;
  pytania: Pytanie[];
}

export interface Zabawa {
  tytul: string;
  wiek: string;
  czas: string;
  materialy: string;
  modul: number;
  jak: string;
  poco: string;
}

export interface PytanieOdpowiedz {
  kategoria: string;
  pytanie: string;
  odpowiedz: string;
}

export interface KontaktKryzysowy {
  nazwa: string;
  numer: string;
  opis: string;
}

export interface Kryzys {
  komunikat: string;
  kontakty: KontaktKryzysowy[];
}

export interface TrescAplikacji {
  meta: { program: string; autor: string; wersja: string; jezyk: string };
  moduly: Modul[];
  kartyPracy: KartaPracy[];
  quizy: Quiz[];
  zabawy: Zabawa[];
  pytaniaOdpowiedzi: PytanieOdpowiedz[];
  kryzys: Kryzys;
}

// Typy opisujące src/data/analiza-skutecznosci.json — dane do modułu „Co działa".

export interface JakCzytac {
  wielkoscEfektu: string;
  wagaRegresji: string;
  ostrzezenie: string;
}

export interface PunktWykresuBar {
  etykieta: string;
  wartosc: number;
  kierunek?: "wzmacnia" | "oslabia";
  wModule?: number[];
  dolny?: number;
  gorny?: number;
}

export interface WykresBar {
  tytul: string;
  podtytul: string;
  typ: "slupkowy_poziomy" | "slupkowy_zPrzedzialem" | "slupkowy";
  jednostka: string;
  dane: PunktWykresuBar[];
  wniosek: string;
  zrodlo: string;
}

export interface WynikListy {
  etykieta: string;
  wynik: string;
}

export interface WykresListaWynikow {
  tytul: string;
  podtytul: string;
  typ: "listaWynikow";
  dane: WynikListy[];
  wniosek: string;
  zrodlo: string;
}

export interface WykresKomunikat {
  tytul: string;
  podtytul: string;
  typ: "komunikat";
  trescGlowna: string;
  wniosek: string;
  zrodlo: string;
}

export interface ObszarPraktyki {
  id: string;
  nazwa: string;
  wagaBadawcza: number;
  moduly: number[];
  zrodlaWpisow: string[];
  opisWagi: string;
}

export interface KomunikatyZwrotne {
  brakDanych: string;
  malo: string;
  mocnaStrona: string;
  lukaWaznaObszar: string;
  rownomiernie: string;
}

export interface AnalizaSkutecznosci {
  meta: { tytul: string; opis: string; aktualizacja: string };
  jakCzytac: JakCzytac;
  wykres1_komponenty: WykresBar;
  wykres2_techniki: WykresBar;
  wykres3_poziomy: WykresBar;
  wykres4_kontekst: WykresListaWynikow;
  wykres5_trwalosc: WykresKomunikat;
  obszaryPraktyki: ObszarPraktyki[];
  komunikatyZwrotne: KomunikatyZwrotne;
  notaKoncowa: string;
}
