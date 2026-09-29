/**
 * Wariant „pokaz”: ta sama aplikacja zbudowana tak, żeby dało się ją otworzyć z dowolnego
 * adresu, bez własnego serwera. Ścieżki względne, adresy w odnośniku, jedno wejście.
 * Do sali szkoleniowej służy zwykły build (`npm run build`) razem z serwerem.
 */
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const tu = fileURLToPath(new URL('.', import.meta.url));
const silnik = resolve(tu, '../engine/src');
const druk = resolve(tu, '../print/src');

export default defineConfig({
  base: './',
  define: {
    'import.meta.env.VITE_TRYB_HASH': '"1"',
    'import.meta.env.VITE_POKAZ': '"1"',
  },
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
    outDir: 'pokaz',
    emptyOutDir: true,
    rollupOptions: { input: { index: resolve(tu, 'index.html') } },
  },
  plugins: [
    react(),
    {
      // czcionki w podglądzie druku ładują się względem strony, nie od korzenia serwera
      name: 'klebkowo-wzgledne-czcionki',
      generateBundle(_opcje, paczka) {
        for (const [nazwa, plik] of Object.entries(paczka))
          if (nazwa.endsWith('.css') && plik.type === 'asset' && typeof plik.source === 'string')
            plik.source = plik.source.replaceAll("url('/fonts/", "url('../fonts/");
      },
    },
  ],
});
