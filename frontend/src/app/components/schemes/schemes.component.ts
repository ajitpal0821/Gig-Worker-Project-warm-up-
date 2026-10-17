import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { I18nService } from '../../services/i18n.service';
import { SaathiApiService } from '../../services/saathi-api.service';
import { SchemeItem, SchemeSearchResponse } from '../../models/saathi.models';

@Component({
  selector: 'app-schemes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="schemes-container animate-fade-in">
      <!-- Header -->
      <div class="section-header">
        <div class="header-badge">
          <span>🏛️</span>
          <span>{{ i18n.currentLanguage() === 'hi' ? 'सरकारी योजना एवं दस्तावेज खोज' : i18n.currentLanguage() === 'pa' ? 'ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਅਤੇ ਦਸਤਾਵੇਜ਼ ਖੋਜ' : 'Official Schemes & Documents Finder' }}</span>
        </div>
        <h1>{{ i18n.t.navSchemes }}</h1>
        <p class="header-desc">
          {{ i18n.currentLanguage() === 'hi'
            ? 'अपनी स्थिति या जरूरत बताएं। साथी आधिकारिक सरकारी पोर्टलों (.gov.in / .nic.in) से सत्यापित योजनाओं के लिंक खोजेगा।'
            : i18n.currentLanguage() === 'pa'
            ? 'ਆਪਣੀ ਲੋੜ ਦੱਸੋ। ਸਾਥੀ ਅਧਿਕਾਰਤ ਸਰਕਾਰੀ ਪੋਰਟਲਾਂ ਤੋਂ ਸਹੀ ਲਿੰਕ ਲੱਭ ਕੇ ਦੇਵੇਗਾ।'
            : 'Search authoritative government portals (.gov.in / .nic.in) for benefits, registrations, and official forms.' }}
        </p>
      </div>

      <!-- Quick Suggestion Query Chips -->
      <div class="quick-queries">
        <span class="quick-label">{{ i18n.currentLanguage() === 'hi' ? 'त्वरित खोज:' : i18n.currentLanguage() === 'pa' ? 'ਤੁਰੰਤ ਖੋਜ:' : 'Popular Searches:' }}</span>
        <button
          type="button"
          *ngFor="let sample of sampleQueries"
          class="query-chip"
          (click)="runSampleQuery(sample.query)">
          <span>{{ sample.icon }}</span>
          <span>{{ getSampleLabel(sample) }}</span>
        </button>
      </div>

      <!-- Search Input Card -->
      <div class="search-card saathi-card">
        <form (ngSubmit)="search()" class="search-form">
          <div class="search-input-wrapper">
            <span class="search-icon">🔍</span>
            <input
              type="text"
              class="search-input"
              [(ngModel)]="searchQuery"
              name="query"
              required
              [placeholder]="i18n.currentLanguage() === 'hi' ? 'उदा: मैं स्विगी डिलीवरी राइडर हूँ, मुझे स्वास्थ्य बीमा या ई-श्रम की जानकारी चाहिए...' : i18n.currentLanguage() === 'pa' ? 'ਉਦਾ: ਮੈਂ ਡਿਲੀਵਰੀ ਵਰਕਰ ਹਾਂ, ਮੈਨੂੰ ਸਿਹਤ ਬੀਮਾ ਜਾਂ ਪੈਨਸ਼ਨ ਸਕੀਮ ਬਾਰੇ ਜਾਣਕਾਰੀ ਚਾਹੀਦੀ ਹੈ...' : 'e.g., I am a gig delivery driver. Which welfare or insurance schemes should I check?'">
          </div>
          <button
            type="submit"
            class="btn btn-primary btn-search"
            [disabled]="isLoading || !searchQuery.trim()">
            <span *ngIf="isLoading" class="spinner"></span>
            <span>{{ isLoading ? (i18n.currentLanguage() === 'hi' ? 'खोज जारी है...' : 'Searching...') : (i18n.currentLanguage() === 'hi' ? 'योजनाएं खोजें' : i18n.currentLanguage() === 'pa' ? 'ਸਕੀਮਾਂ ਲੱਭੋ' : 'Search Schemes') }}</span>
          </button>
        </form>
      </div>

      <!-- Live Search vs Fallback Status Banner -->
      <div *ngIf="searchResponse" class="status-banner" [class.live-search]="searchResponse.isLiveSearch" [class.fallback-mode]="!searchResponse.isLiveSearch">
        <div class="status-left">
          <span class="status-icon">{{ searchResponse.isLiveSearch ? '🟢' : 'ℹ️' }}</span>
          <div>
            <strong>{{ searchResponse.statusMessage }}</strong>
            <div class="status-sub" *ngIf="searchResponse.searchTimestamp">
              {{ i18n.currentLanguage() === 'hi' ? 'खोज समय:' : 'Search Timestamp:' }} {{ searchResponse.searchTimestamp | date:'medium' }}
            </div>
            <div class="status-sub" *ngIf="searchResponse.fallbackReason">
              {{ searchResponse.fallbackReason }}
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-container saathi-card">
        <div class="spinner spinner-primary" style="width: 40px; height: 40px;"></div>
        <h3>{{ i18n.currentLanguage() === 'hi' ? 'आधिकारिक सरकारी पोर्टलों पर खोज की जा रही है...' : 'Searching official government portals...' }}</h3>
        <p>{{ i18n.currentLanguage() === 'hi' ? 'ई-श्रम, माय-स्कीम और श्रम मंत्रालय के सत्यापित स्रोतों की पड़ताल जारी है।' : 'Grounding results against e-Shram, MyScheme, and official ministry pages.' }}</p>
      </div>

      <!-- Results Grid -->
      <div *ngIf="searchResponse && !isLoading" class="results-area">
        <!-- AI Summary -->
        <div class="summary-box" *ngIf="searchResponse.data.summary">
          <span class="bulb-icon">💡</span>
          <p>{{ searchResponse.data.summary }}</p>
        </div>

        <!-- Scheme Cards -->
        <div class="schemes-grid">
          <div *ngFor="let scheme of searchResponse.data.results" class="scheme-card saathi-card animate-fade-in">
            <!-- Header: Result State Badge & Official Source Tag -->
            <div class="scheme-top">
              <span class="badge" [ngClass]="getStateBadgeClass(scheme.resultState)">
                {{ scheme.resultState }}
              </span>
              <span class="badge badge-official" *ngIf="scheme.isOfficialSource">
                🏛️ Official Portal
              </span>
            </div>

            <h3 class="scheme-title">{{ scheme.schemeName }}</h3>
            <div class="scheme-authority">{{ scheme.authority }}</div>

            <p class="scheme-explanation">{{ scheme.simpleExplanation }}</p>

            <!-- Target Workers -->
            <div class="info-block">
              <span class="info-label">👥 {{ i18n.currentLanguage() === 'hi' ? 'यह किसके लिए है:' : 'Target Workers:' }}</span>
              <span class="info-value">{{ scheme.targetWorkers }}</span>
            </div>

            <!-- Key Eligibility Accordion / List -->
            <div class="info-block" *ngIf="scheme.keyEligibility?.length">
              <span class="info-label">📋 {{ i18n.currentLanguage() === 'hi' ? 'मुख्य पात्रता शर्तें (स्रोत अनुसार):' : 'Key Eligibility Supported by Source:' }}</span>
              <ul class="clean-list">
                <li *ngFor="let el of scheme.keyEligibility">{{ el }}</li>
              </ul>
            </div>

            <!-- Documents Required -->
            <div class="info-block" *ngIf="scheme.documentsRequired?.length">
              <span class="info-label">📄 {{ i18n.currentLanguage() === 'hi' ? 'आवश्यक दस्तावेज:' : 'Documents Mentioned:' }}</span>
              <div class="doc-chips">
                <span *ngFor="let doc of scheme.documentsRequired" class="doc-chip">{{ doc }}</span>
              </div>
            </div>

            <!-- What to verify toggle button -->
            <button
              type="button"
              class="btn-verify-toggle"
              (click)="toggleVerify(scheme.schemeName)">
              <span>{{ activeVerifyScheme === scheme.schemeName ? '▲' : '▼' }}</span>
              <span>{{ i18n.currentLanguage() === 'hi' ? 'मुझे क्या जांचना चाहिए? (Checklist)' : 'What should I verify on the official portal?' }}</span>
            </button>

            <!-- Verification Checklist Dropdown -->
            <div *ngIf="activeVerifyScheme === scheme.schemeName" class="verify-checklist animate-fade-in">
              <h4>{{ i18n.currentLanguage() === 'hi' ? 'सत्यापन चेकलिस्ट (आधिकारिक पोर्टल पर जांचें):' : 'Verification Checklist Before Applying:' }}</h4>
              <ul>
                <li *ngFor="let check of scheme.verificationChecklist">{{ check }}</li>
              </ul>
            </div>

            <!-- Open Official Source Link -->
            <div class="card-footer">
              <a
                [href]="scheme.officialUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-primary btn-open-source">
                <span>{{ i18n.t.openSource }}</span>
                <span>↗</span>
              </a>
              <span class="url-domain">{{ getDomain(scheme.officialUrl) }}</span>
            </div>
          </div>
        </div>

        <!-- Strict Honesty Disclaimer -->
        <div class="disclaimer-card saathi-card">
          <span class="disc-icon">⚖️</span>
          <div>
            <strong>{{ i18n.currentLanguage() === 'hi' ? 'महत्वपूर्ण सूचना एवं अस्वीकरण:' : 'Honest Disclaimer & Truthfulness:' }}</strong>
            <p>{{ searchResponse.data.disclaimer }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .schemes-container {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .section-header {
      margin-bottom: 4px;
    }

    .header-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #dcfce7;
      color: #166534;
      padding: 4px 12px;
      border-radius: var(--radius-full);
      font-size: 0.82rem;
      font-weight: 700;
      margin-bottom: 6px;
      border: 1px solid #86efac;
    }

    .header-desc {
      color: var(--text-muted);
      font-size: 0.95rem;
    }

    /* Quick Queries */
    .quick-queries {
      display: flex;
      align-items: center;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 4px;
      scrollbar-width: none;
    }

    .quick-queries::-webkit-scrollbar {
      display: none;
    }

    .quick-label {
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--text-muted);
      white-space: nowrap;
    }

    .query-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: var(--radius-full);
      border: 1px solid var(--border);
      background: #ffffff;
      color: var(--text-main);
      font-size: 0.82rem;
      font-weight: 600;
      white-space: nowrap;
      cursor: pointer;
      transition: all 0.15s;
    }

    .query-chip:hover {
      border-color: var(--primary);
      background: var(--primary-light);
      color: var(--primary);
    }

    /* Search Form */
    .search-card {
      background: #ffffff;
      padding: 12px;
    }

    .search-form {
      display: flex;
      gap: 10px;
    }

    @media (max-width: 650px) {
      .search-form {
        flex-direction: column;
      }
    }

    .search-input-wrapper {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
      background: #f8fafc;
      border: 1.5px solid var(--border);
      border-radius: var(--radius-md);
      padding: 0 14px;
    }

    .search-icon {
      font-size: 1.2rem;
      color: var(--text-light);
    }

    .search-input {
      width: 100%;
      border: none;
      background: transparent;
      padding: 12px 0;
      font-size: 0.95rem;
      outline: none;
    }

    .btn-search {
      min-width: 150px;
    }

    /* Status Banner */
    .status-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-radius: var(--radius-md);
      font-size: 0.85rem;
    }

    .status-banner.live-search {
      background: #f0fdf4;
      border: 1.5px solid #86efac;
      color: #166534;
    }

    .status-banner.fallback-mode {
      background: #fffbeb;
      border: 1.5px solid #fde68a;
      color: #92400e;
    }

    .status-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .status-sub {
      font-size: 0.78rem;
      color: var(--text-muted);
      margin-top: 2px;
    }

    /* Loading */
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 40px;
      gap: 12px;
    }

    /* Results */
    .results-area {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .summary-box {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      background: #f0f9ff;
      border: 1.5px solid #bae6fd;
      padding: 14px 18px;
      border-radius: var(--radius-md);
      color: #0369a1;
      font-size: 0.92rem;
      line-height: 1.45;
    }

    .bulb-icon {
      font-size: 1.3rem;
      flex-shrink: 0;
    }

    .schemes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 16px;
    }

    .scheme-card {
      background: #ffffff;
      display: flex;
      flex-direction: column;
      gap: 10px;
      border: 1.5px solid var(--border);
    }

    .scheme-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .scheme-title {
      font-size: 1.15rem;
      line-height: 1.3;
      color: #0f172a;
    }

    .scheme-authority {
      font-size: 0.8rem;
      color: var(--text-muted);
      font-weight: 600;
    }

    .scheme-explanation {
      font-size: 0.9rem;
      color: var(--text-main);
      line-height: 1.45;
    }

    .info-block {
      display: flex;
      flex-direction: column;
      gap: 4px;
      background: #f8fafc;
      padding: 10px 12px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
    }

    .info-label {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--text-muted);
    }

    .info-value {
      font-size: 0.85rem;
      color: var(--text-main);
    }

    .clean-list {
      padding-left: 16px;
      font-size: 0.82rem;
      display: flex;
      flex-direction: column;
      gap: 4px;
      color: var(--text-main);
    }

    .doc-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 2px;
    }

    .doc-chip {
      background: #ffffff;
      border: 1px solid var(--border);
      padding: 3px 8px;
      border-radius: var(--radius-sm);
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--text-main);
    }

    .btn-verify-toggle {
      background: none;
      border: none;
      color: var(--secondary);
      font-weight: 700;
      font-size: 0.82rem;
      text-align: left;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 0;
      min-height: 28px;
    }

    .verify-checklist {
      background: #fffbeb;
      border: 1px solid #fde68a;
      padding: 12px 14px;
      border-radius: var(--radius-sm);
      font-size: 0.82rem;
      color: #78350f;
    }

    .verify-checklist h4 {
      font-size: 0.85rem;
      margin-bottom: 6px;
    }

    .verify-checklist ul {
      padding-left: 18px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: auto;
      padding-top: 10px;
      border-top: 1px solid var(--border);
    }

    .btn-open-source {
      padding: 8px 16px;
      font-size: 0.88rem;
    }

    .url-domain {
      font-size: 0.78rem;
      font-family: monospace;
      color: var(--text-light);
    }

    /* Disclaimer */
    .disclaimer-card {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #f8fafc;
      border: 1.5px solid var(--border);
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    .disc-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
    }
  `]
})
export class SchemesFinderComponent implements OnInit {
  i18n = inject(I18nService);
  private api = inject(SaathiApiService);

  sampleQueries = [
    {
      icon: '🛵',
      query: 'I am a delivery partner. Which government benefits should I investigate?',
      labelEn: 'Delivery Partner Schemes',
      labelHi: 'डिलीवरी राइडर योजनाएं',
      labelPa: 'ਡਿਲੀਵਰੀ ਕਾਮਿਆਂ ਦੀਆਂ ਸਕੀਮਾਂ'
    },
    {
      icon: '🆔',
      query: 'Where can I register as an unorganised worker?',
      labelEn: 'e-Shram Registration',
      labelHi: 'ई-श्रम पंजीकरण पोर्टल',
      labelPa: 'ਈ-ਸ਼੍ਰਮ ਰਜਿਸਟ੍ਰੇਸ਼ਨ'
    },
    {
      icon: '🛒',
      query: 'Micro loan working capital for street vendor PM SVANidhi',
      labelEn: 'Street Vendor Loan',
      labelHi: 'पीएम-स्वनिधि वेंडर लोन',
      labelPa: 'ਰੇਹੜੀ-ਫੜੀ ਲੋਨ ਸਕੀਮ'
    },
    {
      icon: '🏥',
      query: 'I am a daily-wage worker looking for health or insurance assistance',
      labelEn: 'Health & Insurance Cover',
      labelHi: 'स्वास्थ्य बीमा (आयुष्मान)',
      labelPa: 'ਸਿਹਤ ਬੀਮਾ ਸਹਾਇਤਾ'
    },
    {
      icon: '👴',
      query: 'Official application form for informal worker pension scheme PM-SYM',
      labelEn: 'Pension Scheme (PM-SYM)',
      labelHi: 'पेंशन योजना (मानधन)',
      labelPa: 'ਪੈਨਸ਼ਨ ਸਕੀਮ ਫਾਰਮ'
    }
  ];

  searchQuery = 'I am a delivery partner. Which government benefits should I investigate?';
  isLoading = false;
  searchResponse: SchemeSearchResponse | null = null;
  activeVerifyScheme: string | null = null;

  ngOnInit(): void {
    // Initial fetch for top schemes
    this.search();
  }

  getSampleLabel(sample: any): string {
    const lang = this.i18n.currentLanguage();
    if (lang === 'hi') return sample.labelHi;
    if (lang === 'pa') return sample.labelPa;
    return sample.labelEn;
  }

  runSampleQuery(query: string): void {
    this.searchQuery = query;
    this.search();
  }

  search(): void {
    if (!this.searchQuery.trim()) return;

    this.isLoading = true;
    this.activeVerifyScheme = null;

    this.api.searchSchemes(this.searchQuery.trim(), this.i18n.currentLanguage()).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.searchResponse = res;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  toggleVerify(name: string): void {
    if (this.activeVerifyScheme === name) {
      this.activeVerifyScheme = null;
    } else {
      this.activeVerifyScheme = name;
    }
  }

  getStateBadgeClass(state: string): string {
    switch (state) {
      case 'Potentially relevant':
        return 'badge-info';
      case 'Official verification required':
        return 'badge-warning';
      case 'More information needed':
        return 'badge-neutral';
      default:
        return 'badge-neutral';
    }
  }

  getDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }
}
