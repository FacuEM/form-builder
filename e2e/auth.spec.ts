import { test, expect } from '@playwright/test'

test('unauthenticated request to /dashboard redirects to /login', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/login/)
})

test('unauthenticated request to /dashboard/forms/any/edit redirects to /login', async ({ page }) => {
  await page.goto('/dashboard/forms/nonexistent/edit')
  await expect(page).toHaveURL(/\/login/)
})
