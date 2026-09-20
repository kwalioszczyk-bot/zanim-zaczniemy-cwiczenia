/**
 * Punkt wejścia paczki stolika.
 * Do tej paczki NIE trafia pełna treść gry — urządzenie stolika pobiera z serwera
 * wyłącznie treść przyciętą (bez klucza decyzji, skutków i ukrytych liczników).
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../styl/podstawy.css';
import '../styl/elementy.css';
import { AplikacjaStolika } from './Aplikacja.tsx';
import { Karteczka, Przycisk } from '../ui/podstawowe.tsx';
import { Doodle } from '../ui/Doodle.tsx';
import { wlaczTrybOffline } from '../lib/offline.ts';
import { useState } from 'react';

function kodZeSciezki(): string {
  const czesci = window.location.pathname.split('/').filter(Boolean);
  return (czesci[1] ?? '').toUpperCase();
}

function Wejscie() {
  const [kod, ustawKod] = useState('');
  return (
    <main className="uklad">
      <header style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <Doodle nazwa="kot" rozmiar={90} kolor="#7db83a" />
        <h1>KŁĘBKOWO</h1>
        <p style={{ fontFamily: "'Caveat', cursive", fontSize: '1.4rem' }}>Sprawa się plącze</p>
      </header>
      <Karteczka tytul="Kod stolika" doodle="kartka" tasma>
        <p>Wpiszcie czteroznakowy kod, który pokazała prowadząca. Jedno urządzenie na stolik.</p>
        <div className="pole">
          <label className="pole__etykieta" htmlFor="kod">
            Kod stolika
          </label>
          <input
            id="kod"
            value={kod}
            maxLength={4}
            autoCapitalize="characters"
            style={{ fontSize: '1.8rem', letterSpacing: '0.3em', textAlign: 'center', fontFamily: "'Caveat Brush', cursive" }}
            onChange={(e) => ustawKod(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
          />
        </div>
        <Przycisk
          wariant="glowny"
          rozmiar="duzy"
          szeroki
          disabled={kod.length < 4}
          onClick={() => {
            window.location.pathname = `/stolik/${kod}`;
          }}
        >
          Wchodzimy do gry
        </Przycisk>
      </Karteczka>
    </main>
  );
}

function Start() {
  const kod = kodZeSciezki();
  return kod ? <AplikacjaStolika kod={kod} /> : <Wejscie />;
}

wlaczTrybOffline();

createRoot(document.getElementById('korzen')!).render(
  <StrictMode>
    <Start />
  </StrictMode>,
);
