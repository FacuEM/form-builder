import { test, expect, Page } from '@playwright/test'
import { signUp } from './helpers'

const CREATOR_EMAIL = `creator+${Date.now()}@example.com`
const CREATOR_PASSWORD = 'TestPassword123!'

async function createPublishedForm(page: Page): Promise<string> {
  await signUp(page, CREATOR_EMAIL, CREATOR_PASSWORD)

  // Create form
  await page.click('button[type="submit"]') // "+ New form" button
  await page.waitForURL(/\/edit$/)
  const formUrl = page.url()
  const formId = formUrl.match(/forms\/([^/]+)\/edit/)?.[1] ?? ''

  // Add a TEXT question
  await page.click('button:has-text("+ Add question")')
  await page.waitForTimeout(500)

  // Publish the form
  await page.click('button:has-text("settings")')
  await page.locator('button[role="switch"], button.rounded-full').click()
  await page.waitForTimeout(500)

  return formId
}

test.describe('Respondent flow', () => {
  test('unauthenticated respondent can load a published form', async ({ browser }) => {
    // Creator context
    const creatorContext = await browser.newContext()
    const creatorPage = await creatorContext.newPage()
    const formId = await createPublishedForm(creatorPage)
    await creatorContext.close()

    // Respondent context (no auth)
    const respondentContext = await browser.newContext()
    const respondentPage = await respondentContext.newPage()
    await respondentPage.goto(`/forms/${formId}`)

    await expect(respondentPage.locator('input[type="text"], textarea')).toBeVisible({ timeout: 5000 })
    await respondentContext.close()
  })

  test('respondent can answer a text question and advance', async ({ browser }) => {
    const creatorContext = await browser.newContext()
    const creatorPage = await creatorContext.newPage()
    const formId = await createPublishedForm(creatorPage)
    await creatorContext.close()

    const respondentContext = await browser.newContext()
    const respondentPage = await respondentContext.newPage()
    await respondentPage.goto(`/forms/${formId}`)

    const input = respondentPage.locator('input[type="text"]').first()
    await input.waitFor({ timeout: 5000 })
    await input.fill('My answer')
    await respondentPage.keyboard.press('Enter')

    // Either advances to next question or reaches thank you screen
    await expect(
      respondentPage.locator('text=Thanks, input[type="text"], textarea').first()
    ).toBeVisible({ timeout: 3000 })

    await respondentContext.close()
  })

  test('progress bar is visible on respondent form', async ({ browser }) => {
    const creatorContext = await browser.newContext()
    const creatorPage = await creatorContext.newPage()
    const formId = await createPublishedForm(creatorPage)
    await creatorContext.close()

    const respondentContext = await browser.newContext()
    const respondentPage = await respondentContext.newPage()
    await respondentPage.goto(`/forms/${formId}`)

    // Progress bar is a fixed 2px div at the top
    await expect(respondentPage.locator('[class*="fixed"][class*="top-0"]').first()).toBeVisible({ timeout: 5000 })
    await respondentContext.close()
  })
})
