import { run } from 'node:test';
import { spec } from 'node:test/reporters';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const testFiles = [
  // Backend & AI Tests
  path.join(__dirname, 'backend', 'tests', 'complaint.test.js'),
  path.join(__dirname, 'backend', 'tests', 'schemes.test.js'),
  path.join(__dirname, 'backend', 'tests', 'security-audit.test.js'),

  // Category A: Worker Signup Security Tests
  path.join(__dirname, 'backend', 'tests', 'auth-signup.test.js'),

  // Category B: Worker Login & Credentials Tests
  path.join(__dirname, 'backend', 'tests', 'auth-login.test.js'),

  // Category C: Session & Token Security Tests
  path.join(__dirname, 'backend', 'tests', 'auth-session.test.js'),

  // Category D: Authorization & User Isolation Tests
  path.join(__dirname, 'backend', 'tests', 'user-isolation.test.js'),

  // Critical 20-Point Authentication & Persistence Test Suite
  path.join(__dirname, 'backend', 'tests', 'critical-auth.test.js'),

  // Frontend Calculations, Storage & i18n
  path.join(__dirname, 'tests', 'frontend', 'earnings.test.js'),
  path.join(__dirname, 'tests', 'frontend', 'storage.test.js'),
  path.join(__dirname, 'tests', 'frontend', 'i18n.test.js'),
  path.join(__dirname, 'tests', 'frontend', 'safety.test.js'),

  // Category E: Frontend Form Controls & Navigation Tests
  path.join(__dirname, 'tests', 'frontend', 'forms-nav.test.js'),

  // Category G: Build, Secrets, Security & Deployment Tests
  path.join(__dirname, 'tests', 'security-deployment.test.js'),

  // Worker Workflow Integration
  path.join(__dirname, 'tests', 'e2e-workflow.test.js')
];

console.log('======================================================');
console.log('   Saathi Automated Comprehensive Test Suite');
console.log('======================================================');
console.log(`Running ${testFiles.length} test suites...\n`);

run({ files: testFiles })
  .on('test:fail', () => {
    process.exitCode = 1;
  })
  .compose(new spec())
  .pipe(process.stdout);
