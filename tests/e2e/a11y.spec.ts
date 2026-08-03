import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/* Accessibility gate: no serious or critical axe violations on the key
   routes, guest state (the widest audience). */
const ROUTES = ['/', '/categories', '/categories/programming', '/topics/javascript-basics', '/topics/javascript-basics/lessons/1', '/search?q=javascript', '/auth']

for (const route of ROUTES) {
  test(`axe: ${route}`, async ({ page }) => {
    await page.goto(route)
    await page.waitForLoadState('networkidle')
    const results = await new AxeBuilder({ page }).analyze()
    const blocking = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
    expect(blocking, blocking.map((v) => `${v.id}: ${v.help} (${v.nodes.length} nodes)`).join('\n')).toEqual([])
  })
}
