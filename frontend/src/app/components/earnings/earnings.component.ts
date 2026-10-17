import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { I18nService } from '../../services/i18n.service';
import { StorageService } from '../../services/storage.service';
import { EarningsRecord } from '../../models/saathi.models';

@Component({
  selector: 'app-earnings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="earnings-container animate-fade-in">
      <!-- Section Header -->
      <div class="section-header">
        <div class="header-badge">
          <span>📊</span>
          <span>{{ i18n.currentLanguage() === 'hi' ? 'कमाई एवं कटौती कैलकुलेटर' : i18n.currentLanguage() === 'pa' ? 'ਕਮਾਈ ਅਤੇ ਕਟੌਤੀ ਕੈਲਕੁਲੇਟਰ' : 'Worker-Entered Earnings Calculator' }}</span>
        </div>
        <h1>{{ i18n.t.navEarnings }}</h1>
        <p class="header-desc">
          {{ i18n.currentLanguage() === 'hi'
            ? 'केवल आपके द्वारा दर्ज किए गए आंकड़ों के आधार पर सटीक और पारदर्शी गणितीय गणना। कोई भी नकली लेन-देन या अनुमान नहीं।'
            : i18n.currentLanguage() === 'pa'
            ? 'ਸਿਰਫ਼ ਤੁਹਾਡੇ ਵੱਲੋਂ ਦਰਜ ਕੀਤੇ ਅੰਕੜਿਆਂ ਦੇ ਆਧਾਰ ਤੇ ਸਹੀ ਹਿਸਾਬ। ਕੋਈ ਅੰਦਾਜ਼ਾ ਜਾਂ ਫ਼ਰਜ਼ੀ ਐਂਟਰੀ ਨਹੀਂ।'
            : 'Deterministic, transparent calculations strictly using data you enter. Zero simulated or fabricated transactions.' }}
        </p>
      </div>

      <!-- Input and Breakdown Layout -->
      <div class="earnings-layout">
        <!-- Input Form Card -->
        <div class="form-card saathi-card">
          <form (ngSubmit)="calculateAndSave()">
            <h3>{{ i18n.currentLanguage() === 'hi' ? 'कार्य अवधि एवं आंकड़े दर्ज करें' : i18n.currentLanguage() === 'pa' ? 'ਕੰਮ ਅਤੇ ਕਮਾਈ ਦੇ ਵੇਰਵੇ' : 'Enter Work & Earnings Details' }}</h3>

            <div class="form-grid-2">
              <!-- Period / Date -->
              <div class="form-group">
                <label class="form-label" for="periodInput">
                  {{ i18n.currentLanguage() === 'hi' ? 'अवधि या तारीख' : i18n.currentLanguage() === 'pa' ? 'ਸਮਾਂ ਜਾਂ ਮਿਤੀ' : 'Work Period / Date' }} *
                </label>
                <input
                  type="text"
                  id="periodInput"
                  name="period"
                  class="form-control"
                  required
                  [(ngModel)]="periodOrDate"
                  placeholder="e.g. 10 Oct - 16 Oct 2026">
              </div>

              <!-- Platform / Employer -->
              <div class="form-group">
                <label class="form-label" for="platInput">
                  {{ i18n.currentLanguage() === 'hi' ? 'प्लेटफॉर्म / कंपनी' : i18n.currentLanguage() === 'pa' ? 'ਪਲੇਟਫਾਰਮ' : 'Platform / Employer' }} *
                </label>
                <input
                  type="text"
                  id="platInput"
                  name="platform"
                  class="form-control"
                  required
                  [(ngModel)]="platform"
                  placeholder="e.g. Zomato, Swiggy, Uber, Urban Company">
              </div>

              <!-- Gross Earnings -->
              <div class="form-group">
                <label class="form-label" for="grossInput">
                  {{ i18n.currentLanguage() === 'hi' ? 'कुल कमाई (Gross Earnings ₹)' : i18n.currentLanguage() === 'pa' ? 'ਕੁੱਲ ਕਮਾਈ (Gross ₹)' : 'Gross Earnings (₹)' }} *
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  id="grossInput"
                  name="gross"
                  class="form-control"
                  required
                  [(ngModel)]="grossEarnings"
                  placeholder="e.g. 8500">
                <span class="form-hint">{{ i18n.currentLanguage() === 'hi' ? 'ऑर्डर पे, सर्ज और बेस इंसेंटिव सहित कुल राशि' : 'Total order pay and incentives before any deductions' }}</span>
              </div>

              <!-- Platform Deductions -->
              <div class="form-group">
                <label class="form-label" for="deductInput">
                  {{ i18n.currentLanguage() === 'hi' ? 'प्लेटफॉर्म कटौतियां (Deductions ₹)' : i18n.currentLanguage() === 'pa' ? 'ਕਟੌਤੀਆਂ (Deductions ₹)' : 'Platform Deductions (₹)' }}
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  id="deductInput"
                  name="deductions"
                  class="form-control"
                  [(ngModel)]="platformDeductions"
                  placeholder="e.g. 750">
                <span class="form-hint">{{ i18n.currentLanguage() === 'hi' ? 'कमीशन, बैग/टी-शर्ट शुल्क या पेनल्टी' : 'Commission, kit fees, penalties, or adjustments' }}</span>
              </div>

              <!-- Work Expenses -->
              <div class="form-group">
                <label class="form-label" for="expInput">
                  {{ i18n.currentLanguage() === 'hi' ? 'जेब से हुए खर्च (Work Expenses ₹)' : i18n.currentLanguage() === 'pa' ? 'ਕੰਮ ਦੇ ਖਰਚੇ (Expenses ₹)' : 'Work Expenses (₹)' }}
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  id="expInput"
                  name="expenses"
                  class="form-control"
                  [(ngModel)]="workExpenses"
                  placeholder="e.g. 1800">
                <span class="form-hint">{{ i18n.currentLanguage() === 'hi' ? 'पेट्रोल/ईंधन, मोबाइल डेटा, बाइक सर्विसिंग या पार्किंग' : 'Fuel, mobile data pack, vehicle repair, or parking' }}</span>
              </div>

              <!-- Actual Payout Received -->
              <div class="form-group">
                <label class="form-label" for="payoutInput">
                  {{ i18n.currentLanguage() === 'hi' ? 'खाते में आई वास्तविक राशि (Payout ₹)' : i18n.currentLanguage() === 'pa' ? 'ਬੈਂਕ ਵਿੱਚ ਆਈ ਰਕਮ (Payout ₹)' : 'Actual Payout Received (₹)' }}
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  id="payoutInput"
                  name="payout"
                  class="form-control"
                  [(ngModel)]="reportedPayout"
                  placeholder="e.g. 7750">
                <span class="form-hint">{{ i18n.currentLanguage() === 'hi' ? 'वैकल्पिक: आपके बैंक खाते में जमा हुई राशि' : 'Optional: Net amount transferred to your bank account' }}</span>
              </div>
            </div>

            <!-- Notes -->
            <div class="form-group">
              <label class="form-label" for="notesInput">{{ i18n.currentLanguage() === 'hi' ? 'अतिरिक्त टिप्पणी या ट्रिप संदर्भ' : 'Optional Notes / Shift Details' }}</label>
              <input
                type="text"
                id="notesInput"
                name="notes"
                class="form-control"
                [(ngModel)]="notes"
                placeholder="e.g. 48 trips completed, rainy weekend shift">
            </div>

            <div class="form-actions">
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="!isValidInput()">
                <span>🧮</span>
                <span>{{ i18n.currentLanguage() === 'hi' ? 'हिसाब लगाएं एवं सेव करें' : i18n.currentLanguage() === 'pa' ? 'ਹਿਸਾਬ ਲਗਾਓ ਅਤੇ ਸੰਭਾਲੋ' : 'Calculate & Save Record' }}</span>
              </button>

              <button
                type="button"
                class="btn btn-secondary"
                (click)="resetForm()">
                {{ i18n.currentLanguage() === 'hi' ? 'रीसेट' : 'Reset' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Live Calculation Preview Card -->
        <div class="breakdown-card saathi-card">
          <h3>{{ i18n.currentLanguage() === 'hi' ? 'पारदर्शी गणना विवरण' : 'Calculation Breakdown' }}</h3>

          <div *ngIf="!isValidInput()" class="incomplete-notice">
            <span>ℹ️</span>
            <span>{{ i18n.currentLanguage() === 'hi' ? 'गणना के लिए कृपया कार्य अवधि, कंपनी और वैध कुल कमाई (Gross) दर्ज करें।' : 'Not enough information to assess this. Please enter a valid period, platform, and gross earnings amount.' }}</span>
          </div>

          <div *ngIf="isValidInput()" class="calc-results animate-fade-in">
            <!-- Formula Explanation -->
            <div class="formula-box">
              <code>Net Earnings = Gross (₹{{ num(grossEarnings) }}) - Deductions (₹{{ num(platformDeductions) }}) - Expenses (₹{{ num(workExpenses) }})</code>
            </div>

            <div class="calc-table">
              <div class="calc-row">
                <span class="calc-label">➕ {{ i18n.currentLanguage() === 'hi' ? 'कुल कमाई (Gross)' : 'Gross Earnings' }}</span>
                <span class="calc-val positive">+ ₹{{ num(grossEarnings) | number:'1.2-2' }}</span>
              </div>

              <div class="calc-row">
                <span class="calc-label">➖ {{ i18n.currentLanguage() === 'hi' ? 'प्लेटफॉर्म कटौतियां (Deductions)' : 'Platform Deductions' }}</span>
                <span class="calc-val negative">- ₹{{ num(platformDeductions) | number:'1.2-2' }}</span>
              </div>

              <div class="calc-row">
                <span class="calc-label">➖ {{ i18n.currentLanguage() === 'hi' ? 'जेब से खर्च (Work Expenses)' : 'Worker Expenses (Fuel/Data)' }}</span>
                <span class="calc-val negative">- ₹{{ num(workExpenses) | number:'1.2-2' }}</span>
              </div>

              <div class="calc-row total-row">
                <span class="calc-label"><strong>💰 {{ i18n.currentLanguage() === 'hi' ? 'शुद्ध वास्तविक बचत (Real Net)' : 'Calculated Net Earnings' }}</strong></span>
                <span class="calc-val total"><strong>₹{{ calculatedNet() | number:'1.2-2' }}</strong></span>
              </div>
            </div>

            <!-- Reconciliation Card if reported payout is entered -->
            <div class="reconcile-box" *ngIf="hasPayout()">
              <h4>🔍 {{ i18n.currentLanguage() === 'hi' ? 'बैंक पेआउट से मिलान (Reconciliation)' : 'Payout Reconciliation' }}</h4>
              <div class="reconcile-content">
                <p>
                  {{ i18n.currentLanguage() === 'hi' ? 'दर्ज बैंक पेआउट:' : 'Entered Bank Payout:' }} <strong>₹{{ num(reportedPayout) | number:'1.2-2' }}</strong>
                </p>
                <p>
                  {{ i18n.currentLanguage() === 'hi' ? 'अपेक्षित शुद्ध पेआउट (Gross - Deductions):' : 'Expected Bank Transfer (Gross - Deductions):' }} <strong>₹{{ (num(grossEarnings) - num(platformDeductions)) | number:'1.2-2' }}</strong>
                </p>
                <div class="reconcile-verdict" [ngClass]="getReconcileClass()">
                  {{ getReconcileMessage() }}
                </div>
              </div>
            </div>

            <!-- Caution Notice -->
            <p class="neutral-audit-notice">
              {{ i18n.currentLanguage() === 'hi'
                ? 'नोट: साथी बिना आधिकारिक अनुबंध या कंपनी रेट कार्ड के किसी भी कटौती को धोखाधड़ी या संदिग्ध करार नहीं देता। यह केवल आपके दर्ज आंकड़ों का निष्पक्ष गणितीय मिलान है।'
                : 'Note: Saathi never labels a deduction fraudulent or suspicious without an applicable verified contract baseline. This is an objective arithmetic breakdown of your entered figures.' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Saved Earnings History -->
      <section class="history-section saathi-card" *ngIf="storage.earnings().length > 0">
        <div class="history-header">
          <h3>{{ i18n.currentLanguage() === 'hi' ? 'सहेजे गए कमाई रिकॉर्ड' : 'Saved Earnings Records' }}</h3>
          <span class="badge badge-neutral">{{ storage.earnings().length }} {{ i18n.currentLanguage() === 'hi' ? 'रिकॉर्ड्स' : 'Records' }}</span>
        </div>

        <div class="records-grid">
          <div *ngFor="let item of storage.earnings()" class="record-card animate-fade-in">
            <div class="record-top">
              <span class="record-plat">{{ item.platform }}</span>
              <span class="record-date">{{ item.periodOrDate }}</span>
            </div>

            <div class="record-body">
              <div class="stat">
                <span class="lbl">{{ i18n.currentLanguage() === 'hi' ? 'कुल (Gross):' : 'Gross:' }}</span>
                <span class="val">₹{{ item.grossEarnings | number:'1.0-0' }}</span>
              </div>
              <div class="stat">
                <span class="lbl">{{ i18n.currentLanguage() === 'hi' ? 'कटौती:' : 'Deductions:' }}</span>
                <span class="val">₹{{ item.platformDeductions | number:'1.0-0' }}</span>
              </div>
              <div class="stat">
                <span class="lbl">{{ i18n.currentLanguage() === 'hi' ? 'खर्च:' : 'Expenses:' }}</span>
                <span class="val">₹{{ item.workExpenses | number:'1.0-0' }}</span>
              </div>
              <div class="stat highlight">
                <span class="lbl">{{ i18n.currentLanguage() === 'hi' ? 'शुद्ध (Net):' : 'Net Take-Home:' }}</span>
                <span class="val">₹{{ item.calculatedNet | number:'1.0-0' }}</span>
              </div>
            </div>

            <p class="record-recon" *ngIf="item.reconciliationNotes">
              {{ item.reconciliationNotes }}
            </p>

            <div class="record-footer">
              <span class="record-ts">{{ item.createdAt | date:'short' }}</span>
              <button
                type="button"
                class="btn-delete"
                (click)="storage.deleteEarnings(item.id)"
                title="Delete this record">
                🗑️ {{ i18n.currentLanguage() === 'hi' ? 'हटाएं' : 'Delete' }}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .earnings-container {
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
      background: #fef3c7;
      color: #92400e;
      padding: 4px 12px;
      border-radius: var(--radius-full);
      font-size: 0.82rem;
      font-weight: 700;
      margin-bottom: 6px;
      border: 1px solid #fde68a;
    }

    .header-desc {
      color: var(--text-muted);
      font-size: 0.95rem;
    }

    .earnings-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      align-items: start;
    }

    @media (max-width: 900px) {
      .earnings-layout {
        grid-template-columns: 1fr;
      }
    }

    .form-card, .breakdown-card {
      background: #ffffff;
    }

    .form-card h3, .breakdown-card h3 {
      font-size: 1.1rem;
      margin-bottom: 14px;
    }

    .form-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    @media (max-width: 500px) {
      .form-grid-2 {
        grid-template-columns: 1fr;
      }
    }

    .form-actions {
      display: flex;
      gap: 10px;
      margin-top: 14px;
    }

    .incomplete-notice {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px;
      background: #f8fafc;
      border-radius: var(--radius-md);
      font-size: 0.88rem;
      color: var(--text-muted);
      border: 1px solid var(--border);
    }

    .calc-results {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .formula-box {
      background: #f1f5f9;
      padding: 10px 12px;
      border-radius: var(--radius-sm);
      font-size: 0.8rem;
      border: 1px solid var(--border);
      overflow-x: auto;
    }

    .calc-table {
      display: flex;
      flex-direction: column;
      gap: 8px;
      background: #f8fafc;
      padding: 14px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border);
    }

    .calc-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.92rem;
    }

    .calc-val.positive {
      color: #16a34a;
      font-weight: 600;
    }

    .calc-val.negative {
      color: #dc2626;
      font-weight: 600;
    }

    .total-row {
      margin-top: 6px;
      padding-top: 10px;
      border-top: 2px dashed var(--border);
      font-size: 1.05rem;
    }

    .calc-val.total {
      color: var(--primary);
    }

    .reconcile-box {
      background: #f0fdf4;
      border: 1.5px solid #bbf7d0;
      padding: 14px;
      border-radius: var(--radius-md);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .reconcile-box h4 {
      font-size: 0.92rem;
      color: #166534;
    }

    .reconcile-content p {
      font-size: 0.85rem;
      color: #1e293b;
    }

    .reconcile-verdict {
      padding: 8px 10px;
      border-radius: var(--radius-sm);
      font-size: 0.85rem;
      font-weight: 600;
      margin-top: 6px;
    }

    .verdict-match {
      background: #dcfce7;
      color: #15803d;
      border: 1px solid #86efac;
    }

    .verdict-diff {
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
    }

    .neutral-audit-notice {
      font-size: 0.78rem;
      color: var(--text-light);
      line-height: 1.4;
      font-style: italic;
    }

    /* History */
    .history-section {
      background: #ffffff;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .history-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .records-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 12px;
    }

    .record-card {
      background: #f8fafc;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .record-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .record-plat {
      font-weight: 700;
      font-size: 0.95rem;
      color: var(--primary);
    }

    .record-date {
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .record-body {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
      font-size: 0.82rem;
    }

    .stat.highlight {
      grid-column: span 2;
      font-weight: 700;
      color: var(--text-main);
      padding-top: 4px;
      border-top: 1px solid var(--border);
    }

    .record-recon {
      font-size: 0.78rem;
      color: var(--text-muted);
      background: #ffffff;
      padding: 4px 8px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
    }

    .record-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 4px;
    }

    .record-ts {
      font-size: 0.72rem;
      color: var(--text-light);
    }

    .btn-delete {
      background: none;
      border: none;
      color: var(--danger);
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      padding: 2px 6px;
      min-height: 24px;
    }

    .btn-delete:hover {
      text-decoration: underline;
    }
  `]
})
export class EarningsCalculatorComponent {
  i18n = inject(I18nService);
  storage = inject(StorageService);

  periodOrDate = '';
  platform = '';
  grossEarnings: number | string = '';
  platformDeductions: number | string = '';
  workExpenses: number | string = '';
  reportedPayout: number | string = '';
  notes = '';

  num(val: number | string | undefined): number {
    if (!val) return 0;
    const n = Number(val);
    return isNaN(n) ? 0 : Math.max(0, n);
  }

  hasPayout(): boolean {
    return this.reportedPayout !== '' && !isNaN(Number(this.reportedPayout));
  }

  isValidInput(): boolean {
    const gross = Number(this.grossEarnings);
    return Boolean(
      this.periodOrDate.trim() &&
      this.platform.trim() &&
      !isNaN(gross) &&
      gross > 0
    );
  }

  calculatedNet(): number {
    const gross = this.num(this.grossEarnings);
    const deductions = this.num(this.platformDeductions);
    const expenses = this.num(this.workExpenses);
    return gross - deductions - expenses;
  }

  getReconcileClass(): string {
    const expectedTransfer = this.num(this.grossEarnings) - this.num(this.platformDeductions);
    const diff = Math.abs(this.num(this.reportedPayout) - expectedTransfer);
    return diff < 1 ? 'verdict-match' : 'verdict-diff';
  }

  getReconcileMessage(): string {
    const gross = this.num(this.grossEarnings);
    const deductions = this.num(this.platformDeductions);
    const payout = this.num(this.reportedPayout);
    const expectedTransfer = gross - deductions;
    const diff = expectedTransfer - payout;

    const isHi = this.i18n.currentLanguage() === 'hi';
    const isPa = this.i18n.currentLanguage() === 'pa';

    if (Math.abs(diff) < 1) {
      return isHi 
        ? '✓ बैंक पेआउट कुल कमाई माइनस दर्ज कटौतियों से पूर्णतः मेल खाता है।'
        : isPa
        ? '✓ ਬੈਂਕ ਪੇਆਉਟ ਦਰਜ ਕਟੌਤੀਆਂ ਨਾਲ ਪੂਰਾ ਮੇਲ ਖਾਂਦਾ ਹੈ।'
        : '✓ Actual bank transfer matches Gross minus entered Platform Deductions exactly.';
    } else if (diff > 0) {
      return isHi
        ? `⚠️ बैंक पेआउट अपेक्षित राशि से ₹${diff.toFixed(2)} कम है। जांचें कि क्या कोई अन्य अतिरिक्त कटौती या होल्ड लागू हुआ है।`
        : isPa
        ? `⚠️ ਬੈਂਕ ਪੇਆਉਟ ਉਮੀਦ ਤੋਂ ₹${diff.toFixed(2)} ਘੱਟ ਹੈ। ਹੋਰ ਕਟੌਤੀਆਂ ਦੀ ਜਾਂਚ ਕਰੋ।`
        : `⚠️ Actual bank transfer is ₹${diff.toFixed(2)} lower than expected (Gross - entered deductions). Check if unentered adjustments or withheld tips apply.`;
    } else {
      return isHi
        ? `ℹ️ बैंक पेआउट अपेक्षित राशि से ₹${Math.abs(diff).toFixed(2)} अधिक है (जैसे टिप्स या पिछला एडजस्टमेंट)।`
        : `ℹ️ Actual bank transfer is ₹${Math.abs(diff).toFixed(2)} higher than expected (e.g. added tips or previous adjustment).`;
    }
  }

  calculateAndSave(): void {
    if (!this.isValidInput()) return;

    const newRecord: EarningsRecord = {
      id: 'ERN-' + Date.now(),
      periodOrDate: this.periodOrDate.trim(),
      platform: this.platform.trim(),
      grossEarnings: this.num(this.grossEarnings),
      platformDeductions: this.num(this.platformDeductions),
      workExpenses: this.num(this.workExpenses),
      reportedPayout: this.hasPayout() ? this.num(this.reportedPayout) : undefined,
      calculatedNet: this.calculatedNet(),
      reconciliationNotes: this.hasPayout() ? this.getReconcileMessage() : '',
      notes: this.notes.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    this.storage.saveEarnings(newRecord);
    this.resetForm();
  }

  resetForm(): void {
    this.periodOrDate = '';
    this.platform = '';
    this.grossEarnings = '';
    this.platformDeductions = '';
    this.workExpenses = '';
    this.reportedPayout = '';
    this.notes = '';
  }
}
