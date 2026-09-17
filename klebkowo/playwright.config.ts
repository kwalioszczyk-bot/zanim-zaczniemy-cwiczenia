import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4199',
    // gra nigdy nie wychodzi poza własny serwer — w testach też tego pilnujemy
    trace: 'off',
  },
  webServer: {
    command: 'node --import tsx packages/server/src/main.ts',
    url: 'http://localhost:4199/api/zdrowie',
    reuseExistingServer: false,
    env: { PORT: '4199', KATALOG_SESJI: '.sesje-e2e' },
    timeout: 60_000,
  },
});
