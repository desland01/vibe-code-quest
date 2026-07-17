import { expect, test } from '@playwright/test';

test('anonymous session and progress persist across reload', async ({ page, context }) => {
  const firstSessionResponse = page.waitForResponse(
    (response) => response.url().endsWith('/api/session') && response.request().method() === 'GET'
  );
  await page.goto('/');
  const firstResponse = await firstSessionResponse;
  expect(firstResponse.status()).toBe(200);
  const firstSession = (await firstResponse.json()) as { userId: string };
  expect(firstSession.userId).toBeTruthy();

  const sessionCookie = (await context.cookies()).find((cookie) => cookie.name === 'ct_session');
  expect(sessionCookie).toBeDefined();
  expect(sessionCookie?.httpOnly).toBe(true);

  const saved = await page.request.put('/api/progress', {
    data: { region: 'foundations', landmark: 'prompting', state: { complete: true } }
  });
  expect(saved.status()).toBe(200);
  await expect(saved.json()).resolves.toMatchObject({
    region: 'foundations',
    landmark: 'prompting',
    state: { complete: true }
  });

  const progress = await page.request.get('/api/progress');
  expect(progress.status()).toBe(200);
  await expect(progress.json()).resolves.toMatchObject({
    items: [
      {
        region: 'foundations',
        landmark: 'prompting',
        state: { complete: true }
      }
    ]
  });

  const reloadedSessionResponse = page.waitForResponse(
    (response) => response.url().endsWith('/api/session') && response.request().method() === 'GET'
  );
  await page.reload();
  const reloadedSession = (await (await reloadedSessionResponse).json()) as { userId: string };
  expect(reloadedSession.userId).toBe(firstSession.userId);

  const persistedProgress = await page.request.get('/api/progress');
  await expect(persistedProgress.json()).resolves.toMatchObject({
    items: [{ region: 'foundations', landmark: 'prompting', state: { complete: true } }]
  });

  await expect(page.getByText(/sign in|sign up|log in|register/i)).toHaveCount(0);
});
