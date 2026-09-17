import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const tu = fileURLToPath(new URL('.', import.meta.url));
const silnik = resolve(tu, '../engine/src');
const druk = resolve(tu, '../print/src');

export default defineConfig({
  // projekt nie używa PostCSS; pusta konfiguracja odcina szukanie jej w katalogach nadrzędnych
  css: { postcss: { plugins: [] } },
  resolve: {
    alias: [
      { find: /^@klebkowo\/engine$/, replacement: resolve(silnik, 'index.ts') },
      { find: /^@klebkowo\/engine\/(.*)$/, replacement: resolve(silnik, '$1.ts') },
      { find: /^@klebkowo\/print$/, replacement: resolve(druk, 'index.ts') },
    ],
  },
  build: {
    target: 'es2019',
    rollupOptions: {
      input: {
        // paczka prowadzącej: ekran sali, omówienie, druk, tryb projektora
        index: resolve(tu, 'index.html'),
        // paczka stolika: bez pełnej treści gry
        stolik: resolve(tu, 'stolik.html'),
      },
    },
  },
  server: { port: 5174, proxy: { '/api': 'http://localhost:4173' } },
});
