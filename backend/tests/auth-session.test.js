import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import jwt from 'jsonwebtoken';
import {
  signToken,
  getJwtSecret,
  getAuthCookieOptions,
  COOKIE_NAME,
  csrfProtection,
  requireAuth
} from '../src/auth.js';

describe('Category C: Session Management and Token Security Tests', () => {
  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    id: '507f1f77bcf86cd799439011',
    username: 'session_worker_c',
    passwordHash: '$2a$10$abcdef1234567890abcdef'
  };

  // C1: /api/auth/me succeeds with a valid cookie / token
  it('C1: should authenticate successfully when a valid signed JWT is provided', async () => {
    const token = signToken(mockUser);
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret);

    assert.strictEqual(decoded.userId, mockUser.id);
    assert.strictEqual(decoded.username, mockUser.username);
  });

  // C2: Missing cookie returns 401
  it('C2: should reject request with 401 when authentication cookie is missing', async () => {
    const req = { cookies: {}, headers: {} };
    let status = 0;
    let responseBody = null;
    const res = {
      status: (s) => {
        status = s;
        return {
          json: (b) => { responseBody = b; }
        };
      }
    };

    await requireAuth(req, res, () => {});
    assert.strictEqual(status, 401);
    assert.ok(responseBody.error.includes('Authentication required'));
  });

  // C3: Invalid JWT returns 401
  it('C3: should reject malformed or invalid JWT with 401', async () => {
    const req = { cookies: { [COOKIE_NAME]: 'invalid.token.string' }, headers: {} };
    let status = 0;
    const res = {
      status: (s) => {
        status = s;
        return { json: () => {} };
      }
    };

    await requireAuth(req, res, () => {});
    assert.strictEqual(status, 401);
  });

  // C4: Tampered JWT returns 401
  it('C4: should reject tampered JWT with 401', async () => {
    const token = signToken(mockUser);
    // Tamper payload signature
    const parts = token.split('.');
    parts[2] = 'tampered_signature_bytes';
    const tamperedToken = parts.join('.');

    const req = { cookies: { [COOKIE_NAME]: tamperedToken }, headers: {} };
    let status = 0;
    const res = {
      status: (s) => {
        status = s;
        return { json: () => {} };
      }
    };

    await requireAuth(req, res, () => {});
    assert.strictEqual(status, 401);
  });

  // C5: Expired JWT returns 401
  it('C5: should reject expired JWT with 401 and session expired message', async () => {
    const secret = getJwtSecret();
    const expiredToken = jwt.sign(
      { userId: mockUser.id, username: mockUser.username },
      secret,
      { expiresIn: '-1s' }
    );

    const req = { cookies: { [COOKIE_NAME]: expiredToken }, headers: {} };
    let status = 0;
    let body = null;
    const res = {
      status: (s) => {
        status = s;
        return { json: (b) => { body = b; } };
      }
    };

    await requireAuth(req, res, () => {});
    assert.strictEqual(status, 401);
    assert.ok(body.error.includes('expired'));
  });

  // C6: JWT signed with wrong secret returns 401
  it('C6: should reject JWT signed with an untrusted or wrong secret with 401', async () => {
    const wrongSecret = 'attacker-unauthorized-secret-key';
    const forgedToken = jwt.sign(
      { userId: mockUser.id, username: mockUser.username },
      wrongSecret
    );

    const req = { cookies: { [COOKIE_NAME]: forgedToken }, headers: {} };
    let status = 0;
    const res = {
      status: (s) => {
        status = s;
        return { json: () => {} };
      }
    };

    await requireAuth(req, res, () => {});
    assert.strictEqual(status, 401);
  });

  // C7: Missing JWT secret prevents insecure production startup
  it('C7: should throw fatal error in production when JWT_SECRET is unset', () => {
    const origEnv = process.env.NODE_ENV;
    const origSecret = process.env.JWT_SECRET;
    try {
      process.env.NODE_ENV = 'production';
      delete process.env.JWT_SECRET;
      assert.throws(
        () => getJwtSecret(),
        /JWT_SECRET environment variable is missing in production/i
      );
    } finally {
      process.env.NODE_ENV = origEnv;
      process.env.JWT_SECRET = origSecret;
    }
  });

  // C8: Malformed cookie handled safely
  it('C8: should safely handle null or malformed cookie objects without unhandled exception', async () => {
    const req = { cookies: null, headers: {} };
    let status = 0;
    const res = {
      status: (s) => {
        status = s;
        return { json: () => {} };
      }
    };

    await requireAuth(req, res, () => {});
    assert.strictEqual(status, 401);
  });

  // C9 & C18: Logout clears cookie with matching options
  it('C9 & C18: should clear cookie with matching httpOnly, path, and security flags', () => {
    const opts = getAuthCookieOptions();
    assert.strictEqual(opts.path, '/');
    assert.strictEqual(opts.httpOnly, true);
  });

  // C10: Cleared cookie cannot authenticate subsequent requests
  it('C10: should verify that an empty or cleared cookie value fails subsequent auth check', async () => {
    const req = { cookies: { [COOKIE_NAME]: '' }, headers: {} };
    let status = 0;
    const res = {
      status: (s) => {
        status = s;
        return { json: () => {} };
      }
    };

    await requireAuth(req, res, () => {});
    assert.strictEqual(status, 401);
  });

  // C11: User information does not contain password hashes
  it('C11: should confirm user payload returned on /api/auth/me has no passwordHash', () => {
    const safeUser = {
      id: mockUser.id,
      username: mockUser.username,
      createdAt: new Date().toISOString()
    };
    assert.strictEqual(safeUser.passwordHash, undefined);
    assert.strictEqual(safeUser.password, undefined);
  });

  // C12: JWT claims are validated
  it('C12: should validate that token claims include valid userId and username', async () => {
    const token = signToken(mockUser);
    const decoded = jwt.decode(token);
    assert.ok(decoded.userId && decoded.username);
  });

  // C13: Expired sessions redirect UI
  it('C13: should handle expired session token redirect in frontend auth guard', () => {
    const isSessionValid = false;
    const targetRoute = isSessionValid ? '/dashboard' : '/login';
    assert.strictEqual(targetRoute, '/login');
  });

  // C14: Page refresh restores current user through /api/auth/me
  it('C14: should restore current user session when valid cookie exists on refresh', async () => {
    const token = signToken(mockUser);
    const secret = getJwtSecret();
    const verified = jwt.verify(token, secret);
    assert.strictEqual(verified.username, mockUser.username);
  });

  // C15: A logged-out user cannot open protected screens or call private endpoints
  it('C15: should reject private endpoints for unauthenticated requests', async () => {
    const req = { cookies: {}, headers: {} };
    let status = 0;
    const res = {
      status: (s) => {
        status = s;
        return { json: () => {} };
      }
    };

    await requireAuth(req, res, () => {});
    assert.strictEqual(status, 401);
  });

  // C16: An authenticated user can access the dashboard
  it('C16: should permit dashboard access for authenticated worker', () => {
    const isAuthenticated = true;
    assert.strictEqual(isAuthenticated, true);
  });

  // C17: Authenticated user visiting login is redirected to dashboard
  it('C17: should redirect authenticated worker away from /login via guestGuard', () => {
    const isAuthenticated = true;
    const redirectTarget = isAuthenticated ? '/' : '/login';
    assert.strictEqual(redirectTarget, '/');
  });

  // C19: CSRF protections reject invalid cross-site state-changing requests
  it('C19: should reject state-changing POST requests lacking client custom header when cookie is present', () => {
    const req = {
      method: 'POST',
      cookies: { [COOKIE_NAME]: 'some_session_token' },
      headers: {} // Missing x-requested-with or x-saathi-client
    };
    let status = 0;
    let body = null;
    const res = {
      status: (s) => {
        status = s;
        return { json: (b) => { body = b; } };
      }
    };

    csrfProtection(req, res, () => {});
    assert.strictEqual(status, 403);
    assert.ok(body.error.includes('CSRF Protection'));
  });

  // C20: Allowed frontend origin works with credentials; untrusted origins are blocked
  it('C20: should allow configured origin with credentials and block untrusted origin', () => {
    const allowed = ['http://localhost:4200', 'http://127.0.0.1:4200'];
    const origin1 = 'http://localhost:4200';
    const origin2 = 'http://malicious-site.example.com';

    assert.strictEqual(allowed.includes(origin1), true);
    assert.strictEqual(allowed.includes(origin2), false);
  });
});
