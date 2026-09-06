import { useEffect } from "react";
import { RouterProvider, useRoute, navigate } from "./router";
import { isSessionValid } from "./lib/auth";
import { Layout } from "./components/Layout";
import { StartPage } from "./pages/StartPage";
import { Dashboard } from "./pages/Dashboard";
import { ModulePage } from "./pages/ModulePage";
import { CardsLibrary } from "./pages/CardsLibrary";
import { CardPage } from "./pages/CardPage";
import { QuizzesPage } from "./pages/QuizzesPage";
import { QuizPage } from "./pages/QuizPage";
import { GamesPage } from "./pages/GamesPage";
import { QAPage } from "./pages/QAPage";
import { MyEntriesPage } from "./pages/MyEntriesPage";
import { SettingsPage } from "./pages/SettingsPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { TermsPage } from "./pages/TermsPage";
import { HelpPanelPage } from "./components/HelpPanel";
import { AnalysisPage } from "./pages/AnalysisPage";
import { AppFooterNote } from "./components/AppFooterNote";

const PUBLICZNE_SEGMENTY = new Set(["", "pomoc", "prywatnosc", "regulamin"]);

function Screens() {
  const { segments } = useRoute();
  const [root, param] = segments;
  const zalogowany = isSessionValid();

  useEffect(() => {
    if (!zalogowany && !PUBLICZNE_SEGMENTY.has(root ?? "")) {
      navigate("/");
    }
  }, [root, zalogowany]);

  if (root === "pomoc") return <HelpPanelPage />;
  if (root === "prywatnosc") return <PrivacyPage />;
  if (root === "regulamin") return <TermsPage />;

  if (!zalogowany) return <StartPage />;

  switch (root) {
    case undefined:
    case "":
    case "pulpit":
      return <Dashboard />;
    case "modul":
      return <ModulePage nr={Number(param)} />;
    case "karty":
      return <CardsLibrary />;
    case "karta":
      return <CardPage id={param} />;
    case "quizy":
      return <QuizzesPage />;
    case "quiz":
      return <QuizPage modul={Number(param)} />;
    case "zabawy":
      return <GamesPage />;
    case "pytania":
      return <QAPage />;
    case "moje-wpisy":
      return <MyEntriesPage />;
    case "co-dziala":
      return <AnalysisPage />;
    case "ustawienia":
      return <SettingsPage />;
    default:
      return <Dashboard />;
  }
}

function Shell() {
  const { segments } = useRoute();
  const root = segments[0] ?? "";
  const zalogowany = isSessionValid();
  const bezRamki = !zalogowany || root === "pomoc" || root === "prywatnosc" || root === "regulamin";

  if (bezRamki) {
    return (
      <>
        <Screens />
        <div className="no-print">
          <AppFooterNote />
        </div>
      </>
    );
  }
  return (
    <Layout>
      <Screens />
    </Layout>
  );
}

export function App() {
  return (
    <RouterProvider>
      <Shell />
    </RouterProvider>
  );
}
