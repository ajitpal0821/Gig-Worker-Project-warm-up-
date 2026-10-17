import express from 'express';
import { User } from '../models/user.model.js';
import {
  signToken,
  getAuthCookieOptions,
  COOKIE_NAME,
  authRateLimiter,
  csrfProtection,
  requireAuth
} from '../auth.js';
import { isDbConnected } from '../db.js';

const router = express.Router();

/**
 * Username normalization and validation
 */
function validateAndNormalizeUsername(rawUsername) {
  if (typeof rawUsername !== 'string') {
    return { valid: false, error: 'Username must be a valid string.' };
  }

  const trimmed = rawUsername.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Username cannot be empty or whitespace only.' };
  }

  if (trimmed.length < 3 || trimmed.length > 30) {
    return { valid: false, error: 'Username must be between 3 and 30 characters in length.' };
  }

  const allowedCharsRegex = /^[a-zA-Z0-9_.-]+$/;
  if (!allowedCharsRegex.test(trimmed)) {
    return { valid: false, error: 'Username can only contain alphanumeric characters, dots, underscores, and dashes.' };
  }

  return { valid: true, normalized: trimmed.toLowerCase() };
}

/**
 * Password validation policy (Minimum 12 characters)
 */
function validatePassword(rawPassword) {
  if (typeof rawPassword !== 'string' || rawPassword.length === 0) {
    return { valid: false, error: 'Password is required.' };
  }

  if (rawPassword.length < 12) {
    return { valid: false, error: 'Password must be at least 12 characters long.' };
  }

  if (rawPassword.length > 128) {
    return { valid: false, error: 'Password cannot exceed 128 characters.' };
  }

  return { valid: true };
}

/**
 * POST /api/auth/signup
 */
router.post('/signup', authRateLimiter, async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        error: 'Database service is temporarily unavailable. Please try again shortly.'
      });
    }

    const { username, password, confirmPassword } = req.body || {};

    // Validate username
    const usernameResult = validateAndNormalizeUsername(username);
    if (!usernameResult.valid) {
      return res.status(400).json({ error: usernameResult.error });
    }

    // Validate password
    const passwordResult = validatePassword(password);
    if (!passwordResult.valid) {
      return res.status(400).json({ error: passwordResult.error });
    }

    // Confirm password match check (if provided in payload)
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    // Check existing user
    const existing = await User.findOne({ username: usernameResult.normalized });
    if (existing) {
      return res.status(409).json({ error: 'Username is already taken. Please choose another.' });
    }

    // Hash password
    const passwordHash = await User.hashPassword(password);

    // Persist new user in MongoDB
    const newUser = await User.create({
      username: usernameResult.normalized,
      passwordHash
    });

    // Create session token & cookie
    const token = signToken(newUser);
    res.cookie(COOKIE_NAME, token, getAuthCookieOptions());

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      user: newUser.toJSON()
    });
  } catch (error) {
    // Handle MongoDB duplicate key race condition (E11000)
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Username is already taken. Please choose another.' });
    }

    console.error('[Auth Error] Signup failure:', error.message);
    return res.status(500).json({
      error: 'An unexpected error occurred while creating your account. Please try again.'
    });
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', authRateLimiter, async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        error: 'Database service is temporarily unavailable. Please try again shortly.'
      });
    }

    const { username, password } = req.body || {};

    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const trimmedUsername = username.trim().toLowerCase();
    if (trimmedUsername.length === 0 || password.length === 0) {
      return res.status(400).json({ error: 'Username and password cannot be empty.' });
    }

    // Prevent oversized input attacks
    if (trimmedUsername.length > 50 || password.length > 200) {
      return res.status(400).json({ error: 'Invalid credentials format.' });
    }

    const user = await User.findOne({ username: trimmedUsername });
    if (!user) {
      // Generic error: do NOT reveal if username or password was incorrect
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Generic error: do NOT reveal if username or password was incorrect
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    // Update lastLogin
    user.lastLogin = new Date();
    await user.save();

    // Create session token & set HttpOnly cookie
    const token = signToken(user);
    res.cookie(COOKIE_NAME, token, getAuthCookieOptions());

    return res.json({
      success: true,
      message: 'Login successful.',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('[Auth Error] Login failure:', error.message);
    return res.status(500).json({
      error: 'An unexpected error occurred during login. Please try again.'
    });
  }
});

/**
 * GET /api/auth/me
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        error: 'Database service is temporarily unavailable.'
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(401).json({ error: 'User account not found or deactivated.' });
    }

    return res.json({
      success: true,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('[Auth Error] /me failure:', error.message);
    return res.status(500).json({ error: 'Unable to retrieve user profile.' });
  }
});

/**
 * POST /api/auth/logout
 */
router.post('/logout', csrfProtection, (req, res) => {
  const { maxAge, ...clearOptions } = getAuthCookieOptions();
  res.clearCookie(COOKIE_NAME, clearOptions);
  return res.json({
    success: true,
    message: 'Logged out successfully.'
  });
});

export default router;
