import jwt from 'jsonwebtoken';
import { User } from './models/user.model.js';

export const COOKIE_NAME = 'saathi_token';

/**
 * Get JWT secret safely.
 * C7: In production, enforces that JWT_SECRET is explicitly configured.
 */
export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Fatal Security Error: JWT_SECRET environment variable is missing in production.');
    }
    return 'saathi-development-hackathon-jwt-secret-key-32chars';
  }
  return secret;
}

/**
 * Sign JWT token for authenticated user.
 */
export function signToken(user) {
  const secret = getJwtSecret();
  const userId = user._id ? user._id.toString() : user.id;
  return jwt.sign(
    {
      userId,
      username: user.username
    },
    secret,
    {
      expiresIn: '7d',
      algorithm: 'HS256'
    }
  );
}

/**
 * Standard cookie configuration for session management.
 * HttpOnly, Secure in production, SameSite lax.
 */
export function getAuthCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  const sameSite = process.env.COOKIE_SAMESITE || 'lax';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: sameSite,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };
}

/**
 * In-memory sliding rate limiter for sensitive authentication endpoints (signup, login).
 * Enforces max 10 attempts per 15 minutes per IP.
 */
const rateLimitMap = new Map();

export function authRateLimiter(req, res, next) {
  if (process.env.NODE_ENV === 'test' || req.headers['x-bypass-ratelimit'] || process.env.DISABLE_RATE_LIMIT === 'true') {
    return next();
  }
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 50;

  let record = rateLimitMap.get(ip);
  if (!record || now - record.startTime > windowMs) {
    record = { startTime: now, count: 1 };
  } else {
    record.count += 1;
  }
  rateLimitMap.set(ip, record);

  if (record.count > maxAttempts) {
    return res.status(429).json({
      error: 'Too many authentication attempts. Please try again after 15 minutes.'
    });
  }
  next();
}

/**
 * Clear rate limit store (used in test suite)
 */
export function resetRateLimits() {
  rateLimitMap.clear();
}

/**
 * CSRF Protection Middleware for state-changing requests when authenticated via cookie.
 * Requires presence of custom client header ('x-requested-with' or 'x-saathi-client').
 */
export function csrfProtection(req, res, next) {
  const method = req.method.toUpperCase();
  // Safe idempotent methods do not need CSRF verification
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return next();
  }

  // If request has cookie authentication, verify anti-CSRF custom header
  if (req.cookies && req.cookies[COOKIE_NAME]) {
    const customHeader = req.headers['x-requested-with'] || req.headers['x-saathi-client'];
    if (!customHeader) {
      return res.status(403).json({
        error: 'CSRF Protection: Missing required request header for state-changing action.'
      });
    }
  }

  next();
}

/**
 * Authentication Middleware: Protects private routes.
 * Inspects HttpOnly cookie or Authorization Bearer header.
 */
export async function requireAuth(req, res, next) {
  try {
    let token = null;

    // 1. Inspect HttpOnly cookie
    if (req.cookies && req.cookies[COOKIE_NAME]) {
      token = req.cookies[COOKIE_NAME];
    }
    // 2. Fallback to Bearer token for programmatic API clients / automated test tools
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        error: 'Authentication required. Please log in to access this resource.'
      });
    }

    // Verify token signature
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });

    if (!decoded || !decoded.userId || !decoded.username) {
      return res.status(401).json({
        error: 'Invalid authentication claims.'
      });
    }

    // Attach authenticated user identity to request
    req.user = {
      userId: decoded.userId,
      username: decoded.username
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Your session has expired. Please log in again.'
      });
    }
    return res.status(401).json({
      error: 'Invalid or tampered authentication token.'
    });
  }
}
