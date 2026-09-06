import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./fonts.css";
import "./index.css";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Tylko w wersji produkcyjnej — pod serwerem deweloperskim Vite service worker przechwytuje
// zapytania o moduły i HMR, co potrafi trwale rozsynchronizować ładowane wersje React.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      // Brak service workera nie blokuje działania aplikacji — po prostu nie będzie offline.
    });
  });
}
