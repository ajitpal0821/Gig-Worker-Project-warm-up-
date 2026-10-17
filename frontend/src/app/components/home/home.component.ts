import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../services/i18n.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="home-container animate-fade-in">
      <!-- Authenticated User Greeting Banner (E16) -->
      <div *ngIf="auth.isAuthenticated()" class="user-welcome-card" id="dashboard-user-greeting">
        <span class="greeting-icon">👋</span>
        <div class="greeting-text">
          <div class="greeting-title">
            {{ i18n.currentLanguage() === 'hi' ? 'नमस्ते' : i18n.currentLanguage() === 'pa' ? 'ਜੀ ਆਇਆਂ ਨੂੰ' : 'Welcome back' }},
            <strong id="dashboard-username">{{ auth.currentUser()?.username }}</strong>!
          </div>
          <div class="greeting-sub">
            {{ i18n.currentLanguage() === 'hi' 
              ? 'आपके मामले और कमाई का विवरण आपके सुरक्षित खाते से जुड़े हुए हैं।'
              : 'Your grievance cases and earnings history are securely saved and isolated to your account.' }}
          </div>
        </div>
      </div>

      <!-- Hero Banner -->
      <header class="hero-card">
        <div class="hero-badge">
          <span class="badge-dot"></span>
          <span>{{ i18n.currentLanguage() === 'hi' ? 'भारतीय गिग एवं असंगठित कामगारों के लिए' : i18n.currentLanguage() === 'pa' ? 'ਭਾਰਤੀ ਗਿਗ ਅਤੇ ਗ਼ੈਰ-ਸੰਗਠਿਤ ਕਾਮਿਆਂ ਲਈ' : 'Empowering Indian Gig & Informal Workers' }}</span>
        </div>
        <h1 class="hero-title">{{ i18n.t.appName }}</h1>
        <p class="hero-desc">{{ i18n.t.appTagline }}</p>

        <!-- Quick actions row -->
        <div class="hero-actions">
          <a routerLink="/complaint" class="btn btn-primary btn-lg">
            <span>✍️</span>
            <span>{{ i18n.t.navGrievance }}</span>
          </a>
          <a routerLink="/schemes" class="btn btn-secondary btn-lg">
            <span>🏛️</span>
            <span>{{ i18n.t.navSchemes }}</span>
          </a>
        </div>
      </header>

      <!-- Transparency & Safety Charter: What Saathi CAN and CANNOT do -->
      <section class="charter-section saathi-card">
        <div class="charter-header">
          <span class="shield-icon">🛡️</span>
          <h2>{{ i18n.currentLanguage() === 'hi' ? 'साथी क्या कर सकता है और क्या नहीं?' : i18n.currentLanguage() === 'pa' ? 'ਸਾਥੀ ਕੀ ਕਰ ਸਕਦਾ ਹੈ ਅਤੇ ਕੀ ਨਹੀਂ?' : 'What Saathi Can & Cannot Do' }}</h2>
        </div>
        <p class="charter-subtitle">
          {{ i18n.currentLanguage() === 'hi'
            ? 'हम पूरी पारदर्शिता और कामगारों के विश्वास को प्राथमिकता देते हैं।'
            : i18n.currentLanguage() === 'pa'
            ? 'ਅਸੀਂ ਪੂਰੀ ਇਮਾਨਦਾਰੀ ਅਤੇ ਕਾਮਿਆਂ ਦੇ ਭਰੋਸੇ ਨੂੰ ਪਹਿਲ ਦਿੰਦੇ ਹਾਂ।'
            : 'Designed with strict AI safety, truthfulness, and zero-hallucination standards.' }}
        </p>

        <div class="charter-grid">
          <div class="charter-box can-box">
            <div class="box-title">
              <span class="check-icon">✅</span>
              <strong>{{ i18n.currentLanguage() === 'hi' ? 'साथी यह कर सकता है' : i18n.currentLanguage() === 'pa' ? 'ਸਾਥੀ ਇਹ ਕਰ ਸਕਦਾ ਹੈ' : 'What Saathi CAN Do' }}</strong>
            </div>
            <ul>
              <li>{{ i18n.currentLanguage() === 'hi' ? 'कटौती व भुगतान विवाद पर बिना आरोप लगाए निष्पक्ष शिकायत ड्राफ्ट करना' : i18n.currentLanguage() === 'pa' ? 'ਕਟੌਤੀ ਅਤੇ ਭੁਗਤਾਨ ਮਸਲੇ ਲਈ ਬਿਨਾਂ ਦੋਸ਼ ਲਾਏ ਸ਼ਿਕਾਇਤ ਡਰਾਫਟ ਕਰਨਾ' : 'Draft polite, formal, constructive grievance letters without unsupported accusations' }}</li>
              <li>{{ i18n.currentLanguage() === 'hi' ? 'ई-श्रम, माय-स्कीम और सरकारी पोर्टलों के वास्तविक लिंक खोजना' : i18n.currentLanguage() === 'pa' ? 'ਈ-ਸ਼੍ਰਮ, ਮਾਈ-ਸਕੀਮ ਅਤੇ ਸਰਕਾਰੀ ਪੋਰਟਲਾਂ ਦੇ ਅਸਲ ਲਿੰਕ ਲੱਭਣਾ' : 'Find real, verified government portals (.gov.in) with transparent verification steps' }}</li>
              <li>{{ i18n.currentLanguage() === 'hi' ? 'आपकी दर्ज की गई कमाई का पारदर्शी व सटीक हिसाब लगाना' : i18n.currentLanguage() === 'pa' ? 'ਤੁਹਾਡੀ ਦਰਜ ਕੀਤੀ ਕਮਾਈ ਦਾ ਸਹੀ ਹਿਸਾਬ ਲਗਾਉਣਾ' : 'Calculate net earnings deterministically using only data you enter yourself' }}</li>
              <li>{{ i18n.currentLanguage() === 'hi' ? 'सत्यापित आपातकालीन नंबर व व्यावहारिक सुरक्षा सुझाव देना' : i18n.currentLanguage() === 'pa' ? 'ਪ੍ਰਮਾਣਿਤ ਐਮਰਜੈਂਸੀ ਨੰਬਰ ਅਤੇ ਸੁਰੱਖਿਆ ਸੁਝਾਅ ਦੇਣਾ' : 'Provide country-backed emergency helplines and practical shift safety tips' }}</li>
            </ul>
          </div>

          <div class="charter-box cannot-box">
            <div class="box-title">
              <span class="cross-icon">❌</span>
              <strong>{{ i18n.currentLanguage() === 'hi' ? 'साथी यह नहीं करता' : i18n.currentLanguage() === 'pa' ? 'ਸਾਥੀ ਇਹ ਨਹੀਂ ਕਰਦਾ' : 'What Saathi CANNOT Do' }}</strong>
            </div>
            <ul>
              <li>{{ i18n.currentLanguage() === 'hi' ? 'मनगढ़ंत तारीखें, कटौतियां या झूठे कानूनी दावे नहीं बनाता' : i18n.currentLanguage() === 'pa' ? 'ਮਨਘੜਤ ਤਾਰੀਖਾਂ, ਕਟੌਤੀਆਂ ਜਾਂ ਕਾਨੂੰਨੀ ਦਾਅਵੇ ਨਹੀਂ ਬਣਾਉਂਦਾ' : 'Never invents amounts, dates, legal sections, or fraud allegations' }}</li>
              <li>{{ i18n.currentLanguage() === 'hi' ? 'बिना वास्तविक एकीकरण के यह दावा नहीं करता कि शिकायत सबमिट हो गई है' : i18n.currentLanguage() === 'pa' ? 'ਬਿਨਾਂ ਅਸਲ ਪੁਸ਼ਟੀ ਦੇ ਇਹ ਦਾਅਵਾ ਨਹੀਂ ਕਰਦਾ ਕਿ ਸ਼ਿਕਾਇਤ ਜਮ੍ਹਾ ਹੋ ਗਈ ਹੈ' : 'Never pretends a complaint has been submitted to your platform or court' }}</li>
              <li>{{ i18n.currentLanguage() === 'hi' ? 'केवल एआई के आधार पर आपको सरकारी योजना का पात्र घोषित नहीं करता' : i18n.currentLanguage() === 'pa' ? 'ਸਿਰਫ਼ ਏਆਈ ਦੇ ਆਧਾਰ ਤੇ ਤੁਹਾਨੂੰ ਸਕੀਮ ਦਾ ਯੋਗ ਨਹੀਂ ਠਹਿਰਾਉਂਦਾ' : 'Never declares you "eligible" solely on AI guesses — official portal verification is required' }}</li>
              <li>{{ i18n.currentLanguage() === 'hi' ? 'कभी भी आधार, बैंक पासवर्ड या ओटीपी नहीं मांगता' : i18n.currentLanguage() === 'pa' ? 'ਕਦੇ ਵੀ ਆਧਾਰ, ਬੈਂਕ ਪਾਸਵਰਡ ਜਾਂ ਓਟੀਪੀ ਨਹੀਂ ਮੰਗਦਾ' : 'Never asks for or stores Aadhaar numbers, passwords, or OTPs' }}</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Primary Feature Cards Grid -->
      <section class="features-grid">
        <a routerLink="/complaint" class="feature-card">
          <div class="feature-icon-badge" style="background: #e0f2fe; color: #0369a1;">✍️</div>
          <div class="feature-content">
            <h3>{{ i18n.t.navGrievance }}</h3>
            <p>{{ i18n.currentLanguage() === 'hi' ? 'वेतन कटौती, पेंडिंग पेमेंट या अकाउंट बंद होने पर सही शिकायत तैयार करें।' : i18n.currentLanguage() === 'pa' ? 'ਤਨਖ਼ਾਹ ਕਟੌਤੀ ਜਾਂ ਖਾਤਾ ਬੰਦ ਹੋਣ ਤੇ ਸਹੀ ਸ਼ਿਕਾਇਤ ਤਿਆਰ ਕਰੋ।' : 'Draft constructive, structured complaints for payout disputes and deactivations.' }}</p>
          </div>
          <span class="arrow-indicator">→</span>
        </a>

        <a routerLink="/schemes" class="feature-card">
          <div class="feature-icon-badge" style="background: #dcfce7; color: #15803d;">🏛️</div>
          <div class="feature-content">
            <h3>{{ i18n.t.navSchemes }}</h3>
            <p>{{ i18n.currentLanguage() === 'hi' ? 'ई-श्रम, पीएम-स्वनिधि, आयुष्मान व अन्य सरकारी योजनाओं के आधिकारिक लिंक।' : i18n.currentLanguage() === 'pa' ? 'ਈ-ਸ਼੍ਰਮ, ਪੀਐਮ-ਸਵਨਿਧੀ ਅਤੇ ਹੋਰ ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਦੇ ਅਧਿਕਾਰਤ ਲਿੰਕ।' : 'Find official government welfare schemes with grounded source URLs.' }}</p>
          </div>
          <span class="arrow-indicator">→</span>
        </a>

        <a routerLink="/earnings" class="feature-card">
          <div class="feature-icon-badge" style="background: #fef3c7; color: #b45309;">📊</div>
          <div class="feature-content">
            <h3>{{ i18n.t.navEarnings }}</h3>
            <p>{{ i18n.currentLanguage() === 'hi' ? 'अपनी दर्ज की गई कमाई, ईंधन व कटौती का पारदर्शी हिसाब।' : i18n.currentLanguage() === 'pa' ? 'ਆਪਣੀ ਕਮਾਈ, ਤੇਲ ਖਰਚੇ ਅਤੇ ਕਟੌਤੀਆਂ ਦਾ ਸਪੱਸ਼ਟ ਹਿਸਾਬ।' : 'Worker-entered earnings calculator with deterministic reconciliation.' }}</p>
          </div>
          <span class="arrow-indicator">→</span>
        </a>

        <a routerLink="/safety" class="feature-card">
          <div class="feature-icon-badge" style="background: #fee2e2; color: #b91c1c;">🛡️</div>
          <div class="feature-content">
            <h3>{{ i18n.t.navSafety }}</h3>
            <p>{{ i18n.currentLanguage() === 'hi' ? 'नाइट शिफ्ट, सड़क सुरक्षा, मौसम सलाह और राष्ट्रीय इमरजेंसी हेल्पलाइन।' : i18n.currentLanguage() === 'pa' ? 'ਰਾਤ ਦੀ ਸ਼ਿਫਟ, ਸੜਕ ਸੁਰੱਖਿਆ ਅਤੇ ਸਰਕਾਰੀ ਐਮਰਜੈਂਸੀ ਹੈਲਪਲਾਈਨ ਨੰਬਰ।' : 'Practical road safety tips, weather guidance, and verified helplines.' }}</p>
          </div>
          <span class="arrow-indicator">→</span>
        </a>
      </section>

      <!-- Emergency Quick Dial Banner -->
      <section class="emergency-banner saathi-card">
        <div class="emergency-info">
          <span class="alert-bell">🚨</span>
          <div>
            <h3>{{ i18n.t.emergencyTitle }}</h3>
            <p>{{ i18n.t.emergencySubtitle }}</p>
          </div>
        </div>
        <div class="emergency-pills">
          <a href="tel:112" class="emergency-pill primary">
            <span class="phone-ico">📞</span>
            <strong>112</strong>
            <span>National Emergency</span>
          </a>
          <a href="tel:1091" class="emergency-pill">
            <span class="phone-ico">📞</span>
            <strong>1091</strong>
            <span>Women Helpline</span>
          </a>
          <a href="tel:14434" class="emergency-pill">
            <span class="phone-ico">📞</span>
            <strong>14434</strong>
            <span>e-Shram Helpdesk</span>
          </a>
          <a href="tel:1033" class="emergency-pill">
            <span class="phone-ico">📞</span>
            <strong>1033</strong>
            <span>Highway Assistance</span>
          </a>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .hero-card {
      background: linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%);
      color: #ffffff;
      border-radius: var(--radius-lg);
      padding: 30px 24px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(6, 78, 59, 0.3);
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(8px);
      padding: 6px 14px;
      border-radius: var(--radius-full);
      font-size: 0.85rem;
      font-weight: 600;
      margin-bottom: 14px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .badge-dot {
      width: 8px;
      height: 8px;
      background: #34d399;
      border-radius: 50%;
      box-shadow: 0 0 8px #34d399;
    }

    .hero-title {
      font-size: 2.2rem;
      color: #ffffff;
      margin-bottom: 8px;
      letter-spacing: -0.02em;
    }

    .hero-desc {
      font-size: 1.1rem;
      color: #d1fae5;
      max-width: 600px;
      margin-bottom: 24px;
      line-height: 1.4;
    }

    .hero-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }

    .btn-lg {
      padding: 14px 24px;
      font-size: 1.05rem;
      border-radius: var(--radius-md);
    }

    /* Charter */
    .charter-section {
      background: #ffffff;
      border: 1px solid var(--border);
    }

    .charter-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 4px;
    }

    .shield-icon {
      font-size: 1.5rem;
    }

    .charter-subtitle {
      font-size: 0.92rem;
      color: var(--text-muted);
      margin-bottom: 18px;
    }

    .charter-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
    }

    .charter-box {
      padding: 16px;
      border-radius: var(--radius-md);
    }

    .can-box {
      background: #f0fdf4;
      border: 1.5px solid #bbf7d0;
    }

    .cannot-box {
      background: #fff1f2;
      border: 1.5px solid #fecdd3;
    }

    .box-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1rem;
      margin-bottom: 10px;
    }

    .charter-box ul {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .charter-box li {
      font-size: 0.88rem;
      line-height: 1.4;
      position: relative;
      padding-left: 14px;
    }

    .can-box li::before {
      content: '•';
      color: #16a34a;
      position: absolute;
      left: 0;
      font-weight: bold;
    }

    .cannot-box li::before {
      content: '•';
      color: #e11d48;
      position: absolute;
      left: 0;
      font-weight: bold;
    }

    /* Features Grid */
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 16px;
    }

    .feature-card {
      background: #ffffff;
      border-radius: var(--radius-md);
      border: 1.5px solid var(--border);
      padding: 18px;
      text-decoration: none;
      color: inherit;
      display: flex;
      align-items: center;
      gap: 14px;
      transition: all 0.2s ease;
    }

    .feature-card:hover {
      border-color: var(--primary);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .feature-icon-badge {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
      flex-shrink: 0;
    }

    .feature-content h3 {
      font-size: 1.05rem;
      margin-bottom: 4px;
    }

    .feature-content p {
      font-size: 0.85rem;
      color: var(--text-muted);
      line-height: 1.35;
    }

    .arrow-indicator {
      margin-left: auto;
      font-size: 1.2rem;
      color: var(--text-light);
      transition: transform 0.2s;
    }

    .feature-card:hover .arrow-indicator {
      transform: translateX(4px);
      color: var(--primary);
    }

    /* Emergency Banner */
    .emergency-banner {
      background: #fffbeb;
      border-color: #fde68a;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .emergency-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .alert-bell {
      font-size: 1.6rem;
    }

    .emergency-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    .emergency-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      border-radius: var(--radius-full);
      background: #ffffff;
      border: 1px solid #fed7aa;
      text-decoration: none;
      color: #9a3412;
      font-size: 0.85rem;
      transition: all 0.2s;
    }

    .emergency-pill.primary {
      background: #ef4444;
      color: #ffffff;
      border-color: #dc2626;
    }

    .user-welcome-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: linear-gradient(135deg, #eff6ff, #f0fdf4);
      border: 1.5px solid #bfdbfe;
      border-radius: var(--radius-lg, 16px);
      padding: 1.15rem 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 8px rgba(2, 132, 199, 0.06);
    }
    .greeting-icon {
      font-size: 2rem;
    }
    .greeting-title {
      font-size: 1.15rem;
      font-weight: 600;
      color: #0f172a;
    }
    .greeting-sub {
      font-size: 0.85rem;
      color: #475569;
      margin-top: 0.2rem;
    }
  `]
})
export class HomeComponent {
  i18n = inject(I18nService);
  auth = inject(AuthService);
}
