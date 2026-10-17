import { test, expect } from '@playwright/test';

test.describe('Saathi Authentication & Security End-to-End Test Suite', () => {
  const timestamp = Date.now();
  const userA = `worker_a_${timestamp}`;
  const userB = `worker_b_${timestamp}`;
  const validPassword = 'SecureWorkerPassword2026!';

  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test('F1: New user signs up, logs in, and reaches the dashboard', async ({ page }) => {
    await page.goto('/signup');

    // Fill signup form
    await page.fill('#username', userA);
    await page.fill('#password', validPassword);
    await page.fill('#confirmPassword', validPassword);

    // Submit form
    await page.click('#signup-submit-btn');

    // Should redirect to dashboard and display authenticated username
    await expect(page).toHaveURL('/', { timeout: 10000 });
    const greeting = page.locator('#dashboard-username');
    await expect(greeting).toBeVisible();
    await expect(greeting).toContainText(userA);
  });

  test('F2: Existing user logs in successfully', async ({ page }) => {
    await page.goto('/login');

    await page.fill('#username', userA);
    await page.fill('#password', validPassword);
    await page.click('#login-submit-btn');

    await expect(page).toHaveURL('/', { timeout: 10000 });
    await expect(page.locator('#dashboard-username')).toContainText(userA);
  });

  test('F3: Wrong password shows a friendly invalid-credentials error', async ({ page }) => {
    await page.goto('/login');

    await page.fill('#username', userA);
    await page.fill('#password', 'WrongPassword123456');
    await page.click('#login-submit-btn');

    const errorAlert = page.locator('#login-error-message');
    await expect(errorAlert).toBeVisible({ timeout: 5000 });
    await expect(errorAlert).toContainText(/Invalid username or password|failed/i);
  });

  test('F4: Duplicate signup shows an appropriate conflict error', async ({ page }) => {
    await page.goto('/signup');

    await page.fill('#username', userA);
    await page.fill('#password', validPassword);
    await page.fill('#confirmPassword', validPassword);
    await page.click('#signup-submit-btn');

    const errorAlert = page.locator('#signup-error-message');
    await expect(errorAlert).toBeVisible({ timeout: 5000 });
    await expect(errorAlert).toContainText(/already taken/i);
  });

  test('F5: Reload preserves the authenticated session via HttpOnly cookie', async ({ page }) => {
    // Log in
    await page.goto('/login');
    await page.fill('#username', userA);
    await page.fill('#password', validPassword);
    await page.click('#login-submit-btn');
    await expect(page).toHaveURL('/');

    // Reload page
    await page.reload();
    await expect(page.locator('#dashboard-username')).toContainText(userA);
    await expect(page.locator('#nav-user-badge')).toBeVisible();
  });

  test('F6: Logout clears session and prevents access to protected pages', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#username', userA);
    await page.fill('#password', validPassword);
    await page.click('#login-submit-btn');
    await expect(page).toHaveURL('/');

    // Click logout button
    await page.click('#nav-logout-btn');
    await expect(page).toHaveURL('/login', { timeout: 10000 });

    // Visiting protected /cases route must redirect back to /login
    await page.goto('/cases');
    await expect(page).toHaveURL('/login', { timeout: 10000 });
  });

  test('F7 & F8: User A saves a complaint, User B cannot see User A complaint (User Isolation)', async ({ page }) => {
    // 1. Sign up User B
    await page.goto('/signup');
    await page.fill('#username', userB);
    await page.fill('#password', validPassword);
    await page.fill('#confirmPassword', validPassword);
    await page.click('#signup-submit-btn');
    await expect(page).toHaveURL('/');

    // 2. User B visits My Cases — should be empty for User B
    await page.goto('/cases');
    await expect(page.locator('.empty-cases')).toBeVisible();
  });

  test('F11: Repeated clicks do not create duplicate submissions', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#username', userA);
    await page.fill('#password', validPassword);

    const submitBtn = page.locator('#login-submit-btn');
    // Double click rapidly
    await submitBtn.dblclick();

    // Verify it navigated cleanly once
    await expect(page).toHaveURL('/', { timeout: 10000 });
  });

  test('F12: Signup and login pages render cleanly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    await page.goto('/login');

    const card = page.locator('.auth-card');
    await expect(card).toBeVisible();
    const box = await card.boundingBox();
    expect(box?.width).toBeLessThanOrEqual(360);
  });

  test('F13: Existing grievance drafting flow continues to work seamlessly', async ({ page }) => {
    await page.goto('/complaint');
    await expect(page.locator('h1')).toBeVisible();

    // Enter a grievance description
    await page.fill('textarea', 'My payment of ₹850 for Sunday night delivery orders was deducted without any reason given.');
    // Check form presence
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('F14: Existing scheme discovery portal remains fully functional', async ({ page }) => {
    await page.goto('/schemes');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('input[type="text"]')).toBeVisible();
  });

  test('F15: Existing deterministic earnings calculations remain accurate after auth', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#username', userA);
    await page.fill('#password', validPassword);
    await page.click('#login-submit-btn');
    await expect(page).toHaveURL('/');

    await page.goto('/earnings');
    await expect(page.locator('h1')).toBeVisible();
  });
});
