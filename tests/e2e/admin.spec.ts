import { expect, test } from '@playwright/test'
import { E2E_MEMBER } from './global-setup'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL!
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!

test.describe('admin console', () => {
  test('guards: guest redirected, non-admin rejected', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/admin\/login/)
    await page.fill('#ad-email', E2E_MEMBER.email)
    await page.fill('#ad-pass', E2E_MEMBER.password)
    await page.locator('form button[type=submit]').click()
    await expect(page.getByText("doesn't have admin access")).toBeVisible()
  })

  test('full CRUD: category, topic authoring, publish round-trip, delete', async ({ page }) => {
    test.skip(!ADMIN_EMAIL || !ADMIN_PASSWORD, 'ADMIN_EMAIL / ADMIN_PASSWORD not set in .env')

    await page.goto('/admin/login')
    await page.fill('#ad-email', ADMIN_EMAIL)
    await page.fill('#ad-pass', ADMIN_PASSWORD)
    await page.locator('form button[type=submit]').click()
    await expect(page).toHaveURL(/\/admin$/, { timeout: 15_000 })

    /* Category CRUD */
    await page.goto('/admin/categories')
    await page.getByRole('button', { name: 'Add category' }).click()
    await page.fill('#cat-name', 'E2E Test Category')
    await page.fill('#cat-desc', 'Created by the committed e2e suite.')
    await page.locator('.modal button[type=submit]').click()
    await expect(page.locator("tr:has-text('E2E Test Category')")).toBeVisible()
    const catRow = page.locator("tr:has-text('E2E Test Category')")
    await catRow.locator("[aria-label^='Edit']").click()
    await page.fill('#cat-name', 'E2E Test Category Renamed')
    await page.locator('.modal button[type=submit]').click()
    await expect(page.locator("tr:has-text('E2E Test Category Renamed')")).toBeVisible()

    /* New topic → lesson → publish → live on the learner site */
    await page.goto('/admin/topics/new')
    await page.fill('#ed-name', 'E2E Topic')
    await page.fill('#ed-desc', 'A topic created end-to-end.')
    await page.selectOption('#ed-cat', { label: 'Programming' })
    await page.selectOption('#ed-subcat', { label: 'JavaScript' })
    await page.getByRole('button', { name: 'Save draft' }).click()
    await expect(page).toHaveURL(/\/admin\/topics\/e2e-topic\/edit/, { timeout: 15_000 })

    await page.getByRole('button', { name: 'Add lesson' }).click()
    await page.locator(".lesson-row:has-text('New lesson 1')").click()
    await page.fill('#ed-lesson-body', '## Written by the e2e suite\n\nAuthored in the admin editor.')
    await page.fill('#ed-lesson-mins', '7')
    await page.getByRole('button', { name: 'Publish' }).click()
    await expect(page.getByText('Topic published')).toBeVisible()

    await page.goto('/topics/e2e-topic/lessons/1')
    await expect(page.locator('.prose')).toContainText('Written by the e2e suite')

    /* Draft topics disappear from the public catalog immediately. */
    await page.goto('/admin/topics/e2e-topic/edit')
    await page.getByRole('button', { name: 'Save draft' }).click()
    await expect(page.getByText('Draft saved')).toBeVisible()
    await page.goto('/topics/e2e-topic')
    await expect(page.getByText("We can't find that page")).toBeVisible()

    /* Clean up: delete topic + category through the UI. */
    await page.goto('/admin/topics')
    await page.fill('#topic-search', 'E2E Topic')
    const topicRow = page.locator("tr:has-text('E2E Topic')")
    await topicRow.locator("[aria-label^='Delete']").click()
    await page.locator(".modal button:has-text('Delete topic')").click()
    await expect(page.getByText('No topics match')).toBeVisible()

    await page.goto('/admin/categories')
    const delRow = page.locator("tr:has-text('E2E Test Category Renamed')")
    await delRow.locator("[aria-label^='Delete']").click()
    await page.locator(".modal button:has-text('Delete category')").click()
    await expect(page.locator("tr:has-text('E2E Test Category Renamed')")).toHaveCount(0)
  })
})
