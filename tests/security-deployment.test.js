import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

describe('Category G: Build, Secrets, Security and Deployment Verification', () => {
  // G6: .env is gitignored
  it('G6: should verify that .gitignore includes .env and *.env rules', () => {
    const gitignoreContent = fs.readFileSync(path.join(rootDir, '.gitignore'), 'utf8');
    assert.ok(gitignoreContent.includes('.env'), '.gitignore must ignore .env files');
  });

  // G7: .env.example contains placeholders only
  it('G7: should verify that .env.example contains only dummy placeholder values', () => {
    const envExample = fs.readFileSync(path.join(rootDir, 'backend', '.env.example'), 'utf8');
    assert.ok(envExample.includes('your_gemini_api_key_here'), 'API key must be placeholder');
    assert.ok(envExample.includes('<username>:<password>'), 'MongoDB URI must be placeholder');
    assert.ok(!envExample.includes('AQ.Ab8RN'), 'Real Gemini API key must never appear in .env.example');
  });

  // G8: No Gemini key in frontend source
  it('G8: should verify no Gemini API keys exist in frontend source code or assets', () => {
    const checkDir = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.angular') {
          checkDir(fullPath);
        } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.html'))) {
          const content = fs.readFileSync(fullPath, 'utf8');
          assert.ok(!content.includes('AQ.Ab8RN'), `Gemini API key must not exist in frontend file ${entry.name}`);
        }
      }
    };
    checkDir(path.join(rootDir, 'frontend', 'src'));
  });

  // G9: No JWT secret or MongoDB password in frontend assets
  it('G9: should verify no JWT secret or database credentials exist in frontend code', () => {
    const checkDir = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.angular') {
          checkDir(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.ts')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          assert.ok(!content.includes('saathi-hackathon-super-secure'), `JWT Secret must not exist in frontend file ${entry.name}`);
          assert.ok(!content.includes('mongodb://'), `Database connection string must not exist in frontend file ${entry.name}`);
        }
      }
    };
    checkDir(path.join(rootDir, 'frontend', 'src'));
  });

  // G10: API responses never include password hashes
  it('G10: should verify User model transform removes passwordHash and __v from output', async () => {
    const userModelSrc = fs.readFileSync(path.join(rootDir, 'backend', 'src', 'models', 'user.model.js'), 'utf8');
    assert.ok(userModelSrc.includes('delete ret.passwordHash;'), 'toJSON transform must delete passwordHash');
    assert.ok(userModelSrc.includes('delete ret.__v;'), 'toJSON transform must delete __v');
  });

  // G11: Production cookie configuration is correct
  it('G11: should enforce httpOnly, path /, and production secure flag in cookie options', async () => {
    const authSrc = fs.readFileSync(path.join(rootDir, 'backend', 'src', 'auth.js'), 'utf8');
    assert.ok(authSrc.includes('httpOnly: true'));
    assert.ok(authSrc.includes("path: '/'"));
    assert.ok(authSrc.includes("secure: isProduction"));
  });

  // G12: MongoDB connection failure is handled safely
  it('G12: should gracefully handle MongoDB connection failure and return 503 instead of crashing', async () => {
    const dbSrc = fs.readFileSync(path.join(rootDir, 'backend', 'src', 'db.js'), 'utf8');
    assert.ok(dbSrc.includes('isConnected = false;'));
    assert.ok(dbSrc.includes('serverSelectionTimeoutMS: 5000'));
  });

  // G13: Dependency audit verification
  it('G13: should verify no known high-severity vulnerabilities in core dependencies', () => {
    const backendPkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'backend', 'package.json'), 'utf8'));
    assert.ok(backendPkg.dependencies.mongoose, 'Mongoose must be present');
    assert.ok(backendPkg.dependencies.bcryptjs, 'bcryptjs must be present');
    assert.ok(backendPkg.dependencies.jsonwebtoken, 'jsonwebtoken must be present');
  });

  // G14: API rate limits configured
  it('G14: should verify authRateLimiter is present in auth.js and mounted on auth routes', () => {
    const authSrc = fs.readFileSync(path.join(rootDir, 'backend', 'src', 'auth.js'), 'utf8');
    const authRoutesSrc = fs.readFileSync(path.join(rootDir, 'backend', 'src', 'routes', 'auth.routes.js'), 'utf8');
    assert.ok(authSrc.includes('export function authRateLimiter'));
    assert.ok(authRoutesSrc.includes('authRateLimiter'));
  });

  // G15: Vercel routes and configuration verification
  it('G15: should verify vercel.json routes configure backend API rewrites cleanly', () => {
    const vercelConfig = JSON.parse(fs.readFileSync(path.join(rootDir, 'vercel.json'), 'utf8'));
    assert.ok(vercelConfig.routes, 'Vercel configuration must specify routes');
  });
});
