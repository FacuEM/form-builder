import { Page } from '@playwright/test'

export const TEST_EMAIL = `e2e+${Date.now()}@example.com`
export const TEST_PASSWORD = 'TestPassword123!'

export async function signUp(page: Page, email = TEST_EMAIL, password = TEST_PASSWORD) {
  await page.goto('/signup')
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForURL('/dashboard')
}

export async function signIn(page: Page, email = TEST_EMAIL, password = TEST_PASSWORD) {
  await page.goto('/login')
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForURL('/dashboard')
}
