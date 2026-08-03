import { defineConfig } from '@playwright/test'

/* E2E suite runs against the live Supabase project configured in .env.
   The member/admin specs need ADMIN_EMAIL/ADMIN_PASSWORD and the service
   role key (global-setup provisions and resets the test member). */
export default defineConfig({
  testDir: 'tests/e2e',
  globalSetup: './tests/e2e/global-setup.ts',
  timeout: 45_000,
  retries: 1,
  workers: 1, // specs share the member account's server-side state
  use: {
    baseURL: 'http://localhost:5173',
    viewport: { width: 1280, height: 900 },
  },
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: true,
  },
})
