import { expect, test } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'
import { E2E_MEMBER } from './global-setup'

/* The register→dashboard hop depends on the project's "Confirm email"
   setting being OFF; the rest of the loop uses the pre-provisioned member. */
test.describe('member loop', () => {
  /* Reset learner state before every attempt so retries start clean. */
  test.beforeEach(async () => {
    const svc = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false },
    })
    const { data } = await svc.auth.admin.listUsers()
    const uid = data.users.find((u) => u.email === E2E_MEMBER.email)?.id
    if (!uid) throw new Error('e2e member missing — run global setup')
    for (const table of ['lesson_progress', 'bookmarks', 'recent_views']) {
      await svc.from(table).delete().eq('user_id', uid)
    }
  })

  test('login → complete lessons → progress states → dashboard → sign out', async ({ page }) => {
    await page.goto('/auth')
    await page.fill('#li-email', E2E_MEMBER.email)
    await page.fill('#li-pass', E2E_MEMBER.password)
    await page.locator('form button[type=submit]').click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 })

    /* Complete the first two lessons. */
    await page.goto('/topics/javascript-basics')
    await page.getByRole('link', { name: /Start this topic|Continue learning/ }).click()
    await expect(page).toHaveURL(/\/lessons\/1/)
    await page.getByRole('button', { name: 'Mark complete' }).click()
    await expect(page.getByText('Lesson marked complete')).toBeVisible()
    await page.locator('.footnav-btn.next').click()
    await expect(page).toHaveURL(/\/lessons\/2/)
    await page.getByRole('button', { name: 'Mark complete' }).click()
    await expect(page.getByRole('button', { name: 'Completed' })).toBeVisible()

    /* Topic page derives ring + done/now rows from real progress rows. */
    await page.goto('/topics/javascript-basics')
    await expect(page.locator('.ring-in b')).toHaveText('15%')
    await expect(page.getByText('2 of 13 lessons finished')).toBeVisible()
    await expect(page.locator('.lesson-row.done')).toHaveCount(2)
    await expect(page.locator('.lesson-row.now')).toHaveCount(1)

    /* Bookmark from the sidebar — the toast is optimistic, so wait for the
       write itself to land before navigating away. */
    const bookmarkWrite = page.waitForResponse((r) => r.url().includes('/rest/v1/bookmarks') && r.request().method() === 'POST')
    await page.getByRole('button', { name: 'Save for later' }).click()
    await expect(page.getByText('Saved to your bookmarks')).toBeVisible()
    await bookmarkWrite

    /* Dashboard: stats RPC + continue learning + recent views. */
    await page.goto('/dashboard')
    await expect(page.locator('.stat-card').nth(1).locator('b')).toHaveText('2')
    await expect(page.locator('.stat-card').nth(0).locator('b')).toHaveText('1')
    await expect(page.locator('.stat-card').nth(3).locator('b')).toHaveText('1')
    await expect(page.locator('#continue')).toContainText('JavaScript Basics')
    await expect(page.locator('.account-main')).toContainText('— lesson 2')

    /* Sign out returns the guest chrome; progress survives re-login. */
    await page.locator('.user-chip').click()
    await page.locator('.dropdown-item', { hasText: 'Sign out' }).click()
    await expect(page.getByRole('link', { name: 'Get started' })).toBeVisible()
    await page.goto('/auth')
    await page.fill('#li-email', E2E_MEMBER.email)
    await page.fill('#li-pass', E2E_MEMBER.password)
    await page.locator('form button[type=submit]').click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 })
    await expect(page.locator('.stat-card').nth(1).locator('b')).toHaveText('2')
  })
})
