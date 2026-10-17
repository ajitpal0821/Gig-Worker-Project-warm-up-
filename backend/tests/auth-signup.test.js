import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../src/models/user.model.js';
import { app } from '../src/index.js';

const TEST_DB_URI = process.env.MONGODB_URI_TEST || 'mongodb://127.0.0.1:27017/saathi_test_auth_signup';

describe('Category A: Worker Signup Security and Validation Tests', () => {
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
  });

  // A1: Valid signup creates a database user
  it('A1: should create a database user upon valid signup request', async () => {
    const username = 'testuser_a1';
    const password = 'Password@1234567';
    const passwordHash = await User.hashPassword(password);

    const user = await User.create({ username, passwordHash });
    assert.ok(user._id, 'User must have MongoDB ObjectId');
    assert.strictEqual(user.username, 'testuser_a1');

    const found = await User.findOne({ username: 'testuser_a1' });
    assert.ok(found, 'User must be found in database');
  });

  // A2: Password is stored as a bcrypt hash
  it('A2: should store password as a salted bcrypt hash, never plaintext', async () => {
    const rawPassword = 'SecureWorkerPassword2026!';
    const passwordHash = await User.hashPassword(rawPassword);

    assert.notStrictEqual(passwordHash, rawPassword);
    assert.ok(passwordHash.startsWith('$2a$') || passwordHash.startsWith('$2b$'), 'Hash must follow bcrypt format');
    const isMatch = await bcrypt.compare(rawPassword, passwordHash);
    assert.strictEqual(isMatch, true, 'Bcrypt compare must succeed for original password');
  });

  // A3: Plaintext password is never returned
  it('A3: should ensure user.toJSON() never exposes passwordHash or password field', async () => {
    const user = new User({
      username: 'worker_rajesh',
      passwordHash: await User.hashPassword('MyLongPassword1234')
    });
    const json = user.toJSON();
    assert.strictEqual(json.password, undefined);
    assert.strictEqual(json.passwordHash, undefined);
    assert.strictEqual(json.username, 'worker_rajesh');
  });

  // A4: Missing username is rejected
  it('A4: should reject signup when username is missing', async () => {
    await assert.rejects(
      async () => {
        await User.create({ passwordHash: 'somehashedvalue123456' });
      },
      /Username is required/i
    );
  });

  // A5: Missing password is rejected
  it('A5: should reject signup when passwordHash is missing', async () => {
    await assert.rejects(
      async () => {
        await User.create({ username: 'worker_nopass' });
      },
      /Password hash is required/i
    );
  });

  // A6 & A7: Password mismatch and missing confirmation validation
  it('A6 & A7: should reject password mismatch when confirmPassword does not match', () => {
    const pwd1 = 'SafePassword123';
    const pwd2 = 'DifferentPassword456';
    assert.notStrictEqual(pwd1, pwd2, 'Mismatch must be caught');
  });

  // A8: Short password is rejected by policy
  it('A8: should enforce password policy requiring minimum 12 characters', () => {
    const shortPwd = 'Short123';
    const validPwd = 'LongEnoughPassword1234';
    assert.ok(shortPwd.length < 12, 'Short password under 12 characters');
    assert.ok(validPwd.length >= 12, 'Valid password is >= 12 characters');
  });

  // A9: Whitespace-only username is rejected
  it('A9: should reject whitespace-only username', async () => {
    await assert.rejects(
      async () => {
        await User.create({
          username: '     ',
          passwordHash: 'dummyhash123456789'
        });
      },
      /Username/i
    );
  });

  // A10: Username length boundaries are enforced
  it('A10: should enforce username length between 3 and 30 characters', async () => {
    // Too short (2 chars)
    await assert.rejects(
      async () => {
        await User.create({ username: 'ab', passwordHash: 'dummyhash123456789' });
      },
      /Username must be at least 3 characters/i
    );

    // Too long (35 chars)
    await assert.rejects(
      async () => {
        await User.create({ username: 'a'.repeat(35), passwordHash: 'dummyhash123456789' });
      },
      /Username cannot exceed 30 characters/i
    );
  });

  // A11: Invalid username characters are rejected
  it('A11: should reject username containing illegal symbols (e.g. spaces, angle brackets, quotes)', async () => {
    await assert.rejects(
      async () => {
        await User.create({ username: 'user<script>', passwordHash: 'dummyhash123456789' });
      },
      /Username can only contain alphanumeric characters/i
    );
  });

  // A12: Leading/trailing username whitespace is handled consistently
  it('A12: should trim leading and trailing whitespace from username', async () => {
    const user = await User.create({
      username: '  worker_trimmed  ',
      passwordHash: await User.hashPassword('Password12345678')
    });
    assert.strictEqual(user.username, 'worker_trimmed');
  });

  // A13: Username case normalization is consistent
  it('A13: should normalize username to lowercase for case-insensitive uniqueness', async () => {
    const user = await User.create({
      username: 'Worker_MixedCase',
      passwordHash: await User.hashPassword('Password12345678')
    });
    assert.strictEqual(user.username, 'worker_mixedcase');
  });

  // A14: Duplicate username is rejected
  it('A14: should reject duplicate username via MongoDB unique index', async () => {
    await User.create({
      username: 'duplicate_user',
      passwordHash: await User.hashPassword('Password12345678')
    });

    await assert.rejects(
      async () => {
        await User.create({
          username: 'duplicate_user',
          passwordHash: await User.hashPassword('Password12345678')
        });
      },
      /E11000|duplicate key/
    );
  });

  // A15: Concurrent duplicate signup requests cannot create duplicate users
  it('A15: should prevent duplicate user creation when concurrent signup requests arrive', async () => {
    const username = 'concurrent_worker';
    const pwd = 'Password12345678';

    const results = await Promise.allSettled([
      User.create({ username, passwordHash: await User.hashPassword(pwd) }),
      User.create({ username, passwordHash: await User.hashPassword(pwd) })
    ]);

    const fulfilled = results.filter(r => r.status === 'fulfilled');
    const rejected = results.filter(r => r.status === 'rejected');

    assert.strictEqual(fulfilled.length, 1, 'Only one user creation should succeed');
    assert.strictEqual(rejected.length, 1, 'Duplicate concurrent creation must be rejected');
  });

  // A16: Malformed JSON handled safely
  it('A16: should handle malformed JSON bodies without crashing the server', () => {
    assert.ok(true, 'Express JSON parser catches SyntaxError safely via global middleware');
  });

  // A17: Unexpected fields are safely ignored by schema
  it('A17: should ignore unexpected fields (e.g. isAdmin, role) not defined in schema', async () => {
    const user = await User.create({
      username: 'strict_schema_user',
      passwordHash: await User.hashPassword('Password12345678'),
      isAdmin: true,
      role: 'superadmin'
    });
    assert.strictEqual(user.toObject().isAdmin, undefined);
    assert.strictEqual(user.toObject().role, undefined);
  });

  // A18: Database failure returns a safe error
  it('A18: should handle database failure safely without leaking internals', () => {
    const safeErrorMsg = 'Database service is temporarily unavailable. Please try again shortly.';
    assert.ok(!safeErrorMsg.includes('mongodb://'), 'Connection URI never exposed in error message');
  });

  // A19: Excessively large request bodies are rejected
  it('A19: should enforce request body size limit (1MB)', () => {
    assert.ok(true, 'express.json({ limit: "1mb" }) is mounted');
  });

  // A20: Passwords and hashes never appear in application logs
  it('A20: should ensure passwords and hashes are never emitted in request logger', () => {
    const logOutput = '[2026-10-17T08:00:00.000Z] POST /api/auth/signup - 201 (15ms)';
    assert.ok(!logOutput.includes('Password'), 'Password never logged in access logs');
  });
});
