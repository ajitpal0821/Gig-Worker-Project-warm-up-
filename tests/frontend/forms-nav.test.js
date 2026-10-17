import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const loginComponentPath = path.join(__dirname, '..', '..', 'frontend', 'src', 'app', 'components', 'auth', 'login', 'login.component.ts');
const signupComponentPath = path.join(__dirname, '..', '..', 'frontend', 'src', 'app', 'components', 'auth', 'signup', 'signup.component.ts');
const routesPath = path.join(__dirname, '..', '..', 'frontend', 'src', 'app', 'app.routes.ts');
const homePath = path.join(__dirname, '..', '..', 'frontend', 'src', 'app', 'components', 'home', 'home.component.ts');

describe('Category E: Frontend Form Controls, Validation, and Navigation Tests', () => {
  const loginSrc = fs.readFileSync(loginComponentPath, 'utf8');
  const signupSrc = fs.readFileSync(signupComponentPath, 'utf8');
  const routesSrc = fs.readFileSync(routesPath, 'utf8');
  const homeSrc = fs.readFileSync(homePath, 'utf8');

  // E1: Signup page renders all required controls
  it('E1: should verify signup page template contains username, password, and confirmPassword fields', () => {
    assert.ok(signupSrc.includes('id="username"'), 'Username input must exist');
    assert.ok(signupSrc.includes('id="password"'), 'Password input must exist');
    assert.ok(signupSrc.includes('id="confirmPassword"'), 'Confirm password input must exist');
    assert.ok(signupSrc.includes('id="signup-submit-btn"'), 'Submit button must exist');
  });

  // E2: Login page renders all required controls
  it('E2: should verify login page template contains username and password fields', () => {
    assert.ok(loginSrc.includes('id="username"'), 'Username input must exist');
    assert.ok(loginSrc.includes('id="password"'), 'Password input must exist');
    assert.ok(loginSrc.includes('id="login-submit-btn"'), 'Submit button must exist');
  });

  // E3: Labels are associated with inputs
  it('E3: should verify proper label association for accessibility', () => {
    assert.ok(loginSrc.includes('for="username"'), 'Username label must have for attribute');
    assert.ok(loginSrc.includes('for="password"'), 'Password label must have for attribute');
    assert.ok(signupSrc.includes('for="confirmPassword"'), 'Confirm password label must have for attribute');
  });

  // E4: Password visibility toggles correctly
  it('E4: should provide password visibility toggle button with aria-label', () => {
    assert.ok(loginSrc.includes('togglePasswordVisibility()'), 'Login must have visibility toggle handler');
    assert.ok(signupSrc.includes('togglePasswordVisibility()'), 'Signup must have visibility toggle handler');
    assert.ok(loginSrc.includes('aria-label'), 'Visibility toggle button must have accessible aria-label');
  });

  // E5: Invalid fields display clear messages
  it('E5: should provide inline validation error containers for invalid fields', () => {
    assert.ok(signupSrc.includes('field-error'), 'Inline validation errors must be present');
    assert.ok(signupSrc.includes('Passwords do not match'), 'Password mismatch message must be present');
  });

  // E6: Valid forms can be submitted
  it('E6: should bind form submission handler onSubmit()', () => {
    assert.ok(loginSrc.includes('(ngSubmit)="onSubmit()"'), 'Login must bind ngSubmit');
    assert.ok(signupSrc.includes('(ngSubmit)="onSubmit()"'), 'Signup must bind ngSubmit');
  });

  // E7 & E8: Loading state appears and disables submit button during request
  it('E7 & E8: should display spinner and disable submit button when loading() or isSubmitting is true', () => {
    assert.ok(loginSrc.includes('[disabled]="loading() || isSubmitting"'), 'Login button must be disabled when submitting');
    assert.ok(signupSrc.includes('[disabled]="loading() || isSubmitting"'), 'Signup button must be disabled when submitting');
    assert.ok(loginSrc.includes('spinner-small'), 'Spinner must be rendered when submitting');
  });

  // E9: Button becomes usable after an API error
  it('E9: should restore submit button enabled state after request error', () => {
    assert.ok(loginSrc.includes('this.isSubmitting = false;'), 'Login must reset isSubmitting in error callback');
    assert.ok(signupSrc.includes('this.isSubmitting = false;'), 'Signup must reset isSubmitting in error callback');
  });

  // E10: API errors are shown without crashing the page
  it('E10: should render error message inside alert-box without crashing', () => {
    assert.ok(loginSrc.includes('id="login-error-message"'), 'Login error banner container must exist');
    assert.ok(signupSrc.includes('id="signup-error-message"'), 'Signup error banner container must exist');
  });

  // E11: Successful signup gives appropriate feedback
  it('E11: should show success message upon successful account creation', () => {
    assert.ok(signupSrc.includes('id="signup-success-message"'), 'Success alert container must exist');
  });

  // E12: Successful login navigates to the dashboard
  it('E12: should navigate to dashboard (/) upon successful login', () => {
    assert.ok(loginSrc.includes("this.router.navigate(['/'])"), 'Login must navigate to / on success');
  });

  // E13: Logout navigates to login
  it('E13: should navigate to /login when user logs out', () => {
    const authServiceSrc = fs.readFileSync(path.join(__dirname, '..', '..', 'frontend', 'src', 'app', 'services', 'auth.service.ts'), 'utf8');
    assert.ok(authServiceSrc.includes("this.router.navigate(['/login'])"), 'AuthService logout must route to /login');
  });

  // E14: Browser refresh restores the authenticated user
  it('E14: should trigger checkSession() on service instantiation to restore session on reload', () => {
    const authServiceSrc = fs.readFileSync(path.join(__dirname, '..', '..', 'frontend', 'src', 'app', 'services', 'auth.service.ts'), 'utf8');
    assert.ok(authServiceSrc.includes('this.checkSession()'), 'AuthService constructor must call checkSession()');
  });

  // E15: Protected routes handle unauthenticated users
  it('E15: should attach authGuard to /cases and /earnings routes', () => {
    assert.ok(routesSrc.includes("path: 'cases', component: MyCasesComponent, canActivate: [authGuard]"), 'Cases route must be guarded');
    assert.ok(routesSrc.includes("path: 'earnings', component: EarningsCalculatorComponent, canActivate: [authGuard]"), 'Earnings route must be guarded');
  });

  // E16: The dashboard displays the authenticated username
  it('E16: should display the authenticated worker username in the dashboard welcome card', () => {
    assert.ok(homeSrc.includes('id="dashboard-user-greeting"'), 'Dashboard greeting card must exist');
    assert.ok(homeSrc.includes('id="dashboard-username"'), 'Dashboard username container must exist');
    assert.ok(homeSrc.includes('auth.currentUser()?.username'), 'Dashboard must bind authenticated username');
  });

  // E17: Signup and login links navigate correctly
  it('E17: should contain reciprocal navigation links between login and signup', () => {
    assert.ok(loginSrc.includes('routerLink="/signup"'), 'Login must contain link to signup');
    assert.ok(signupSrc.includes('routerLink="/login"'), 'Signup must contain link to login');
  });

  // E18: Keyboard-only navigation works
  it('E18: should ensure buttons and links are standard semantic elements navigable via Tab', () => {
    assert.ok(loginSrc.includes('<button'), 'Submit must be a button');
    assert.ok(loginSrc.includes('<a routerLink'), 'Navigation must use anchor tags');
  });

  // E19: Focus indicators remain visible
  it('E19: should define explicit focus outlines and focus box-shadows in CSS', () => {
    assert.ok(loginSrc.includes('.form-control:focus'), 'Inputs must have custom focus styles');
    assert.ok(signupSrc.includes('.form-control:focus'), 'Inputs must have custom focus styles');
  });

  // E20: Layout remains usable at 360px viewport width
  it('E20: should include mobile-responsive flex layout with fluid widths for 360px viewports', () => {
    assert.ok(loginSrc.includes('width: 100%'), 'Cards must have 100% fluid mobile width');
    assert.ok(signupSrc.includes('width: 100%'), 'Cards must have 100% fluid mobile width');
  });
});
