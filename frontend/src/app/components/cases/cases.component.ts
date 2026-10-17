import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../services/i18n.service';
import { StorageService } from '../../services/storage.service';
import { LocalCase } from '../../models/saathi.models';

@Component({
  selector: 'app-cases',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="cases-container animate-fade-in">
      <!-- Section Header -->
      <div class="cases-header-row">
        <div>
          <div class="header-badge">
            <span>📁</span>
            <span>{{ i18n.currentLanguage() === 'hi' ? 'स्थानीय केस रिकॉर्ड्स' : i18n.currentLanguage() === 'pa' ? 'ਸਥਾਨਕ ਕੇਸ ਰਿਕਾਰਡ' : 'Saved Grievance Cases' }}</span>
          </div>
          <h1>{{ i18n.t.navCases }}</h1>
          <p class="header-desc">
            {{ i18n.currentLanguage() === 'hi'
              ? 'आपके द्वारा तैयार की गई सभी शिकायतें आपके फोन के लोकल स्टोरेज में सुरक्षित हैं। किसी सर्वर पर अपलोड नहीं की जातीं।'
              : i18n.currentLanguage() === 'pa'
              ? 'ਤੁਹਾਡੇ ਵੱਲੋਂ ਤਿਆਰ ਕੀਤੀਆਂ ਸ਼ਿਕਾਇਤਾਂ ਤੁਹਾਡੇ ਫ਼ੋਨ ਵਿੱਚ ਸੁਰੱਖਿਅਤ ਹਨ।'
              : 'All drafts and reference cases are stored locally in your browser. None are sent to external databases.' }}
          </p>
        </div>

        <button
          *ngIf="storage.cases().length > 0"
          type="button"
          class="btn btn-secondary btn-clear-all"
          (click)="confirmClearAll()">
          🗑️ {{ i18n.t.clearData }}
        </button>
      </div>

      <!-- Empty State -->
      <div *ngIf="storage.cases().length === 0" class="empty-cases saathi-card">
        <span class="empty-icon">📂</span>
        <h3>{{ i18n.currentLanguage() === 'hi' ? 'कोई सुरक्षित केस नहीं मिला' : 'No Saved Cases Yet' }}</h3>
        <p>{{ i18n.currentLanguage() === 'hi' ? 'जब आप शिकायत सहायक में कोई ड्राफ्ट तैयार करके सहेजेंगे, तो वह यहाँ दिखाई देगा।' : 'When you draft a complaint in the Grievance Assistant and save it, it will appear here with an assigned Reference ID.' }}</p>
        <a routerLink="/complaint" class="btn btn-primary">
          ✍️ {{ i18n.t.navGrievance }}
        </a>
      </div>

      <!-- Cases List -->
      <div *ngIf="storage.cases().length > 0" class="cases-list">
        <div *ngFor="let item of storage.cases()" class="case-card saathi-card animate-fade-in">
          <!-- Case Top Bar -->
          <div class="case-top">
            <div class="case-ref">
              <span class="ref-badge">{{ item.id }}</span>
              <span class="case-plat">{{ item.platform }}</span>
            </div>
            <div class="case-status-badge" [ngClass]="getStatusClass(item.status)">
              {{ item.status }}
            </div>
          </div>

          <h3 class="case-subject">{{ item.subject }}</h3>
          <span class="case-date">{{ item.createdAt | date:'medium' }}</span>

          <!-- Provided Facts Summary Chips -->
          <div class="facts-chips" *ngIf="item.providedFacts?.length">
            <span *ngFor="let fact of item.providedFacts" class="fact-chip">{{ fact }}</span>
          </div>

          <!-- Text Preview / Expand -->
          <div class="case-preview">
            <pre class="preview-text">{{ item.complaintDraft }}</pre>
          </div>

          <!-- Actions Bar -->
          <div class="case-actions">
            <button
              type="button"
              class="btn btn-primary btn-sm"
              (click)="copyCaseDraft(item)">
              <span>📋</span>
              <span>{{ activeCopiedId === item.id ? i18n.t.copied : i18n.t.copyText }}</span>
            </button>

            <button
              type="button"
              class="btn btn-outline-primary btn-sm"
              (click)="downloadCase(item)">
              <span>⬇️</span>
              <span>{{ i18n.t.downloadPdf }}</span>
            </button>

            <!-- Status Changer -->
            <select
              class="status-select"
              [ngModel]="item.status"
              (ngModelChange)="updateStatus(item, $event)"
              title="Update Case Status">
              <option value="Draft">Status: Draft</option>
              <option value="Saved">Status: Saved</option>
              <option value="Copied">Status: Copied</option>
              <option value="Resolved">Status: Resolved ✓</option>
            </select>

            <button
              type="button"
              class="btn-delete-case"
              (click)="storage.deleteCase(item.id)"
              title="Delete case">
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cases-container {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .cases-header-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
    }

    @media (max-width: 650px) {
      .cases-header-row {
        flex-direction: column;
      }
    }

    .header-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--primary-light);
      color: var(--primary);
      padding: 4px 12px;
      border-radius: var(--radius-full);
      font-size: 0.82rem;
      font-weight: 700;
      margin-bottom: 6px;
      border: 1px solid var(--primary-border);
    }

    .header-desc {
      color: var(--text-muted);
      font-size: 0.95rem;
    }

    .btn-clear-all {
      font-size: 0.82rem;
      color: var(--danger);
      border-color: #fca5a5;
      white-space: nowrap;
    }

    .btn-clear-all:hover {
      background: #fef2f2;
    }

    /* Empty */
    .empty-cases {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 40px 20px;
      gap: 12px;
      background: #ffffff;
    }

    .empty-icon {
      font-size: 2.8rem;
    }

    /* Cases List */
    .cases-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .case-card {
      background: #ffffff;
      border: 1.5px solid var(--border);
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .case-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .case-ref {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .ref-badge {
      font-family: monospace;
      font-weight: 800;
      font-size: 0.85rem;
      background: #0f172a;
      color: #ffffff;
      padding: 3px 8px;
      border-radius: var(--radius-sm);
    }

    .case-plat {
      font-weight: 700;
      font-size: 0.95rem;
      color: var(--primary);
    }

    .case-status-badge {
      padding: 3px 10px;
      border-radius: var(--radius-full);
      font-size: 0.78rem;
      font-weight: 700;
    }

    .status-draft { background: #f1f5f9; color: #475569; }
    .status-saved { background: #e0f2fe; color: #0369a1; }
    .status-copied { background: #fef3c7; color: #92400e; }
    .status-resolved { background: #dcfce7; color: #15803d; }

    .case-subject {
      font-size: 1.1rem;
      line-height: 1.3;
    }

    .case-date {
      font-size: 0.78rem;
      color: var(--text-light);
    }

    .facts-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .fact-chip {
      background: #f8fafc;
      border: 1px solid var(--border);
      padding: 2px 8px;
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .case-preview {
      background: #f8fafc;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 12px;
      max-height: 140px;
      overflow-y: auto;
    }

    .preview-text {
      font-family: inherit;
      font-size: 0.85rem;
      line-height: 1.45;
      white-space: pre-wrap;
      color: var(--text-main);
    }

    .case-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 4px;
      padding-top: 8px;
      border-top: 1px solid var(--border);
    }

    .btn-sm {
      padding: 6px 14px;
      font-size: 0.85rem;
      min-height: 36px;
    }

    .status-select {
      padding: 6px 10px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border);
      font-size: 0.82rem;
      background: #ffffff;
      min-height: 36px;
      color: var(--text-main);
    }

    .btn-delete-case {
      margin-left: auto;
      background: none;
      border: none;
      font-size: 1.1rem;
      cursor: pointer;
      padding: 4px 8px;
      min-height: 32px;
      border-radius: var(--radius-sm);
    }

    .btn-delete-case:hover {
      background: #fee2e2;
    }
  `]
})
export class MyCasesComponent {
  i18n = inject(I18nService);
  storage = inject(StorageService);

  activeCopiedId: string | null = null;

  getStatusClass(status: string): string {
    switch (status) {
      case 'Draft': return 'status-draft';
      case 'Saved': return 'status-saved';
      case 'Copied': return 'status-copied';
      case 'Resolved': return 'status-resolved';
      default: return 'status-saved';
    }
  }

  copyCaseDraft(item: LocalCase): void {
    navigator.clipboard.writeText(item.complaintDraft).then(() => {
      this.activeCopiedId = item.id;
      setTimeout(() => (this.activeCopiedId = null), 2500);
    });
  }

  downloadCase(item: LocalCase): void {
    const blob = new Blob([item.complaintDraft], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Case_${item.id}_${item.platform}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  updateStatus(item: LocalCase, newStatus: any): void {
    const updated: LocalCase = { ...item, status: newStatus };
    this.storage.saveCase(updated);
  }

  confirmClearAll(): void {
    const msg = this.i18n.currentLanguage() === 'hi'
      ? 'क्या आप सभी सहेजे गए केस और रिकॉर्ड हटाना चाहते हैं?'
      : 'Are you sure you want to clear all locally stored demo cases?';
    if (confirm(msg)) {
      this.storage.clearAllData();
    }
  }
}
