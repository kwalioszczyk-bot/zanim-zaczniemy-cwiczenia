import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Projekt nie korzysta z PostCSS; pusta konfiguracja odcina szukanie jej w katalogach nadrzędnych.
  css: { postcss: { plugins: [] } },
  test: {
    include: ['packages/*/test/**/*.test.ts'],
    environment: 'node',
    reporters: 'default',
  },
});
