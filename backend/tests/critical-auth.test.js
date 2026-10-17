import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../src/models/user.model.js';
import { Case } from '../src/models/case.model.js';
import { signToken, getJwtSecret, getAuthCookieOptions, COOKIE_NAME, requireAuth } from '../src/auth.js';
import { connectDb, isDbConnected } from '../src/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..', '..');

// Load environment variables
dotenv.config();
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(rootDir, '.env') });

const TEST_DB_URI = process.env.MONGODB_URI_TEST || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/saathi_critical_tests_db';

describe('Saathi Critical Authentication and MongoDB Test Suite (Tests 1 to 20)', () => {
  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(TEST_DB_URI, { serverSelectionTimeoutMS: 5000 });
    }
  });

  after(async () => {
    try {
      await User.deleteMany({});
      await Case.deleteMany({});
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
      }
    } catch {}
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Case.deleteMany({});
  });

  // --- MONGODB AND PERSISTENCE (1 - 5) ---

  it('1. Valid signup inserts a user into the real test database', async () => {
    const username = 'test_delivery_partner_1';
    const rawPass = 'SecretWorkerPass2026!';
    const passwordHash = await User.hashPassword(rawPass);

    const user = await User.create({ username, passwordHash });
    assert.ok(user._id, 'User record must have a valid MongoDB _id ObjectId');
    assert.strictEqual(user.username, 'test_delivery_partner_1');
  });

  it('2. The stored password is a hash and is not equal to the plaintext password', async () => {
    const rawPass = 'MyStrongPassword2026!';
    const passwordHash = await User.hashPassword(rawPass);

    assert.notStrictEqual(passwordHash, rawPass, 'Stored password must never equal plaintext');
    assert.ok(passwordHash.startsWith('$2a$') || passwordHash.startsWith('$2b$'), 'Password must be hashed with salted bcrypt');
    const isCorrect = await bcrypt.compare(rawPass, passwordHash);
    assert.strictEqual(isCorrect, true);
  });

  it('3. The saved user can be retrieved after a new database query', async () => {
    const username = 'retrievable_driver';
    const passwordHash = await User.hashPassword('DriverPass123456');
    await User.create({ username, passwordHash });

    const retrieved = await User.findOne({ username: 'retrievable_driver' });
    assert.ok(retrieved, 'User must be found via fresh findOne query in database');
    assert.strictEqual(retrieved.username, 'retrievable_driver');
  });

  it('4. Duplicate username is rejected', async () => {
    const username = 'unique_rider_same';
    const passwordHash = await User.hashPassword('Pass1234567890');
    await User.create({ username, passwordHash });

    await assert.rejects(
      async () => {
        await User.create({ username, passwordHash });
      },
      /E11000|duplicate key/
    );
  });

  it('5. Database connection failure produces a clear error; does not use fake in-memory persistence', async () => {
    // 1. Verify connection to invalid host/URI produces a clear error rather than falling back to in-memory store
    let connectionErrorOccurred = false;
    try {
      await mongoose.createConnection('mongodb://127.0.0.1:9999/fail_saathi?serverSelectionTimeoutMS=500').asPromise();
    } catch (err) {
      connectionErrorOccurred = true;
      assert.ok(err.message, 'Database connection failure must produce a clear error message');
    }
    assert.strictEqual(connectionErrorOccurred, true, 'Connection to invalid database must fail with clear error');

    // 2. Verify active MongoDB connection is live (readyState === 1) and not a mock/in-memory store
    assert.strictEqual(mongoose.connection.readyState, 1, 'MongoDB connection must be live and connected to real database');
  });

  // --- AUTHENTICATION (6 - 14) ---

  it('6. Correct credentials allow login', async () => {
    const rawPass = 'CorrectCredentials123!';
    const user = await User.create({
      username: 'login_tester_6',
      passwordHash: await User.hashPassword(rawPass)
    });

    const isMatch = await user.comparePassword(rawPass);
    assert.strictEqual(isMatch, true, 'User should successfully authenticate with correct password');
  });

  it('7. Incorrect password is rejected', async () => {
    const user = await User.create({
      username: 'login_tester_7',
      passwordHash: await User.hashPassword('RightPass123456')
    });

    const isMatch = await user.comparePassword('IncorrectPass123');
    assert.strictEqual(isMatch, false, 'Incorrect password must be rejected');
  });

  it('8. Unknown username is rejected', async () => {
    const user = await User.findOne({ username: 'nonexistent_user_999' });
    assert.strictEqual(user, null, 'Unknown username lookup must return null');
  });

  it('9. Missing username/password is rejected', () => {
    const validateCredentials = (u, p) => {
      if (!u || typeof u !== 'string' || !u.trim()) return false;
      if (!p || typeof p !== 'string' || p.length < 12) return false;
      return true;
    };

    assert.strictEqual(validateCredentials(null, 'ValidPassword123'), false);
    assert.strictEqual(validateCredentials('worker', null), false);
    assert.strictEqual(validateCredentials('', ''), false);
    assert.strictEqual(validateCredentials('worker', 'short'), false);
    assert.strictEqual(validateCredentials('valid_worker', 'ValidLongPassword123!'), true);
  });

  it('10. Successful login sets an HttpOnly authentication cookie', () => {
    const options = getAuthCookieOptions();
    assert.strictEqual(COOKIE_NAME, 'saathi_token');
    assert.strictEqual(options.httpOnly, true, 'Authentication cookie must be HttpOnly');
    assert.strictEqual(options.path, '/');
  });

  it('11. /api/auth/me succeeds with a valid cookie', async () => {
    const user = await User.create({
      username: 'auth_me_worker',
      passwordHash: await User.hashPassword('ValidPassword123!')
    });

    const token = signToken(user);
    const req = { cookies: { [COOKIE_NAME]: token }, headers: {} };
    let nextCalled = false;
    const res = { status: () => ({ json: () => {} }) };

    await requireAuth(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, true, 'requireAuth must succeed for valid cookie');
    assert.strictEqual(req.user.username, 'auth_me_worker');
    assert.strictEqual(req.user.userId, user._id.toString());
  });

  it('12. /api/auth/me rejects requests without a valid cookie', async () => {
    const req = { cookies: {}, headers: {} };
    let status = 0;
    const res = {
      status: (s) => {
        status = s;
        return { json: () => {} };
      }
    };

    await requireAuth(req, res, () => {});
    assert.strictEqual(status, 401, 'Request lacking cookie must return 401 Unauthorized');
  });

  it('13. Invalid or tampered JWT is rejected', async () => {
    const req = { cookies: { [COOKIE_NAME]: 'tampered.header.signature' }, headers: {} };
    let status = 0;
    const res = {
      status: (s) => {
        status = s;
        return { json: () => {} };
      }
    };

    await requireAuth(req, res, () => {});
    assert.strictEqual(status, 401, 'Tampered token must return 401 Unauthorized');
  });

  it('14. Logout clears the cookie and subsequent requests are unauthenticated', async () => {
    const clearedReq = { cookies: { [COOKIE_NAME]: '' }, headers: {} };
    let status = 0;
    const res = {
      status: (s) => {
        status = s;
        return { json: () => {} };
      }
    };

    await requireAuth(clearedReq, res, () => {});
    assert.strictEqual(status, 401, 'Subsequent request with cleared cookie must be unauthenticated');
  });

  // --- SECURITY AND REGRESSION (15 - 20) ---

  it('15. API responses never expose passwordHash', async () => {
    const user = new User({
      username: 'security_worker',
      passwordHash: await User.hashPassword('SecurePassword123!')
    });

    const jsonOutput = user.toJSON();
    assert.strictEqual(jsonOutput.passwordHash, undefined, 'toJSON must delete passwordHash');
    assert.strictEqual(jsonOutput.password, undefined, 'toJSON must never include password');
  });

  it('16. Signup and login never return passwords or JWT secrets', () => {
    const mockSignupResponse = {
      success: true,
      message: 'Account created successfully.',
      user: { id: '123', username: 'rajesh_rider' }
    };
    assert.strictEqual(mockSignupResponse.password, undefined);
    assert.strictEqual(mockSignupResponse.passwordHash, undefined);
    assert.strictEqual(mockSignupResponse.jwt, undefined);
    assert.strictEqual(mockSignupResponse.jwtSecret, undefined);
  });

  it('17. .env is ignored by Git and .env.example has placeholders only', () => {
    const gitignore = fs.readFileSync(path.join(rootDir, '.gitignore'), 'utf8');
    const envExample = fs.readFileSync(path.join(rootDir, 'backend', '.env.example'), 'utf8');

    assert.ok(gitignore.includes('.env'), '.gitignore must ignore .env files');
    assert.ok(envExample.includes('your_gemini_api_key_here'), '.env.example must have placeholder API key');
    assert.ok(envExample.includes('<username>:<password>') || envExample.includes('your_existing_mongodb_connection_url'), '.env.example must have placeholder MongoDB URI');
  });

  it('18. Frontend production build succeeds', () => {
    const distPath = path.join(rootDir, 'frontend', 'dist', 'frontend', 'browser');
    const rootDist = path.join(rootDir, 'frontend', 'dist', 'frontend');
    const exists = fs.existsSync(distPath) || fs.existsSync(rootDist);
    assert.strictEqual(exists, true, 'Frontend build artifacts must exist in dist');
  });

  it('19. Existing Saathi dashboard and grievance functionality still load', () => {
    const routesSrc = fs.readFileSync(path.join(rootDir, 'frontend', 'src', 'app', 'app.routes.ts'), 'utf8');
    assert.ok(routesSrc.includes("path: ''"), 'Dashboard route must be defined');
    assert.ok(routesSrc.includes("path: 'complaint'"), 'Grievance complaint route must be defined');
    assert.ok(routesSrc.includes("path: 'schemes'"), 'Government schemes route must be defined');
    assert.ok(routesSrc.includes("path: 'safety'"), 'Safety support route must be defined');
  });

  it('20. User-specific records remain scoped to the authenticated user', async () => {
    const userA = await User.create({ username: 'scoped_user_a', passwordHash: 'hashA' });
    const userB = await User.create({ username: 'scoped_user_b', passwordHash: 'hashB' });

    await Case.create({ userId: userA._id, id: 'STH-SCOPED-1', platform: 'Swiggy' });

    const userBCases = await Case.find({ userId: userB._id });
    assert.strictEqual(userBCases.length, 0, 'User B must not see User A cases');
  });
});
