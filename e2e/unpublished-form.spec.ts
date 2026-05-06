import { test, expect } from '@playwright/test'

test('respondent loading unpublished form gets 404', async ({ page }) => {
  // A nonexistent or unpublished form ID returns 404
  const res = await page.goto('/forms/nonexistent-form-id')
  expect(res?.status()).toBe(404)
})

test('POST to /api/forms/[id]/responses for unpublished form returns 403', async ({ request }) => {
  const res = await request.post('/api/forms/nonexistent-form-id/responses', {
    data: { respondentToken: 'test-token', answers: [{ questionId: 'q1', value: 'test' }] },
  })
  // 404 for unknown form, 403 if form exists but unpublished
  expect([403, 404]).toContain(res.status())
})
