import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { I18nService } from '../../../services/i18n.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page animate-fade-in">
      <div class="auth-card saathi-card">
        <!-- Logo & Header -->
        <div class="auth-header">
          <div class="brand-avatar-lg">साथी</div>
          <h1 class="auth-title">
            {{ i18n.currentLanguage() === 'hi' ? 'साथी में नया खाता बनाएं' : i18n.currentLanguage() === 'pa' ? 'ਸਾਥੀ ਵਿੱਚ ਖਾਤਾ ਬਣਾਓ' : 'Join Saathi' }}
          </h1>
          <p class="auth-subtitle">
            {{ i18n.currentLanguage() === 'hi'
              ? 'गिग एवं असंगठित कामगारों के लिए नि:शुल्क डिजिटल सहायता और सुरक्षित केस प्रबंधन'
              : i18n.currentLanguage() === 'pa'
              ? 'ਗਿਗ ਕਾਮਿਆਂ ਲਈ ਮੁਫ਼ਤ ਡਿਜੀਟਲ ਸਹਾਇਤਾ ਅਤੇ ਕੇਸ ਪ੍ਰਬੰਧਨ'
              : 'Free grievance drafting, scheme discovery, and secure case tracking for gig workers' }}
          </p>
        </div>

        <!-- Feedback Alert Messages -->
        <div *ngIf="errorMessage()" class="alert-box alert-error" role="alert" id="signup-error-message">
          <span class="alert-icon">⚠️</span>
          <span class="alert-text">{{ errorMessage() }}</span>
        </div>

        <div *ngIf="successMessage()" class="alert-box alert-success" role="status" id="signup-success-message">
          <span class="alert-icon">✅</span>
          <span class="alert-text">{{ successMessage() }}</span>
        </div>

        <!-- Signup Form -->
        <form (ngSubmit)="onSubmit()" #signupForm="ngForm" class="auth-form" novalidate id="signup-form">
          <!-- Username Input -->
          <div class="form-group">
            <label for="username" class="form-label">
              {{ i18n.currentLanguage() === 'hi' ? 'उपयोगकर्ता नाम (Username)' : i18n.currentLanguage() === 'pa' ? 'ਵਰਤੋਂਕਾਰ ਨਾਂ (Username)' : 'Username' }}
              <span class="req">*</span>
            </label>
            <div class="input-wrapper">
              <span class="input-icon">👤</span>
              <input
                type="text"
                id="username"
                name="username"
                class="form-control"
                [(ngModel)]="username"
                #usernameField="ngModel"
                required
                minlength="3"
                maxlength="30"
                autocomplete="username"
                placeholder="e.g. rajesh_rider"
                [class.is-invalid]="(usernameField.invalid && (usernameField.dirty || usernameField.touched || submitted)) || usernameValidationError"
              />
            </div>
            <span class="field-hint">
              {{ i18n.currentLanguage() === 'hi' ? '3-30 अक्षर, केवल अंग्रेज़ी अक्षर, संख्याएँ, बिंदु, डैश' : '3-30 chars, alphanumeric, dots, underscores, or dashes' }}
            </span>
            <div *ngIf="usernameValidationError" class="field-error">
              {{ usernameValidationError }}
            </div>
          </div>

          <!-- Password Input with Show/Hide Toggle -->
          <div class="form-group">
            <label for="password" class="form-label">
              {{ i18n.currentLanguage() === 'hi' ? 'पासवर्ड (Password)' : i18n.currentLanguage() === 'pa' ? 'ਪਾਸਵਰਡ (Password)' : 'Password' }}
              <span class="req">*</span>
            </label>
            <div class="input-wrapper">
              <span class="input-icon">🔒</span>
              <input
                [type]="showPassword ? 'text' : 'password'"
                id="password"
                name="password"
                class="form-control"
                [(ngModel)]="password"
                #passwordField="ngModel"
                required
                minlength="12"
                autocomplete="new-password"
                placeholder="At least 12 characters"
                [class.is-invalid]="passwordField.invalid && (passwordField.dirty || passwordField.touched || submitted)"
              />
              <button
                type="button"
                class="btn-toggle-pwd"
                (click)="togglePasswordVisibility()"
                [attr.aria-label]="showPassword ? 'Hide password' : 'Show password'">
                {{ showPassword ? '👁️' : '🙈' }}
              </button>
            </div>
            <!-- Password Policy Requirement -->
            <div class="pwd-requirement" [class.satisfied]="password.length >= 12">
              <span class="req-icon">{{ password.length >= 12 ? '✓' : '•' }}</span>
              <span>{{ i18n.currentLanguage() === 'hi' ? 'पासवर्ड कम से कम 12 अक्षरों का होना आवश्यक है' : 'Password must be at least 12 characters long' }}</span>
            </div>
          </div>

          <!-- Confirm Password Input -->
          <div class="form-group">
            <label for="confirmPassword" class="form-label">
              {{ i18n.currentLanguage() === 'hi' ? 'पासवर्ड की पुष्टि करें (Confirm Password)' : i18n.currentLanguage() === 'pa' ? 'ਪਾਸਵਰਡ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ' : 'Confirm Password' }}
              <span class="req">*</span>
            </label>
            <div class="input-wrapper">
              <span class="input-icon">🔐</span>
              <input
                [type]="showConfirmPassword ? 'text' : 'password'"
                id="confirmPassword"
                name="confirmPassword"
                class="form-control"
                [(ngModel)]="confirmPassword"
                #confirmPasswordField="ngModel"
                required
                autocomplete="new-password"
                placeholder="Re-enter your password"
                [class.is-invalid]="(password !== confirmPassword && (confirmPasswordField.dirty || confirmPasswordField.touched || submitted))"
              />
              <button
                type="button"
                class="btn-toggle-pwd"
                (click)="toggleConfirmPasswordVisibility()"
                [attr.aria-label]="showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'">
                {{ showConfirmPassword ? '👁️' : '🙈' }}
              </button>
            </div>
            <div *ngIf="password !== confirmPassword && (confirmPasswordField.dirty || confirmPasswordField.touched || submitted)" class="field-error">
              {{ i18n.currentLanguage() === 'hi' ? 'दोनों पासवर्ड समान होने चाहिए' : 'Passwords do not match' }}
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            id="signup-submit-btn"
            class="btn btn-primary btn-auth-submit"
            [disabled]="loading() || isSubmitting">
            <span *ngIf="loading() || isSubmitting" class="spinner-small" aria-hidden="true"></span>
            <span>{{ (loading() || isSubmitting) ? (i18n.currentLanguage() === 'hi' ? 'खाता बन रहा है...' : 'Creating Account...') : i18n.t.navSignup }}</span>
          </button>
        </form>

        <!-- Footer Link to Login -->
        <div class="auth-footer">
          <p>
            {{ i18n.currentLanguage() === 'hi' ? 'क्या आपके पास पहले से खाता है?' : i18n.currentLanguage() === 'pa' ? 'ਕੀ ਤੁਹਾਡੇ ਕੋਲ ਪਹਿਲਾਂ ਹੀ ਖਾਤਾ ਹੈ?' : 'Already have an account?' }}
            <a routerLink="/login" id="link-to-login" class="auth-link">
              {{ i18n.currentLanguage() === 'hi' ? 'यहाँ लॉग इन करें' : i18n.currentLanguage() === 'pa' ? 'ਇੱਥੇ ਲਾਗ ਇਨ ਕਰੋ' : 'Log In' }}
            </a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(85vh - 70px);
      padding: 1.5rem 1rem;
    }
    .auth-card {
      width: 100%;
      max-width: 460px;
      padding: 2.25rem 2rem;
      background: #ffffff;
      border-radius: var(--radius-lg, 16px);
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
      border: 1px solid var(--border, #e2e8f0);
    }
    .auth-header {
      text-align: center;
      margin-bottom: 1.75rem;
    }
    .brand-avatar-lg {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 58px;
      height: 58px;
      background: linear-gradient(135deg, var(--primary, #0284c7), #0369a1);
      color: #ffffff;
      font-weight: 800;
      font-size: 1.5rem;
      border-radius: 14px;
      margin-bottom: 0.85rem;
      box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);
    }
    .auth-title {
      font-size: 1.45rem;
      font-weight: 700;
      color: var(--text-main, #0f172a);
      margin: 0 0 0.4rem 0;
    }
    .auth-subtitle {
      font-size: 0.88rem;
      color: var(--text-muted, #64748b);
      margin: 0;
      line-height: 1.4;
    }
    .alert-box {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.85rem 1rem;
      border-radius: 10px;
      font-size: 0.88rem;
      margin-bottom: 1.25rem;
    }
    .alert-error {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #b91c1c;
    }
    .alert-success {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #15803d;
    }
    .form-group {
      margin-bottom: 1.2rem;
      text-align: left;
    }
    .form-label {
      display: block;
      font-weight: 600;
      font-size: 0.88rem;
      color: var(--text-main, #1e293b);
      margin-bottom: 0.45rem;
    }
    .req {
      color: #ef4444;
    }
    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    .input-icon {
      position: absolute;
      left: 12px;
      font-size: 1.05rem;
      color: #94a3b8;
      pointer-events: none;
    }
    .form-control {
      width: 100%;
      padding: 0.75rem 0.85rem 0.75rem 2.5rem;
      border: 1.5px solid var(--border, #cbd5e1);
      border-radius: 10px;
      font-size: 0.95rem;
      background: #f8fafc;
      color: #0f172a;
      transition: all 0.2s ease;
      box-sizing: border-box;
    }
    .form-control:focus {
      outline: none;
      background: #ffffff;
      border-color: var(--primary, #0284c7);
      box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
    }
    .form-control.is-invalid {
      border-color: #ef4444;
      background: #fffafa;
    }
    .field-hint {
      display: block;
      font-size: 0.75rem;
      color: #64748b;
      margin-top: 0.3rem;
    }
    .pwd-requirement {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.78rem;
      color: #64748b;
      margin-top: 0.35rem;
    }
    .pwd-requirement.satisfied {
      color: #16a34a;
      font-weight: 600;
    }
    .btn-toggle-pwd {
      position: absolute;
      right: 10px;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.1rem;
      padding: 4px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .btn-toggle-pwd:focus {
      outline: 2px solid var(--primary, #0284c7);
    }
    .field-error {
      font-size: 0.8rem;
      color: #dc2626;
      margin-top: 0.35rem;
    }
    .btn-auth-submit {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.85rem;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 10px;
      margin-top: 0.75rem;
      cursor: pointer;
    }
    .btn-auth-submit:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }
    .spinner-small {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .auth-footer {
      text-align: center;
      margin-top: 1.5rem;
      padding-top: 1.25rem;
      border-top: 1px solid var(--border, #f1f5f9);
      font-size: 0.88rem;
      color: var(--text-muted, #64748b);
    }
    .auth-link {
      color: var(--primary, #0284c7);
      font-weight: 600;
      text-decoration: none;
      margin-left: 0.25rem;
    }
    .auth-link:hover {
      text-decoration: underline;
    }
  `]
})
export class SignupComponent {
  auth = inject(AuthService);
  i18n = inject(I18nService);
  router = inject(Router);

  username = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  showConfirmPassword = false;
  submitted = false;
  isSubmitting = false;

  usernameValidationError: string | null = null;
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  get loading() {
    return this.auth.loading;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage.set(null);
    this.usernameValidationError = null;

    // Prevent duplicate submissions caused by multiple clicks (B19)
    if (this.isSubmitting || this.loading()) {
      return;
    }

    const trimmedUser = this.username.trim();

    // Validation checks (A4, A8, A9, A10, A11)
    if (!trimmedUser) {
      this.usernameValidationError = 'Username is required and cannot be empty.';
      return;
    }

    if (trimmedUser.length < 3 || trimmedUser.length > 30) {
      this.usernameValidationError = 'Username must be between 3 and 30 characters.';
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_.-]+$/;
    if (!usernameRegex.test(trimmedUser)) {
      this.usernameValidationError = 'Username can only contain letters, numbers, dots, dashes, and underscores.';
      return;
    }

    if (!this.password || this.password.length < 12) {
      this.errorMessage.set('Password must be at least 12 characters long.');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage.set('Passwords do not match.');
      return;
    }

    this.isSubmitting = true;

    this.auth.signup({
      username: trimmedUser.toLowerCase(),
      password: this.password,
      confirmPassword: this.confirmPassword
    }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessage.set(
          this.i18n.currentLanguage() === 'hi'
            ? 'खाता सफलतापूर्वक बन गया! आपको डैशबोर्ड पर ले जाया जा रहा है...'
            : 'Account created successfully! Redirecting to dashboard...'
        );
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 500);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage.set(err.message || 'Signup failed. Please try again.');
      }
    });
  }
}
