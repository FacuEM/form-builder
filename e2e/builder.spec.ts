import { test, expect } from '@playwright/test'
import { signUp } from './helpers'

const EMAIL = `builder+${Date.now()}@example.com`
const PASSWORD = 'TestPassword123!'

test.describe('Builder flow', () => {
  test.beforeEach(async ({ page }) => {
    await signUp(page, EMAIL, PASSWORD)
  })

  test('can create a new form and land in the editor', async ({ page }) => {
    await page.click('button[type="submit"]') // "+ New form"
    await expect(page).toHaveURL(/\/edit$/, { timeout: 10000 })
    await expect(page.locator('text=Add question, text=questions').first()).toBeVisible()
  })

  test('can add a question and see it in the list', async ({ page }) => {
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/edit$/)

    await page.click('button:has-text("+ Add question")')
    await expect(page.locator('text=New question')).toBeVisible({ timeout: 5000 })
  })

  test('publish toggle generates a shareable link', async ({ page }) => {
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/edit$/)

    // Go to settings tab
    await page.click('button:has-text("settings")')

    const toggle = page.locator('button.rounded-full').first()
    await toggle.click()

    // Shareable link should appear
    await expect(page.locator('a[href*="/forms/"]')).toBeVisible({ timeout: 5000 })
  })

  test('can delete a form from the dashboard', async ({ page }) => {
    // Create a form
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/edit$/)
    await page.goto('/dashboard')

    // Hover to reveal delete button
    const formRow = page.locator('[class*="border"][class*="rounded"]').first()
    await formRow.hover()

    page.on('dialog', (dialog) => dialog.accept())
    await page.click('button:has-text("Delete")')

    await expect(page).toHaveURL('/dashboard', { timeout: 5000 })
  })
})
