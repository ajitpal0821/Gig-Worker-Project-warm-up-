import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { I18nService } from '../../services/i18n.service';
import { SaathiApiService } from '../../services/saathi-api.service';
import { StorageService } from '../../services/storage.service';
import { CategoryOption, ComplaintFormData, ComplaintResult, LocalCase } from '../../models/saathi.models';

@Component({
  selector: 'app-grievance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="grievance-container animate-fade-in">
      <!-- Section Header -->
      <div class="section-header">
        <div class="header-badge">
          <span>⚖️</span>
          <span>{{ i18n.currentLanguage() === 'hi' ? 'शिकायत एवं विवाद सहायक' : i18n.currentLanguage() === 'pa' ? 'ਸ਼ਿਕਾਇਤ ਨਿਵਾਰਣ ਸਹਾਇਕ' : 'Grievance & Dispute Assistant' }}</span>
        </div>
        <h1>{{ i18n.t.navGrievance }}</h1>
        <p class="header-desc">
          {{ i18n.currentLanguage() === 'hi'
            ? 'अपनी समस्या बताएं। साथी आपके लिए बिना झूठे आरोपों के एक औपचारिक, निष्पक्ष शिकायत पत्र तैयार करेगा।'
            : i18n.currentLanguage() === 'pa'
            ? 'ਆਪਣੀ ਸਮੱਸਿਆ ਦੱਸੋ। ਸਾਥੀ ਤੁਹਾਡੇ ਲਈ ਬਿਨਾਂ ਝੂਠੇ ਦੋਸ਼ਾਂ ਦੇ ਰਸਮੀ ਅਤੇ ਨਿਰਪੱਖ ਸ਼ਿਕਾਇਤ ਤਿਆਰ ਕਰੇਗਾ।'
            : 'Describe your issue. Saathi drafts a formal, constructive complaint without unsupported accusations.' }}
        </p>
      </div>

      <!-- Security / OTP Warning Alert -->
      <div class="security-banner">
        <span class="sec-icon">🔒</span>
        <div>
          <strong>{{ i18n.currentLanguage() === 'hi' ? 'सुरक्षा चेतावनी:' : i18n.currentLanguage() === 'pa' ? 'ਸੁਰੱਖਿਆ ਚੇਤਾਵਨੀ:' : 'Security Warning:' }}</strong>
          <span>{{ i18n.currentLanguage() === 'hi' ? ' कभी भी अपना बैंक पासवर्ड, यूपीआई पिन या ओटीपी शिकायत में न लिखें।' : i18n.currentLanguage() === 'pa' ? ' ਕਦੇ ਵੀ ਆਪਣਾ ਬੈਂਕ ਪਾਸਵਰਡ, ਯੂਪੀਆਈ ਪਿੰਨ ਜਾਂ ਓਟੀਪੀ ਨਾ ਲਿਖੋ।' : ' Never include bank passwords, UPI PINs, or SMS OTPs in your complaint text.' }}</span>
        </div>
      </div>

      <!-- Main Two-Column Layout -->
      <div class="grievance-layout">
        <!-- Input Form Card -->
        <div class="form-card saathi-card">
          <form (ngSubmit)="generateDraft()" #complaintForm="ngForm">
            <!-- 1. Category Selection -->
            <div class="form-group">
              <label class="form-label">
                {{ i18n.currentLanguage() === 'hi' ? '1. समस्या का प्रकार चुनें' : i18n.currentLanguage() === 'pa' ? '1. ਸਮੱਸਿਆ ਦੀ ਸ਼੍ਰੇਣੀ ਚੁਣੋ' : '1. Select Issue Category' }}
              </label>
              <div class="category-chips">
                <button
                  type="button"
                  *ngFor="let cat of categories"
                  class="cat-chip"
                  [class.active]="selectedCategory === cat.key"
                  (click)="setCategory(cat.key)">
                  <span>{{ cat.icon }}</span>
                  <span>{{ getCategoryLabel(cat) }}</span>
                </button>
              </div>
            </div>

            <!-- 2. Problem Description -->
            <div class="form-group">
              <div class="label-row">
                <label class="form-label" for="problemDesc">
                  {{ i18n.currentLanguage() === 'hi' ? '2. अपनी समस्या अपनी भाषा में लिखें' : i18n.currentLanguage() === 'pa' ? '2. ਆਪਣੀ ਸਮੱਸਿਆ ਆਪਣੀ ਭਾਸ਼ਾ ਵਿੱਚ ਲਿਖੋ' : '2. Describe the problem in your words' }}
                </label>
                <button type="button" class="btn-dictate-hint" (click)="addExamplePrompt()" title="Insert sample prompt">
                  💡 {{ i18n.currentLanguage() === 'hi' ? 'उदाहरण भरें' : i18n.currentLanguage() === 'pa' ? 'ਉਦਾਹਰਨ ਭਰੋ' : 'Sample' }}
                </button>
              </div>
              <textarea
                id="problemDesc"
                name="problemDescription"
                class="form-control"
                rows="4"
                required
                [(ngModel)]="problemDescription"
                [placeholder]="i18n.currentLanguage() === 'hi' ? 'उदा: पिछले हफ्ते मेरा ₹450 का डिलीवरी इंसेंटिव बिना किसी कारण के काट लिया गया...' : i18n.currentLanguage() === 'pa' ? 'ਉਦਾ: ਪਿਛਲੇ ਹਫ਼ਤੇ ਮੇਰਾ ₹450 ਦਾ ਇਨਸੈਂਟਿਵ ਬਿਨਾਂ ਕਾਰਨ ਕੱਟ ਲਿਆ ਗਿਆ...' : 'e.g., Last Friday my ₹450 incentive deduction occurred without clear reason in my payout ledger...'"></textarea>
              <span class="form-hint">
                {{ i18n.currentLanguage() === 'hi' ? 'आप हिंदी, पंजाबी या अंग्रेजी किसी भी भाषा में लिख सकते हैं।' : i18n.currentLanguage() === 'pa' ? 'ਤੁਸੀਂ ਪੰਜਾਬੀ, ਹਿੰਦੀ ਜਾਂ ਅੰਗਰੇਜ਼ੀ ਵਿੱਚ ਲਿਖ ਸਕਦੇ ਹੋ।' : 'You can type in English, Hindi, or Punjabi.' }}
              </span>
            </div>

            <!-- 3. Key Facts (Follow-Up Questions) -->
            <div class="facts-section">
              <div class="facts-header">
                <h3>{{ i18n.currentLanguage() === 'hi' ? '3. आवश्यक विवरण (जो आपको मालूम हो)' : i18n.currentLanguage() === 'pa' ? '3. ਜ਼ਰੂਰੀ ਵੇਰਵੇ (ਜੋ ਪਤਾ ਹੋਵੇ)' : '3. Key Details (Known facts only)' }}</h3>
                <span class="badge badge-neutral">{{ i18n.currentLanguage() === 'hi' ? 'अज्ञात छोड़ सकते हैं' : i18n.currentLanguage() === 'pa' ? 'ਅਣਜਾਣ ਛੱਡ ਸਕਦੇ ਹੋ' : 'Optional / Leave blank if unknown' }}</span>
              </div>

              <div class="form-grid-2">
                <!-- Platform / Employer -->
                <div class="form-group">
                  <label class="form-label" for="platformInput">{{ i18n.currentLanguage() === 'hi' ? 'प्लेटफॉर्म या नियोक्ता' : i18n.currentLanguage() === 'pa' ? 'ਪਲੇਟਫਾਰਮ / ਮਾਲਕ' : 'Platform / Employer' }}</label>
                  <input
                    type="text"
                    id="platformInput"
                    name="platform"
                    class="form-control"
                    [(ngModel)]="platform"
                    placeholder="e.g. Zomato, Swiggy, Uber, Ola, Urban Company, Blinkit, Zepto, Porter">
                </div>

                <!-- Relevant Dates -->
                <div class="form-group">
                  <label class="form-label" for="datesInput">{{ i18n.currentLanguage() === 'hi' ? 'तारीख या शिफ्ट' : i18n.currentLanguage() === 'pa' ? 'ਮਿਤੀ ਜਾਂ ਸ਼ਿਫਟ' : 'Relevant Date / Shift' }}</label>
                  <input
                    type="text"
                    id="datesInput"
                    name="relevantDates"
                    class="form-control"
                    [(ngModel)]="relevantDates"
                    placeholder="e.g. 14 Oct 2026, Night Shift">
                </div>

                <!-- Expected Amount -->
                <div class="form-group">
                  <label class="form-label" for="expAmtInput">{{ i18n.currentLanguage() === 'hi' ? 'अपेक्षित राशि (₹)' : i18n.currentLanguage() === 'pa' ? 'ਉਮੀਦ ਕੀਤੀ ਰਕਮ (₹)' : 'Expected Amount (₹)' }}</label>
                  <input
                    type="number"
                    id="expAmtInput"
                    name="expectedAmount"
                    class="form-control"
                    [(ngModel)]="expectedAmount"
                    placeholder="e.g. 1200">
                </div>

                <!-- Received / Deducted Amount -->
                <div class="form-group">
                  <label class="form-label" for="recAmtInput">{{ i18n.currentLanguage() === 'hi' ? 'प्राप्त या काटी गई राशि (₹)' : i18n.currentLanguage() === 'pa' ? 'ਮਿਲੀ ਜਾਂ ਕੱਟੀ ਰਕਮ (₹)' : 'Received or Deducted (₹)' }}</label>
                  <input
                    type="number"
                    id="recAmtInput"
                    name="receivedAmount"
                    class="form-control"
                    [(ngModel)]="receivedAmount"
                    placeholder="e.g. 450">
                </div>
              </div>

              <!-- Explanation Provided -->
              <div class="form-group">
                <label class="form-label" for="explanationInput">{{ i18n.currentLanguage() === 'hi' ? 'कंपनी द्वारा दिया गया कारण (यदि कोई हो)' : i18n.currentLanguage() === 'pa' ? 'ਕੰਪਨੀ ਵੱਲੋਂ ਦਿੱਤਾ ਕਾਰਨ' : 'Explanation provided by platform (if any)' }}</label>
                <input
                  type="text"
                  id="explanationInput"
                  name="explanationProvided"
                  class="form-control"
                  [(ngModel)]="explanationProvided"
                  placeholder="e.g. 'Customer complaint regarding delayed delivery' or 'System deduction code D-12'">
              </div>

              <!-- Desired Resolution -->
              <div class="form-group">
                <label class="form-label" for="resolutionInput">{{ i18n.currentLanguage() === 'hi' ? 'आप क्या समाधान चाहते हैं?' : i18n.currentLanguage() === 'pa' ? 'ਤੁਸੀਂ ਕੀ ਹੱਲ ਚਾਹੁੰਦੇ ਹੋ?' : 'Desired Resolution' }}</label>
                <input
                  type="text"
                  id="resolutionInput"
                  name="desiredResolution"
                  class="form-control"
                  [(ngModel)]="desiredResolution"
                  placeholder="e.g. 'Audit the GPS route logs and credit the ₹450 deduction' or 'Reactivate account'">
              </div>
            </div>

            <!-- Submit Button -->
            <div class="form-actions">
              <button
                type="submit"
                class="btn btn-primary btn-submit"
                [disabled]="isLoading || !problemDescription.trim()">
                <span *ngIf="isLoading" class="spinner"></span>
                <span>{{ isLoading ? (i18n.currentLanguage() === 'hi' ? 'ड्राफ्ट तैयार हो रहा है...' : 'Drafting...') : (i18n.currentLanguage() === 'hi' ? '✍️ औपचारिक शिकायत ड्राफ्ट करें' : i18n.currentLanguage() === 'pa' ? '✍️ ਸ਼ਿਕਾਇਤ ਡਰਾਫਟ ਕਰੋ' : '✍️ Draft Formal Complaint') }}</span>
              </button>

              <button
                type="button"
                class="btn btn-secondary"
                (click)="resetForm()">
                {{ i18n.currentLanguage() === 'hi' ? 'रीसेट' : i18n.currentLanguage() === 'pa' ? 'ਰੀਸੈਟ' : 'Reset' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Output / Draft Result Card -->
        <div class="result-area">
          <div *ngIf="!draftResult && !isLoading" class="empty-state saathi-card">
            <span class="empty-icon">📝</span>
            <h3>{{ i18n.currentLanguage() === 'hi' ? 'आपकी शिकायत यहाँ दिखाई देगी' : i18n.currentLanguage() === 'pa' ? 'ਤੁਹਾਡੀ ਸ਼ਿਕਾਇਤ ਇੱਥੇ ਦਿਖਾਈ ਦੇਵੇਗੀ' : 'Your Drafted Complaint Will Appear Here' }}</h3>
            <p>{{ i18n.currentLanguage() === 'hi' ? 'बाईं ओर अपनी समस्या लिखें और ड्राफ्ट बटन दबाएं। साथी आपके लिए निष्पक्ष भाषा में पत्र तैयार करेगा।' : 'Enter your details on the left and click "Draft Formal Complaint". You can edit, copy, and save your draft locally.' }}</p>
          </div>

          <div *ngIf="isLoading" class="loading-state saathi-card">
            <div class="spinner spinner-primary" style="width: 36px; height: 36px;"></div>
            <h3>{{ i18n.currentLanguage() === 'hi' ? 'शिकायत पत्र तैयार किया जा रहा है...' : 'Structuring formal grievance draft...' }}</h3>
            <p>{{ i18n.currentLanguage() === 'hi' ? 'नियमों के अनुसार तथ्य अलग किए जा रहे हैं और निष्पक्ष भाषा सुनिश्चित की जा रही है।' : 'Validating facts, checking tone, and ensuring zero invented claims.' }}</p>
          </div>

          <!-- Generated Complaint Card -->
          <div *ngIf="draftResult && !isLoading" class="draft-card saathi-card animate-fade-in">
            <div class="draft-header">
              <div>
                <span class="badge badge-info">{{ draftResult.identifiedCategory || selectedCategory }}</span>
                <h3>{{ draftResult.subject }}</h3>
              </div>
              <div class="lang-toggle-bar" *ngIf="draftResult.complaintDraftEnglish && i18n.currentLanguage() !== 'en'">
                <button
                  type="button"
                  class="btn-toggle-draft"
                  [class.active]="viewLang === 'local'"
                  (click)="viewLang = 'local'">
                  {{ i18n.currentLanguage() === 'hi' ? 'हिंदी ड्राफ्ट' : 'ਪੰਜਾਬੀ ਡਰਾਫਟ' }}
                </button>
                <button
                  type="button"
                  class="btn-toggle-draft"
                  [class.active]="viewLang === 'en'"
                  (click)="viewLang = 'en'">
                  English Draft
                </button>
              </div>
            </div>

            <!-- Notice / Non-Submission Banner -->
            <div class="submission-clarity-banner">
              <span>⚠️</span>
              <span>
                {{ i18n.currentLanguage() === 'hi'
                  ? 'महत्वपूर्ण: साथी केवल ड्राफ्ट तैयार करता है। यह शिकायत अभी आपकी कंपनी या सरकार को सबमिट नहीं हुई है। नीचे दिए गए स्टेप्स से इसे अपने ऐप में भेजें।'
                  : i18n.currentLanguage() === 'pa'
                  ? 'ਜ਼ਰੂਰੀ: ਸਾਥੀ ਸਿਰਫ਼ ਡਰਾਫਟ ਤਿਆਰ ਕਰਦਾ ਹੈ। ਇਹ ਸ਼ਿਕਾਇਤ ਅਜੇ ਕੰਪਨੀ ਨੂੰ ਜਮ੍ਹਾ ਨਹੀਂ ਹੋਈ ਹੈ।'
                  : 'Important: Saathi creates this draft for you. This complaint has NOT been submitted to your employer or any authority. Follow the steps below to submit via your app.' }}
              </span>
            </div>

            <!-- Editable Textarea -->
            <div class="form-group">
              <label class="form-label">
                {{ i18n.currentLanguage() === 'hi' ? 'शिकायत पत्र (आप इसे आवश्यकतानुसार एडिट कर सकते हैं):' : 'Complaint Text (Editable):' }}
              </label>
              <textarea
                class="form-control draft-textarea"
                rows="11"
                [(ngModel)]="activeDraftText"></textarea>
            </div>

            <!-- Action Buttons: Copy, Download, Save to My Cases -->
            <div class="draft-actions">
              <button
                type="button"
                class="btn btn-primary"
                (click)="copyComplaint()">
                <span>📋</span>
                <span>{{ copySuccess ? i18n.t.copied : i18n.t.copyText }}</span>
              </button>

              <button
                type="button"
                class="btn btn-outline-primary"
                (click)="downloadAsText()">
                <span>⬇️</span>
                <span>{{ i18n.t.downloadPdf }}</span>
              </button>

              <button
                type="button"
                class="btn btn-secondary"
                (click)="saveToMyCases()"
                [disabled]="isSaved">
                <span>📁</span>
                <span>{{ isSaved ? i18n.t.caseSaved : i18n.t.saveCase }}</span>
              </button>
            </div>

            <!-- Fact Transparency Accordion / Cards -->
            <div class="transparency-breakdown">
              <!-- Provided Facts -->
              <div class="fact-card confirmed">
                <h4>✅ {{ i18n.currentLanguage() === 'hi' ? 'आपके द्वारा दिए गए तथ्य' : 'Worker-Provided Facts' }}</h4>
                <ul *ngIf="draftResult.providedFacts.length > 0">
                  <li *ngFor="let fact of draftResult.providedFacts">{{ fact }}</li>
                </ul>
                <p *ngIf="draftResult.providedFacts.length === 0" class="muted-text">
                  {{ i18n.currentLanguage() === 'hi' ? 'कोई विशिष्ट तथ्य नहीं दिया गया।' : 'No specific dates or amounts provided.' }}
                </p>
              </div>

              <!-- Missing or Unverified Details -->
              <div class="fact-card missing" *ngIf="draftResult.missingOrUnverifiedDetails.length > 0">
                <h4>⚠️ {{ i18n.currentLanguage() === 'hi' ? 'अनुपलब्ध / जो विवरण आपको जांचने चाहिए' : 'Missing / Unverified Details' }}</h4>
                <p class="fact-hint">
                  {{ i18n.currentLanguage() === 'hi' ? 'साथी ने इन्हें अपने मन से नहीं बनाया है। भेजने से पहले इन्हें जांच लें:' : 'Saathi did not invent these details. Please verify or attach before submitting:' }}
                </p>
                <ul>
                  <li *ngFor="let item of draftResult.missingOrUnverifiedDetails">{{ item }}</li>
                </ul>
              </div>

              <!-- Recommended Next Steps -->
              <div class="fact-card steps" *ngIf="draftResult.recommendedNextSteps.length > 0">
                <h4>🚀 {{ i18n.currentLanguage() === 'hi' ? 'शिकायत भेजने के अगले कदम' : 'Recommended Next Steps' }}</h4>
                <ol>
                  <li *ngFor="let step of draftResult.recommendedNextSteps">{{ step }}</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .grievance-container {
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

    .security-banner {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #eff6ff;
      border: 1.5px solid #bfdbfe;
      color: #1e40af;
      padding: 10px 16px;
      border-radius: var(--radius-md);
      font-size: 0.88rem;
    }

    .sec-icon {
      font-size: 1.3rem;
      flex-shrink: 0;
    }

    /* Layout */
    .grievance-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      align-items: start;
    }

    @media (max-width: 900px) {
      .grievance-layout {
        grid-template-columns: 1fr;
      }
    }

    /* Form */
    .form-card {
      background: #ffffff;
    }

    .category-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 4px;
    }

    .cat-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
      border-radius: var(--radius-full);
      border: 1.5px solid var(--border);
      background: #ffffff;
      color: var(--text-main);
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      min-height: 38px;
      transition: all 0.15s;
    }

    .cat-chip:hover {
      border-color: var(--primary);
      background: var(--bg-card-subtle);
    }

    .cat-chip.active {
      background: var(--primary-light);
      border-color: var(--primary);
      color: var(--primary);
    }

    .label-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .btn-dictate-hint {
      background: none;
      border: none;
      color: var(--secondary);
      font-weight: 600;
      font-size: 0.82rem;
      cursor: pointer;
      padding: 2px 6px;
      min-height: 24px;
    }

    .btn-dictate-hint:hover {
      text-decoration: underline;
    }

    .facts-section {
      background: #f8fafc;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 14px;
      margin: 16px 0;
    }

    .facts-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .facts-header h3 {
      font-size: 0.95rem;
      font-weight: 700;
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

    .btn-submit {
      flex: 1;
    }

    /* Result Area */
    .empty-state, .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 40px 24px;
      gap: 10px;
    }

    .empty-icon {
      font-size: 2.8rem;
    }

    .draft-card {
      background: #ffffff;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .draft-header {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .lang-toggle-bar {
      display: flex;
      gap: 6px;
      margin-top: 4px;
    }

    .btn-toggle-draft {
      padding: 4px 10px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      background: #f1f5f9;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      min-height: 30px;
    }

    .btn-toggle-draft.active {
      background: var(--primary);
      color: #ffffff;
      border-color: var(--primary);
    }

    .submission-clarity-banner {
      display: flex;
      gap: 8px;
      background: #fefce8;
      border: 1px solid #fef08a;
      color: #854d0e;
      padding: 10px 14px;
      border-radius: var(--radius-md);
      font-size: 0.82rem;
      line-height: 1.4;
    }

    .draft-textarea {
      font-family: monospace;
      font-size: 0.9rem;
      line-height: 1.5;
      background: #fcfcfd;
    }

    .draft-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    /* Transparency Breakdown */
    .transparency-breakdown {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 10px;
    }

    .fact-card {
      padding: 14px;
      border-radius: var(--radius-md);
      font-size: 0.88rem;
    }

    .fact-card h4 {
      font-size: 0.9rem;
      margin-bottom: 6px;
    }

    .fact-card ul, .fact-card ol {
      padding-left: 18px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .fact-card.confirmed {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #166534;
    }

    .fact-card.missing {
      background: #fffbeb;
      border: 1px solid #fef3c7;
      color: #92400e;
    }

    .fact-hint {
      font-size: 0.8rem;
      margin-bottom: 6px;
    }

    .fact-card.steps {
      background: #f8fafc;
      border: 1px solid var(--border);
      color: var(--text-main);
    }

    .muted-text {
      color: var(--text-muted);
      font-style: italic;
    }
  `]
})
export class GrievanceAssistantComponent {
  i18n = inject(I18nService);
  private api = inject(SaathiApiService);
  private storage = inject(StorageService);

  categories: CategoryOption[] = [
    { key: 'missing_payment', labelEn: 'Missing / Delayed Payment', labelHi: 'पेंडिंग या रुका हुआ वेतन', labelPa: 'ਰੁਕਿਆ ਹੋਇਆ ਭੁਗਤਾਨ', icon: '⏳' },
    { key: 'unexpected_deduction', labelEn: 'Unexpected Deduction', labelHi: 'अनुचित या अज्ञात कटौती', labelPa: 'ਅਚਾਨਕ ਕਟੌਤੀ', icon: '📉' },
    { key: 'account_deactivation', labelEn: 'Account Deactivation', labelHi: 'आईडी / अकाउंट ब्लॉक होना', labelPa: 'ਖਾਤਾ ਬੰਦ ਹੋਣਾ', icon: '🚫' },
    { key: 'workplace_safety', labelEn: 'Workplace or Safety Issue', labelHi: 'कार्यस्थल या सुरक्षा समस्या', labelPa: 'ਕੰਮ ਵਾਲੀ ਥਾਂ ਸਮੱਸਿਆ', icon: '🛡️' },
    { key: 'scheme_assistance', labelEn: 'Scheme / Document Help', labelHi: 'योजना या दस्तावेज सहायता', labelPa: 'ਸਕੀਮ ਜਾਂ ਦਸਤਾਵੇਜ਼ ਮਦਦ', icon: '📄' },
    { key: 'other', labelEn: 'Other Grievance', labelHi: 'अन्य समस्या', labelPa: 'ਹੋਰ ਸਮੱਸਿਆ', icon: '💬' }
  ];

  selectedCategory = 'unexpected_deduction';
  problemDescription = '';
  platform = '';
  relevantDates = '';
  expectedAmount = '';
  receivedAmount = '';
  explanationProvided = '';
  desiredResolution = '';

  isLoading = false;
  draftResult: ComplaintResult | null = null;
  activeDraftText = '';
  viewLang: 'local' | 'en' = 'local';
  copySuccess = false;
  isSaved = false;

  setCategory(key: string): void {
    this.selectedCategory = key;
  }

  getCategoryLabel(cat: CategoryOption): string {
    const lang = this.i18n.currentLanguage();
    if (lang === 'hi') return cat.labelHi;
    if (lang === 'pa') return cat.labelPa;
    return cat.labelEn;
  }

  addExamplePrompt(): void {
    const lang = this.i18n.currentLanguage();
    if (lang === 'hi') {
      this.selectedCategory = 'unexpected_deduction';
      this.platform = 'Zomato';
      this.relevantDates = '15 अक्टूबर 2026';
      this.expectedAmount = '1450';
      this.receivedAmount = '950';
      this.explanationProvided = 'ऑर्डर विलंब पेनल्टी (Order delay deduction)';
      this.desiredResolution = 'जीपीएस लॉग की जांच कर काटी गई ₹500 राशि वापस की जाए';
      this.problemDescription = '15 अक्टूबर को बारिश के कारण रेस्टोरेंट ने खाना पैक करने में 35 मिनट की देरी की थी। मेरे खाते से ₹500 की पेनल्टी काट ली गई, जबकि यह गलती मेरी नहीं थी।';
    } else if (lang === 'pa') {
      this.selectedCategory = 'unexpected_deduction';
      this.platform = 'Swiggy';
      this.relevantDates = '14 ਅਕਤੂਬਰ 2026';
      this.expectedAmount = '1200';
      this.receivedAmount = '850';
      this.explanationProvided = 'ਕਸਟਮਰ ਸ਼ਿਕਾਇਤ (Customer complaint)';
      this.desiredResolution = 'ਕਟੌਤੀ ਕੀਤੀ ₹350 ਦੀ ਰਕਮ ਰਿਕਾਰਡ ਚੈੱਕ ਕਰਕੇ ਵਾਪਸ ਦਿੱਤੀ ਜਾਵੇ';
      this.problemDescription = 'ਮੇਰੀ 14 ਅਕਤੂਬਰ ਦੀ ਪੇਆਉਟ ਵਿੱਚੋਂ ₹350 ਕੱਟ ਲਏ ਗਏ ਹਨ। ਮੈਂ ਸਮੇਂ ਸਿਰ ਡਿਲੀਵਰੀ ਕੀਤੀ ਸੀ, ਕਿਰਪਾ ਕਰਕੇ ਪੜਤਾਲ ਕੀਤੀ ਜਾਵੇ।';
    } else {
      this.selectedCategory = 'unexpected_deduction';
      this.platform = 'Zomato';
      this.relevantDates = '15 Oct 2026';
      this.expectedAmount = '1450';
      this.receivedAmount = '950';
      this.explanationProvided = 'Order delay penalty deduction code D-4';
      this.desiredResolution = 'Review the merchant wait time on GPS logs and refund the ₹500 deduction.';
      this.problemDescription = 'During my evening shift on 15 Oct, the restaurant took 35 minutes to prepare the order due to rain. The platform penalized me ₹500 for delivery delay which was beyond my control.';
    }
  }

  generateDraft(): void {
    if (!this.problemDescription.trim()) return;

    this.isLoading = true;
    this.copySuccess = false;
    this.isSaved = false;

    const payload: ComplaintFormData = {
      problemDescription: this.problemDescription.trim(),
      category: this.selectedCategory,
      platform: this.platform.trim(),
      relevantDates: this.relevantDates.trim(),
      expectedAmount: this.expectedAmount ? String(this.expectedAmount).trim() : '',
      receivedAmount: this.receivedAmount ? String(this.receivedAmount).trim() : '',
      explanationProvided: this.explanationProvided.trim(),
      desiredResolution: this.desiredResolution.trim(),
      language: this.i18n.currentLanguage()
    };

    this.api.draftComplaint(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success && res.data) {
          this.draftResult = res.data;
          this.activeDraftText = res.data.complaintDraft;
          this.viewLang = 'local';
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  copyComplaint(): void {
    if (!this.activeDraftText) return;
    navigator.clipboard.writeText(this.activeDraftText).then(() => {
      this.copySuccess = true;
      setTimeout(() => (this.copySuccess = false), 3000);
    });
  }

  downloadAsText(): void {
    if (!this.activeDraftText) return;
    const blob = new Blob([this.activeDraftText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Saathi_Complaint_${this.platform || 'Platform'}_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  saveToMyCases(): void {
    if (!this.draftResult) return;
    const randomId = 'STH-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    const newCase: LocalCase = {
      id: randomId,
      category: this.draftResult.identifiedCategory || this.selectedCategory,
      platform: this.platform || 'Unspecified Platform',
      subject: this.draftResult.subject,
      complaintDraft: this.activeDraftText,
      complaintDraftEnglish: this.draftResult.complaintDraftEnglish,
      language: this.i18n.currentLanguage(),
      createdAt: new Date().toISOString(),
      status: 'Saved',
      providedFacts: this.draftResult.providedFacts,
      missingDetails: this.draftResult.missingOrUnverifiedDetails,
      recommendedNextSteps: this.draftResult.recommendedNextSteps
    };
    this.storage.saveCase(newCase);
    this.isSaved = true;
  }

  resetForm(): void {
    this.problemDescription = '';
    this.platform = '';
    this.relevantDates = '';
    this.expectedAmount = '';
    this.receivedAmount = '';
    this.explanationProvided = '';
    this.desiredResolution = '';
    this.draftResult = null;
    this.activeDraftText = '';
    this.isSaved = false;
  }
}
