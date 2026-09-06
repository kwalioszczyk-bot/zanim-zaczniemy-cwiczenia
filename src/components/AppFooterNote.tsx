/** Stały opis gabinetu i zasad anonimowości — ma być widoczny na każdym ekranie aplikacji. */
export function AppFooterNote() {
  return (
    <p className="mx-auto max-w-3xl px-4 py-4 text-xs leading-relaxed" style={{ color: "#8a8078" }}>
      Aplikacja Centrum Psychologii i Psychoedukacji NewWay — Katarzyna Walioszczyk-Urbaniak, pedagog, psycholog. Narzędzie dla
      uczestniczek i uczestników Treningu Umiejętności Rodzicielskich. Dostęp na indywidualny token.
      <br />
      <strong className="font-medium" style={{ color: "#8a8078" }}>
        Pracujesz anonimowo.
      </strong>{" "}
      Nie pytamy o Twoje imię ani dane dziecka. Wszystko, co tu wpiszesz, zostaje wyłącznie w tym urządzeniu — nie trafia na żaden serwer i
      nikt poza Tobą tego nie widzi, także prowadząca.
      <br />
      Materiał psychoedukacyjny; nie zastępuje konsultacji ani terapii.
    </p>
  );
}
