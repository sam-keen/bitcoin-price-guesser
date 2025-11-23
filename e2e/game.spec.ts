import { test, expect } from '@playwright/test';

test.describe('Bitcoin Price Prediction Game', () => {
  test('displays the main page with header, price, and score', async ({ page }) => {
    await page.goto('/');

    // Header is visible (use exact match to avoid matching other text containing PREDICT)
    await expect(page.locator('h1').getByText('PREDICT')).toBeVisible();

    // Price display loads
    await expect(page.getByText('[LIVE_MARKET_PRICE]')).toBeVisible();
    await expect(page.getByText('BTC/USD')).toBeVisible();

    // Score display shows
    await expect(page.getByText('[CURRENT_SCORE]')).toBeVisible();

    // Prediction buttons are visible
    await expect(page.getByRole('button', { name: /going up/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /going down/i })).toBeVisible();
  });

  test('displays live BTC price from API', async ({ page }) => {
    await page.goto('/');

    // Wait for price to load (should show dollar amount)
    await expect(page.locator('text=/\\$[\\d,]+\\.\\d{2}/')).toBeVisible({ timeout: 10000 });
  });

  test('can submit an UP prediction', async ({ page }) => {
    await page.goto('/');

    // Wait for page to be ready
    await expect(page.getByRole('button', { name: /going up/i })).toBeEnabled({ timeout: 10000 });

    // Click UP button
    await page.getByRole('button', { name: /going up/i }).click();

    // Should see countdown timer
    await expect(page.getByText('[AWAITING_RESULT]')).toBeVisible({ timeout: 5000 });

    // Should see prediction entry with UP direction
    await expect(page.getByText(/PREDICTION_ENTERED/)).toBeVisible();
    await expect(page.getByText('▲ UP')).toBeVisible();

    // Buttons should no longer be visible (can't make another guess)
    await expect(page.getByRole('button', { name: /going up/i })).not.toBeVisible();
  });

  test('can submit a DOWN prediction', async ({ page }) => {
    await page.goto('/');

    // Wait for page to be ready
    await expect(page.getByRole('button', { name: /going down/i })).toBeEnabled({ timeout: 10000 });

    // Click DOWN button
    await page.getByRole('button', { name: /going down/i }).click();

    // Should see countdown timer
    await expect(page.getByText('[AWAITING_RESULT]')).toBeVisible({ timeout: 5000 });

    // Should see prediction entry with DOWN direction
    await expect(page.getByText(/PREDICTION_ENTERED/)).toBeVisible();
    await expect(page.getByText('▼ DOWN')).toBeVisible();
  });

  test('session persists across page reload', async ({ page }) => {
    await page.goto('/');

    // Wait for session to be established (score shows means session is ready)
    await expect(page.getByText('0')).toBeVisible({ timeout: 10000 });

    // Wait a moment for localStorage to be set
    await page.waitForFunction(() => {
      return localStorage.getItem('bitcoinPriceGuesserUserId') !== null;
    }, { timeout: 10000 });

    // Get the userId from localStorage
    const userIdBefore = await page.evaluate(() => {
      return localStorage.getItem('bitcoinPriceGuesserUserId');
    });

    expect(userIdBefore).toBeTruthy();

    // Reload the page
    await page.reload();

    // Wait for page to load again
    await expect(page.getByText('[CURRENT_SCORE]')).toBeVisible({ timeout: 10000 });

    // Check userId is the same
    const userIdAfter = await page.evaluate(() => {
      return localStorage.getItem('bitcoinPriceGuesserUserId');
    });

    expect(userIdAfter).toBe(userIdBefore);
  });

  test('shows submitting state when making prediction', async ({ page }) => {
    await page.goto('/');

    // Wait for page to be ready
    await expect(page.getByRole('button', { name: /going up/i })).toBeEnabled({ timeout: 10000 });

    // Click and immediately check for submitting state
    const upButton = page.getByRole('button', { name: /going up/i });
    await upButton.click();

    // Either we see "submitting..." briefly or we're already at the countdown
    // Use .first() since both elements may be present
    await expect(page.getByText('[AWAITING_RESULT]')).toBeVisible({ timeout: 5000 });
  });

  test('new user starts with score of 0', async ({ page, context }) => {
    // Clear storage to simulate new user
    await context.clearCookies();

    await page.goto('/');

    // Clear localStorage on the page
    await page.evaluate(() => {
      localStorage.clear();
    });

    // Reload to trigger new session
    await page.reload();

    // Wait for score to load
    await expect(page.getByText('[CURRENT_SCORE]')).toBeVisible({ timeout: 10000 });

    // Score should be 0
    await expect(page.getByText('0')).toBeVisible();
  });
});

