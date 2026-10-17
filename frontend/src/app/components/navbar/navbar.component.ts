import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { I18nService } from '../../services/i18n.service';
import { SaathiApiService } from '../../services/saathi-api.service';
import { StorageService } from '../../services/storage.service';
import { AppLanguage } from '../../models/saathi.models';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="saathi-navbar">
      <div class="nav-container">
        <!-- Logo and App Name -->
        <a routerLink="/" class="nav-brand">
          <div class="brand-avatar">साथी</div>
          <div class="brand-text">
            <span class="brand-title">Saathi</span>
            <span class="brand-badge">{{ i18n.currentLanguage() === 'hi' ? 'गिग कामगार साथी' : i18n.currentLanguage() === 'pa' ? 'ਕਾਮਿਆਂ ਦਾ ਸਾਥੀ' : 'Gig Worker AI' }}</span>
          </div>
        </a>

        <!-- Right Side: API Status Indicator & Language Switcher -->
        <div class="nav-controls">
          <!-- Backend Status Indicator -->
          <div class="status-indicator" [class.online]="backendOnline" [class.offline]="!backendOnline" [title]="backendStatusText">
            <span class="status-dot"></span>
            <span class="status-label">{{ backendOnline ? (geminiActive ? 'Gemini AI' : 'Local AI') : 'Offline' }}</span>
          </div>

          <!-- Language Selector Chips -->
          <div class="lang-switch-group" role="group" aria-label="Select Language">
            <button 
              type="button"
              class="lang-chip" 
              [class.active]="i18n.currentLanguage() === 'en'"
              (click)="selectLanguage('en')"
              title="English">
              EN
            </button>
            <button 
              type="button"
              class="lang-chip" 
              [class.active]="i18n.currentLanguage() === 'hi'"
              (click)="selectLanguage('hi')"
              title="हिंदी (Hindi)">
              हिं
            </button>
            <button 
              type="button"
              class="lang-chip" 
              [class.active]="i18n.currentLanguage() === 'pa'"
              (click)="selectLanguage('pa')"
              title="ਪੰਜਾਬੀ (Punjabi)">
              ਪੰ
            </button>
          </div>

          <!-- User Authentication State Section -->
          <div class="auth-nav-section">
            <ng-container *ngIf="auth.isAuthenticated(); else guestNav">
              <div class="user-badge" id="nav-user-badge">
                <span class="user-icon">👤</span>
                <span class="user-name">{{ auth.currentUser()?.username }}</span>
                <button
                  type="button"
                  id="nav-logout-btn"
                  class="btn-logout"
                  (click)="onLogout()"
                  title="Logout">
                  🚪 <span class="logout-label">{{ i18n.t.navLogout }}</span>
                </button>
              </div>
            </ng-container>
            <ng-template #guestNav>
              <div class="guest-nav-group">
                <a routerLink="/login" id="nav-login-btn" class="nav-auth-btn login-btn">
                  {{ i18n.t.navLogin }}
                </a>
                <a routerLink="/signup" id="nav-signup-btn" class="nav-auth-btn signup-btn">
                  {{ i18n.t.navSignup }}
                </a>
              </div>
            </ng-template>
          </div>
        </div>
      </div>

      <!-- Mobile Scrollable Navigation Bar -->
      <div class="nav-links-bar">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
          <span class="nav-icon">🏠</span>
          <span class="nav-text">{{ i18n.t.navHome }}</span>
        </a>
        <a routerLink="/complaint" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">✍️</span>
          <span class="nav-text">{{ i18n.t.navGrievance }}</span>
        </a>
        <a routerLink="/schemes" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">🏛️</span>
          <span class="nav-text">{{ i18n.t.navSchemes }}</span>
        </a>
        <a routerLink="/earnings" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">📊</span>
          <span class="nav-text">{{ i18n.t.navEarnings }}</span>
        </a>
        <a routerLink="/safety" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">🛡️</span>
          <span class="nav-text">{{ i18n.t.navSafety }}</span>
        </a>
        <a routerLink="/cases" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">📁</span>
          <span class="nav-text">{{ i18n.t.navCases }}</span>
          <span class="badge-count" *ngIf="storage.cases().length > 0">{{ storage.cases().length }}</span>
        </a>
      </div>
    </nav>
  `,
  styles: [`
    .saathi-navbar {
      background: #ffffff;
      border-bottom: 1.5px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }

    .nav-container {
      max-width: 1100px;
      margin: 0 auto;
      padding: 10px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: inherit;
    }

    .brand-avatar {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: linear-gradient(135deg, #059669, #047857);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 1.05rem;
      box-shadow: 0 2px 6px rgba(5, 150, 105, 0.3);
    }

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .brand-title {
      font-weight: 800;
      font-size: 1.2rem;
      letter-spacing: -0.01em;
      color: #0f172a;
      line-height: 1.1;
    }

    .brand-badge {
      font-size: 0.72rem;
      color: var(--primary);
      font-weight: 600;
    }

    .nav-controls {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .status-indicator {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      font-weight: 600;
      border: 1px solid var(--border);
      background: #f8fafc;
    }

    .status-indicator.online {
      color: #15803d;
      background: #f0fdf4;
      border-color: #bbf7d0;
    }

    .status-indicator.offline {
      color: #b45309;
      background: #fffbeb;
      border-color: #fde68a;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
    }

    .lang-switch-group {
      display: inline-flex;
      background: #f1f5f9;
      padding: 3px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border);
    }

    .lang-chip {
      padding: 5px 10px;
      border-radius: 8px;
      border: none;
      background: transparent;
      font-weight: 700;
      font-size: 0.82rem;
      color: var(--text-muted);
      cursor: pointer;
      min-height: 32px;
      transition: all 0.15s ease;
    }

    .lang-chip.active {
      background: #ffffff;
      color: var(--primary);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    /* Links Bar */
    .nav-links-bar {
      max-width: 1100px;
      margin: 0 auto;
      display: flex;
      gap: 4px;
      padding: 0 12px 6px 12px;
      overflow-x: auto;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
    }

    .nav-links-bar::-webkit-scrollbar {
      display: none;
    }

    .nav-item {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: var(--radius-full);
      text-decoration: none;
      color: var(--text-muted);
      font-weight: 600;
      font-size: 0.88rem;
      white-space: nowrap;
      transition: all 0.15s;
    }

    .nav-item:hover {
      background: #f8fafc;
      color: var(--text-main);
    }

    .nav-item.active {
      background: var(--primary-light);
      color: var(--primary);
      border: 1px solid var(--primary-border);
    }

    .badge-count {
      background: var(--primary);
      color: #ffffff;
      font-size: 0.72rem;
      padding: 2px 6px;
      border-radius: var(--radius-full);
      font-weight: 700;
    }

    .auth-nav-section {
      display: flex;
      align-items: center;
      margin-left: 0.5rem;
    }
    .user-badge {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      padding: 0.25rem 0.55rem;
      border-radius: 20px;
      font-size: 0.82rem;
      font-weight: 600;
      color: #1e40af;
    }
    .user-name {
      max-width: 100px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .btn-logout {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 0.85rem;
      padding: 2px 4px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      gap: 2px;
      color: #dc2626;
    }
    .btn-logout:hover {
      background: #fee2e2;
    }
    .logout-label {
      font-size: 0.75rem;
      font-weight: 600;
    }
    .guest-nav-group {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .nav-auth-btn {
      text-decoration: none;
      font-size: 0.82rem;
      font-weight: 600;
      padding: 0.35rem 0.75rem;
      border-radius: 8px;
      transition: all 0.2s ease;
      white-space: nowrap;
    }
    .login-btn {
      color: var(--primary, #0284c7);
      border: 1px solid var(--border, #cbd5e1);
      background: #ffffff;
    }
    .login-btn:hover {
      background: #f8fafc;
      border-color: var(--primary, #0284c7);
    }
    .signup-btn {
      background: var(--primary, #0284c7);
      color: #ffffff;
      border: 1px solid var(--primary, #0284c7);
    }
    .signup-btn:hover {
      background: #0369a1;
    }

    @media (max-width: 600px) {
      .brand-title {
        font-size: 1.05rem;
      }
      .brand-badge {
        display: none;
      }
      .nav-text {
        font-size: 0.82rem;
      }
      .logout-label {
        display: none;
      }
    }
  `]
})
export class NavbarComponent implements OnInit {
  i18n = inject(I18nService);
  storage = inject(StorageService);
  auth = inject(AuthService);
  private api = inject(SaathiApiService);

  backendOnline = false;
  geminiActive = false;
  backendStatusText = 'Checking backend...';

  ngOnInit(): void {
    this.api.checkHealth().subscribe({
      next: (res) => {
        this.backendOnline = res.status === 'ok';
        this.geminiActive = res.geminiConfigured;
        this.backendStatusText = res.geminiConfigured 
          ? 'Backend online with Gemini API enabled' 
          : 'Backend online (Offline safe fallback enabled)';
      },
      error: () => {
        this.backendOnline = false;
        this.backendStatusText = 'Backend offline. Client-side safe mode active.';
      }
    });
  }

  selectLanguage(lang: AppLanguage): void {
    this.i18n.setLanguage(lang);
  }

  onLogout(): void {
    this.auth.logout().subscribe();
  }
}
