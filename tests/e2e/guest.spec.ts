import { expect, test } from '@playwright/test'

test.describe('guest browsing', () => {
  test('drills down Home → Category → Subcategory → Topic → Lesson', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Programming', exact: false }).first().click()
    await expect(page).toHaveURL(/\/categories\/programming/)
    await page.getByRole('link', { name: /^JavaScript/ }).first().click()
    await expect(page).toHaveURL(/\/categories\/programming\/javascript/)
    await page.getByRole('link', { name: 'JavaScript Basics' }).first().click()
    await expect(page).toHaveURL(/\/topics\/javascript-basics/)
    await page.getByText('Start first lesson').click()
    await expect(page).toHaveURL(/\/lessons\/1/)
    /* Stored markdown rendered into .prose, including the callout allowlist. */
    await expect(page.locator('.prose .callout')).toBeVisible()
    await expect(page.locator('.prose h2').first()).toBeVisible()
  })

  test('search returns FTS results', async ({ page }) => {
    await page.goto('/search?q=investing')
    await expect(page.locator('.topic-card')).toHaveCount(4)
    await expect(page.locator('h1')).toContainText('investing')
  })

  test('bad slugs and draft topics show the not-found card', async ({ page }) => {
    await page.goto('/topics/does-not-exist')
    await expect(page.getByText("We can't find that page")).toBeVisible()
    /* Seeded draft — invisible to guests even by direct URL. */
    await page.goto('/topics/ml-foundations-foundations')
    await expect(page.getByText("We can't find that page")).toBeVisible()
  })

  test('out-of-range lesson numbers redirect to lesson 1', async ({ page }) => {
    await page.goto('/topics/javascript-basics/lessons/999')
    await expect(page).toHaveURL(/\/lessons\/1$/)
  })

  test('dashboard and profile show guest gates', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByText('Your dashboard lives behind a free account')).toBeVisible()
    await page.goto('/profile')
    await expect(page.getByText('Profile settings need an account')).toBeVisible()
  })
})
