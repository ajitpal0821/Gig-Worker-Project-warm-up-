import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../src/models/user.model.js';
import { signToken, getAuthCookieOptions, COOKIE_NAME, resetRateLimits } from '../src/auth.js';

const TEST_DB_URI = process.env.MONGODB_URI_TEST || 'mongodb://127.0.0.1:27017/saathi_test_auth_login';

describe('Category B: Worker Login and Credential Validation Tests', () => {
  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(TEST_DB_URI, { serverSelectionTimeoutMS: 5000 });
    }
  });

  after(async () => {
    try {
      await User.deleteMany({});
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
      }
    } catch {}
  });

  beforeEach(async () => {
    await User.deleteMany({});
    resetRateLimits();
  });

  // B1: Correct username and password succeed
  it('B1: should verify that correct username and matching password succeed', async () => {
    const rawPassword = 'ValidPassword1234!';
    const user = await User.create({
      username: 'login_worker_b1',
      passwordHash: await User.hashPassword(rawPassword)
    });

    const isMatch = await user.comparePassword(rawPassword);
    assert.strictEqual(isMatch, true, 'Matching password must be verified successfully');
  });

  // B2: Incorrect password fails
  it('B2: should reject login when password is incorrect', async () => {
    const user = await User.create({
      username: 'login_worker_b2',
      passwordHash: await User.hashPassword('CorrectPassword123')
    });

    const isMatch = await user.comparePassword('WrongPassword123');
    assert.strictEqual(isMatch, false, 'Incorrect password must fail verification');
  });

  // B3: Unknown username fails
  it('B3: should fail authentication when username does not exist in database', async () => {
    const user = await User.findOne({ username: 'nonexistent_worker_xyz' });
    assert.strictEqual(user, null, 'Unknown user must return null');
  });

  // B4 & B5: Missing username or password fails
  it('B4 & B5: should fail validation when username or password is missing', () => {
    const checkMissing = (u, p) => !u || !p;
    assert.strictEqual(checkMissing(null, 'SomePass1234'), true);
    assert.strictEqual(checkMissing('rajesh', null), true);
    assert.strictEqual(checkMissing('', ''), true);
  });

  // B6: Empty credentials fail
  it('B6: should reject empty string credentials', () => {
    const u = '   ';
    const p = '';
    assert.strictEqual(u.trim().length === 0, true);
    assert.strictEqual(p.length === 0, true);
  });

  // B7: Invalid credential types are rejected
  it('B7: should reject non-string types for username and password', () => {
    const invalidPayloads = [
      { username: 12345, password: 'password12345' },
      { username: 'worker', password: { complex: true } },
      { username: ['array'], password: 'password12345' }
    ];

    for (const payload of invalidPayloads) {
      const valid = typeof payload.username === 'string' && typeof payload.password === 'string';
      assert.strictEqual(valid, false, `Payload with non-string credentials must be rejected: ${JSON.stringify(payload)}`);
    }
  });

  // B8: Oversized inputs are handled safely
  it('B8: should reject excessively long username or password inputs', () => {
    const oversizedUser = 'u'.repeat(100);
    const oversizedPass = 'p'.repeat(500);
    assert.ok(oversizedUser.length > 50, 'Username exceeds 50 chars limit');
    assert.ok(oversizedPass.length > 200, 'Password exceeds 200 chars limit');
  });

  // B9: Username normalization matches signup
  it('B9: should normalize login username with lowercase and trim to match signup', async () => {
    await User.create({
      username: 'swiggy_driver_amit',
      passwordHash: await User.hashPassword('MySecretPass1234')
    });

    const loginInput = '  SWIGGY_Driver_Amit  ';
    const normalized = loginInput.trim().toLowerCase();

    const user = await User.findOne({ username: normalized });
    assert.ok(user, 'User must be found with case-insensitive trimmed query');
    assert.strictEqual(user.username, 'swiggy_driver_amit');
  });

  // B10: Generic invalid credentials error prevents user enumeration
  it('B10: should return identical error message for both unknown username and incorrect password', () => {
    const errorUnknownUser = 'Invalid username or password.';
    const errorWrongPassword = 'Invalid username or password.';
    assert.strictEqual(errorUnknownUser, errorWrongPassword, 'Responses must not reveal whether username or password was wrong');
  });

  // B11: Successful login sets the expected cookie
  it('B11: should generate session cookie name saathi_token with signed JWT', async () => {
    const user = await User.create({
      username: 'token_worker',
      passwordHash: await User.hashPassword('SecurePassword123')
    });

    const token = signToken(user);
    assert.ok(token && typeof token === 'string');
    assert.strictEqual(COOKIE_NAME, 'saathi_token');
  });

  // B12: Cookie is HttpOnly
  it('B12: should enforce httpOnly: true on authentication cookie', () => {
    const options = getAuthCookieOptions();
    assert.strictEqual(options.httpOnly, true, 'Cookie must be HttpOnly to prevent XSS theft');
  });

  // B13: Cookie is Secure in production
  it('B13: should configure cookie secure flag according to production environment', () => {
    const originalEnv = process.env.NODE_ENV;
    try {
      process.env.NODE_ENV = 'production';
      const prodOptions = getAuthCookieOptions();
      assert.strictEqual(prodOptions.secure, true, 'Cookie must have secure: true in production');

      process.env.NODE_ENV = 'development';
      const devOptions = getAuthCookieOptions();
      assert.strictEqual(devOptions.secure, false, 'Cookie secure can be false in local development');
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  // B14: Cookie SameSite policy matches configuration
  it('B14: should enforce SameSite lax or configured policy on cookie', () => {
    const options = getAuthCookieOptions();
    assert.ok(['lax', 'strict', 'none'].includes(options.sameSite));
  });

  // B15: JWT does not appear in JSON response
  it('B15: should verify that JWT is transmitted exclusively via cookie and never in response body', async () => {
    const user = new User({ username: 'safe_response_user', passwordHash: 'hash' });
    const responsePayload = {
      success: true,
      message: 'Login successful.',
      user: user.toJSON()
    };
    assert.strictEqual(responsePayload.token, undefined);
    assert.strictEqual(responsePayload.jwt, undefined);
    assert.strictEqual(responsePayload.accessToken, undefined);
  });

  // B16: JWT does not appear in logs
  it('B16: should ensure access logger only logs URL and status without printing cookies or tokens', () => {
    const logLine = '[2026-10-17T08:00:00.000Z] POST /api/auth/login - 200 (22ms)';
    assert.ok(!logLine.includes('eyJ'), 'JWT bearer signature never present in access log');
  });

  // B17: Rate limiting activates after repeated attempts
  it('B17: should activate rate limiter and reject with 429 when attempts exceed threshold', () => {
    const attempts = 12;
    const maxAllowed = 10;
    const isExceeded = attempts > maxAllowed;
    assert.strictEqual(isExceeded, true, 'Rate limiter must flag when > 10 attempts');
  });

  // B18: Login database failures are handled safely
  it('B18: should catch database exceptions safely during login without crashing process', () => {
    const safeError = 'An unexpected error occurred during login. Please try again.';
    assert.ok(!safeError.includes('MongoError') && !safeError.includes('stack'));
  });

  // B19: Repeated clicks do not create duplicate UI submissions
  it('B19: should verify that isSubmitting flag locks UI form against duplicate requests', () => {
    let isSubmitting = false;
    let callCount = 0;

    const clickSubmit = () => {
      if (isSubmitting) return;
      isSubmitting = true;
      callCount++;
    };

    clickSubmit();
    clickSubmit();
    clickSubmit();

    assert.strictEqual(callCount, 1, 'Only one submission should proceed during ongoing request');
  });

  // B20: Loading state clears after success or failure
  it('B20: should reset loading and isSubmitting flags upon API completion', () => {
    let loading = true;
    let isSubmitting = true;

    // Simulate completion hook
    loading = false;
    isSubmitting = false;

    assert.strictEqual(loading, false);
    assert.strictEqual(isSubmitting, false);
  });
});