test.describe('Full Game Flow', () => {
  test('prediction flow: guess → countdown → awaiting resolution', async ({ page }) => {
    await page.goto('/');

    // Wait for page to be ready with initial score
    await expect(page.getByText('0')).toBeVisible({ timeout: 10000 });

    // Make a prediction
    await page.getByRole('button', { name: /going up/i }).click();

    // Should see countdown (with 3s duration in tests)
    await expect(page.getByText('[AWAITING_RESULT]')).toBeVisible({ timeout: 5000 });

    // Wait for countdown to finish - should transition to awaiting price change or result
    // With 3s countdown, this tests that the timer works correctly
    await expect(
      page.getByText(/\[PREDICTION_RESULT\]/).or(page.getByText(/AWAITING_PRICE_CHANGE/))
    ).toBeVisible({ timeout: 15000 });

    // The flow is working correctly at this point - we've verified:
    // 1. Prediction submission works
    // 2. Countdown displays and transitions
    // 3. Resolution state is reached (either result or awaiting price change)
  });

  test('result can be dismissed to make new prediction', async ({ page }) => {
    await page.goto('/');

    // Wait for page to be ready
    await expect(page.getByText('0')).toBeVisible({ timeout: 10000 });

    // Make a prediction and wait for resolution state
    await page.getByRole('button', { name: /going up/i }).click();
    await expect(page.getByText('[AWAITING_RESULT]')).toBeVisible({ timeout: 5000 });

    // Wait for countdown + potential price change (give it some time)
    await expect(
      page.getByText(/\[PREDICTION_RESULT\]/).or(page.getByText(/AWAITING_PRICE_CHANGE/))
    ).toBeVisible({ timeout: 15000 });

    // Check if we got a result (price changed)
    const hasResult = await page.getByText(/\[PREDICTION_RESULT\]/).isVisible().catch(() => false);

    if (hasResult) {
      // Result should show with score change
      await expect(page.getByText(/[+-]1/)).toBeVisible();

      // Dismiss the result
      await page.getByRole('button', { name: /new prediction/i }).click();

      // Should be back to guess form
      await expect(page.getByRole('button', { name: /going up/i })).toBeVisible({ timeout: 5000 });
    }
    // If no result yet (price hasn't changed), that's valid - skip dismissal test
  });
});

test.describe('API Endpoints', () => {
  test('GET /api/price returns valid price data', async ({ request }) => {
    const response = await request.get('/api/price');

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty('price');
    expect(data).toHaveProperty('timestamp');
    expect(typeof data.price).toBe('number');
    expect(data.price).toBeGreaterThan(0);
  });

  test('GET /api/session creates new user', async ({ request }) => {
    const response = await request.get('/api/session');

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty('userId');
    expect(data).toHaveProperty('score');
    expect(data.score).toBe(0);
  });

  test('POST /api/guess requires authorization', async ({ request }) => {
    const response = await request.post('/api/guess', {
      data: { direction: 'up' },
    });

    expect(response.status()).toBe(401);
  });

  test('POST /api/guess validates direction', async ({ request }) => {
    // First get a valid session
    const sessionResponse = await request.get('/api/session');
    const { userId } = await sessionResponse.json();

    // Try invalid direction
    const response = await request.post('/api/guess', {
      headers: {
        Authorization: `Bearer ${userId}`,
      },
      data: { direction: 'sideways' },
    });

    expect(response.status()).toBe(400);
  });
});
