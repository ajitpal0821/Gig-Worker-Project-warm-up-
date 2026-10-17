import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService } from '../../services/i18n.service';
import { SafetyGuide } from '../../models/saathi.models';

@Component({
  selector: 'app-safety',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="safety-container animate-fade-in">
      <!-- Section Header -->
      <div class="section-header">
        <div class="header-badge">
          <span>🛡️</span>
          <span>{{ i18n.currentLanguage() === 'hi' ? 'व्यावहारिक सुरक्षा एवं सहायता' : i18n.currentLanguage() === 'pa' ? 'ਸੁਰੱਖਿਆ ਅਤੇ ਮਦਦ ਗਾਈਡ' : 'Worker Safety & Practical Guidance' }}</span>
        </div>
        <h1>{{ i18n.t.navSafety }}</h1>
        <p class="header-desc">
          {{ i18n.currentLanguage() === 'hi'
            ? 'सड़क, नाइट शिफ्ट, खराब मौसम और आपातकालीन परिस्थितियों के लिए व्यावहारिक सुरक्षा दिशा-निर्देश।'
            : i18n.currentLanguage() === 'pa'
            ? 'ਸੜਕ, ਰਾਤ ਦੀ ਸ਼ਿਫਟ ਅਤੇ ਐਮਰਜੈਂਸੀ ਹਾਲਾਤ ਲਈ ਸੁਰੱਖਿਆ ਦਿਸ਼ਾ-ਨਿਰਦੇਸ਼।'
            : 'Evidence-backed guidelines for night shifts, road safety, extreme weather, and official helplines.' }}
        </p>
      </div>

      <!-- No Sensor Telemetry Transparency Banner -->
      <div class="telemetry-notice saathi-card">
        <span class="telemetry-icon">📡</span>
        <div>
          <strong>{{ i18n.currentLanguage() === 'hi' ? 'सत्यता एवं पारदर्शिता सूचना:' : 'Sensors & Location Notice:' }}</strong>
          <p>
            {{ i18n.currentLanguage() === 'hi'
              ? 'साथी आपकी लाइव जीपीएस लोकेशन या मौसम सेंसर से जुड़ा नहीं है। नीचे दी गई सलाह सामान्य सुरक्षा दिशानिर्देशों पर आधारित है। कृपया अपनी वास्तविक स्थिति के अनुसार संबंधित गाइड चुनें।'
              : i18n.currentLanguage() === 'pa'
              ? 'ਸਾਥੀ ਲਾਈਵ ਜੀਪੀਐਸ ਜਾਂ ਮੌਸਮ ਸੈਂਸਰ ਨਾਲ ਜੁੜਿਆ ਨਹੀਂ ਹੈ। ਇਹ ਆਮ ਸੁਰੱਖਿਆ ਨਿਰਦੇਸ਼ ਹਨ। ਆਪਣੀ ਲੋੜ ਅਨੁਸਾਰ ਚੁਣੋ।'
              : 'Saathi is not connected to live weather telemetry or GPS tracking. The guidance provided below is curated safety advice. Select your condition below to view relevant precautions.' }}
          </p>
        </div>
      </div>

      <!-- Condition Selector Chips -->
      <div class="condition-selector">
        <span class="selector-title">{{ i18n.currentLanguage() === 'hi' ? 'अपनी कार्य स्थिति चुनें:' : 'Select Your Work Situation:' }}</span>
        <div class="chips-row">
          <button
            type="button"
            *ngFor="let guide of guides"
            class="guide-chip"
            [class.active]="selectedGuideId === guide.id"
            (click)="selectedGuideId = guide.id">
            <span>{{ guide.icon }}</span>
            <span>{{ getGuideTitle(guide) }}</span>
          </button>
        </div>
      </div>

      <!-- Active Guide Detail Card -->
      <div class="guide-detail saathi-card animate-fade-in" *ngIf="activeGuide">
        <div class="detail-header">
          <div class="detail-icon-wrap">{{ activeGuide.icon }}</div>
          <div>
            <h2>{{ getGuideTitle(activeGuide) }}</h2>
            <span class="badge badge-info">
              {{ i18n.currentLanguage() === 'hi' ? 'समीक्षित सुरक्षा सुझाव' : 'Reviewed Safety Protocol' }}
            </span>
          </div>
        </div>

        <div class="tips-list">
          <div *ngFor="let tip of getGuideTips(activeGuide); let idx = index" class="tip-item">
            <span class="tip-number">{{ idx + 1 }}</span>
            <p>{{ tip }}</p>
          </div>
        </div>
      </div>

      <!-- Country-Appropriate Verified Emergency Directory -->
      <section class="emergency-directory saathi-card">
        <div class="dir-header">
          <span class="dir-icon">🚨</span>
          <div>
            <h3>{{ i18n.currentLanguage() === 'hi' ? 'सत्यापित राष्ट्रीय हेल्पलाइन नंबर (भारत)' : 'Verified National Emergency Helplines (India)' }}</h3>
            <p class="dir-sub">{{ i18n.currentLanguage() === 'hi' ? 'सीधे डायल करने के लिए नंबर पर टैप करें:' : 'Tap any number to call directly in an emergency:' }}</p>
          </div>
        </div>

        <div class="helplines-grid">
          <a href="tel:112" class="helpline-card emergency-primary">
            <div class="card-icon">🚨</div>
            <div class="card-details">
              <span class="hl-num">112</span>
              <span class="hl-name">{{ i18n.currentLanguage() === 'hi' ? 'राष्ट्रीय आपातकालीन नंबर (पुलिस, एम्बुलेंस, फायर)' : 'National Emergency Response (Police, Medical, Fire)' }}</span>
            </div>
            <span class="call-btn">📞 Call</span>
          </a>

          <a href="tel:1091" class="helpline-card">
            <div class="card-icon">👩</div>
            <div class="card-details">
              <span class="hl-num">1091</span>
              <span class="hl-name">{{ i18n.currentLanguage() === 'hi' ? 'महिला सुरक्षा एवं संकट हेल्पलाइन' : 'Women in Distress / Safety Helpline' }}</span>
            </div>
            <span class="call-btn">📞 Call</span>
          </a>

          <a href="tel:14434" class="helpline-card">
            <div class="card-icon">🆔</div>
            <div class="card-details">
              <span class="hl-num">14434</span>
              <span class="hl-name">{{ i18n.currentLanguage() === 'hi' ? 'ई-श्रम सामाजिक सुरक्षा टोल-फ्री हेल्पलाइन' : 'e-Shram Social Security Helpdesk (Govt of India)' }}</span>
            </div>
            <span class="call-btn">📞 Call</span>
          </a>

          <a href="tel:1033" class="helpline-card">
            <div class="card-icon">🛣️</div>
            <div class="card-details">
              <span class="hl-num">1033</span>
              <span class="hl-name">{{ i18n.currentLanguage() === 'hi' ? 'राष्ट्रीय राजमार्ग आपातकालीन सड़क सहायता (NHAI)' : 'National Highways Emergency Roadside Assistance' }}</span>
            </div>
            <span class="call-btn">📞 Call</span>
          </a>

          <a href="tel:1076" class="helpline-card">
            <div class="card-icon">🏛️</div>
            <div class="card-details">
              <span class="hl-num">1076</span>
              <span class="hl-name">{{ i18n.currentLanguage() === 'hi' ? 'सीएम / जन शिकायत निवारण पोर्टल हेल्पलाइन' : 'Chief Minister / Public Grievance Helpline' }}</span>
            </div>
            <span class="call-btn">📞 Call</span>
          </a>

          <a href="tel:1930" class="helpline-card">
            <div class="card-icon">💳</div>
            <div class="card-details">
              <span class="hl-num">1930</span>
              <span class="hl-name">{{ i18n.currentLanguage() === 'hi' ? 'वित्तीय धोखाधड़ी एवं साइबर अपराध रिपोर्टिंग' : 'Financial Cyber Fraud Reporting Helpline' }}</span>
            </div>
            <span class="call-btn">📞 Call</span>
          </a>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .safety-container {
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
      background: #fee2e2;
      color: #b91c1c;
      padding: 4px 12px;
      border-radius: var(--radius-full);
      font-size: 0.82rem;
      font-weight: 700;
      margin-bottom: 6px;
      border: 1px solid #fca5a5;
    }

    .header-desc {
      color: var(--text-muted);
      font-size: 0.95rem;
    }

    .telemetry-notice {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      background: #f8fafc;
      border: 1.5px solid var(--border);
      font-size: 0.85rem;
      color: var(--text-muted);
      line-height: 1.45;
    }

    .telemetry-icon {
      font-size: 1.4rem;
      flex-shrink: 0;
    }

    /* Selector */
    .condition-selector {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .selector-title {
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--text-main);
    }

    .chips-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .guide-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
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

    .guide-chip:hover {
      border-color: var(--primary);
      background: var(--bg-card-subtle);
    }

    .guide-chip.active {
      background: var(--primary-light);
      border-color: var(--primary);
      color: var(--primary);
    }

    /* Guide Detail */
    .guide-detail {
      background: #ffffff;
      border: 1.5px solid var(--border);
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .detail-header {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .detail-icon-wrap {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      background: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.6rem;
      flex-shrink: 0;
    }

    .detail-header h2 {
      font-size: 1.25rem;
    }

    .tips-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .tip-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      background: #f8fafc;
      padding: 12px 14px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border);
    }

    .tip-number {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--primary);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.75rem;
      flex-shrink: 0;
    }

    .tip-item p {
      font-size: 0.9rem;
      line-height: 1.45;
      color: var(--text-main);
    }

    /* Emergency Directory */
    .emergency-directory {
      background: #ffffff;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .dir-header {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .dir-icon {
      font-size: 1.6rem;
    }

    .dir-sub {
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    .helplines-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 12px;
    }

    .helpline-card {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #f8fafc;
      border: 1px solid var(--border);
      padding: 12px 14px;
      border-radius: var(--radius-md);
      text-decoration: none;
      color: inherit;
      transition: all 0.2s;
    }

    .helpline-card:hover {
      border-color: var(--primary);
      transform: translateY(-2px);
      box-shadow: var(--shadow-sm);
    }

    .helpline-card.emergency-primary {
      background: #fef2f2;
      border-color: #fecaca;
    }

    .card-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .card-details {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .hl-num {
      font-size: 1.15rem;
      font-weight: 800;
      color: #0f172a;
    }

    .emergency-primary .hl-num {
      color: #dc2626;
    }

    .hl-name {
      font-size: 0.78rem;
      color: var(--text-muted);
      line-height: 1.3;
    }

    .call-btn {
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--primary);
      background: #ffffff;
      padding: 6px 12px;
      border-radius: var(--radius-full);
      border: 1px solid var(--border);
      flex-shrink: 0;
    }
  `]
})
export class SafetySupportComponent {
  i18n = inject(I18nService);

  guides: SafetyGuide[] = [
    {
      id: 'road_safety',
      category: 'road_safety',
      titleEn: 'Road Safety & Defensive Riding',
      titleHi: 'सड़क सुरक्षा एवं रक्षात्मक राइडिंग',
      titlePa: 'ਸੜਕ ਸੁਰੱਖਿਆ ਅਤੇ ਬਚਾਅ ਨਿਯਮ',
      icon: '🛵',
      tipsEn: [
        'Always wear an ISI-certified full-face helmet strapped securely before starting your vehicle.',
        'Never hold or browse phone maps while moving. Stop safely near the curb to verify customer locations or calls.',
        'Keep headlights on during dusk and foggy mornings. Use rear reflective stickers on your delivery bag.',
        'Maintain a 3-second braking buffer behind trucks and auto-rickshaws to avoid blind-spot crashes.'
      ],
      tipsHi: [
        'गाड़ी शुरू करने से पहले हमेशा आईएसआई प्रमाणित हेलमेट की स्ट्रैप कसकर बांधें।',
        'चलती गाड़ी में फोन पर मैप या कॉल न देखें। रास्ता देखने के लिए हमेशा किनारे सुरक्षित रुकें।',
        'शाम ढलते ही हेडलाइट चालू करें। अपने डिलीवरी बैग पर रिफ्लेक्टिव रेडियम टेप जरूर लगाएं।',
        'ट्रक या बड़े वाहनों के ठीक पीछे न चलें, हमेशा 3 सेकंड की सुरक्षित ब्रेकिंग दूरी बनाए रखें।'
      ],
      tipsPa: [
        'ਵਾਹਨ ਚਲਾਉਣ ਤੋਂ ਪਹਿਲਾਂ ਹਮੇਸ਼ਾ ਪ੍ਰਮਾਣਿਤ ਹੈਲਮੇਟ ਚੰਗੀ ਤਰ੍ਹਾਂ ਬੰਨ੍ਹੋ।',
        'ਚਲਦੇ ਵਾਹਨ \'ਤੇ ਫ਼ੋਨ ਦੀ ਵਰਤੋਂ ਨਾ ਕਰੋ। ਲੋਕੇਸ਼ਨ ਦੇਖਣ ਲਈ ਸੜਕ ਕਿਨਾਰੇ ਰੁਕੋ।',
        'ਰਾਤ ਵੇਲੇ ਹੈੱਡਲਾਈਟ ਚਾਲੂ ਰੱਖੋ ਅਤੇ ਡਿਲੀਵਰੀ ਬੈਗ \'ਤੇ ਚਮਕਦਾਰ ਸਟਿੱਕਰ ਲਗਾਓ।',
        'ਅੱਗੇ ਚੱਲ ਰਹੇ ਵਾਹਨਾਂ ਤੋਂ ਸੁਰੱਖਿਅਤ ਦੂਰੀ ਬਣਾ ਕੇ ਰੱਖੋ।'
      ]
    },
    {
      id: 'fatigue',
      category: 'fatigue',
      titleEn: 'Fatigue & Heat Stroke Prevention',
      titleHi: 'थकान, गर्मी एवं स्वास्थ्य प्रबंधन',
      titlePa: 'ਥਕਾਵਟ ਅਤੇ ਗਰਮੀ ਤੋਂ ਬਚਾਅ',
      icon: '☀️',
      tipsEn: [
        'Take a mandatory 15-minute shaded rest for every 3 hours of continuous city driving or vending.',
        'Carry an insulated water bottle with ORS (oral rehydration salts) or lemon-salt water during hot peak hours (12 PM - 4 PM).',
        'Watch for early heat exhaustion signs: dizziness, nausea, dry mouth, or heavy sweating. Stop immediately in shaded air.',
        'Do not skip meals during busy lunch rushes. Keep glucose biscuits or bananas handy on your bike.'
      ],
      tipsHi: [
        'हर 3 घंटे की लगातार राइडिंग या काम के बाद कम से कम 15 मिनट छाया में आराम करें।',
        'दोपहर 12 से 4 बजे के बीच ओआरएस (ORS) या नींबू-पानी साथ रखें और नियमित रूप से पिएं।',
        'चक्कर आना, जी मिचलाना या अत्यधिक पसीना आने पर तुरंत गाड़ी रोककर ठंडी जगह बैठें।',
        'दोपहर के रश में खाना न छोड़ें। बाइक बैग में बिस्कुट या फल हमेशा रखें।'
      ],
      tipsPa: [
        'ਹਰ 3 ਘੰਟੇ ਲਗਾਤਾਰ ਕੰਮ ਕਰਨ ਤੋਂ ਬਾਅਦ 15 ਮਿੰਟ ਛਾਂ ਵਿੱਚ ਆਰਾਮ ਕਰੋ।',
        'ਗਰਮੀ ਵੇਲੇ ਓਆਰਐਸ ਜਾਂ ਨਿੰਬੂ-ਪਾਣੀ ਨਾਲ ਰੱਖੋ ਅਤੇ ਸਮੇਂ-ਸਮੇਂ \'ਤੇ ਪੀਂਦੇ ਰਹੋ।',
        'ਚੱਕਰ ਆਉਣ ਜਾਂ ਘਬਰਾਹਟ ਹੋਣ \'ਤੇ ਤੁਰੰਤ ਕੰਮ ਰੋਕ ਕੇ ਠੰਢੀ ਥਾਂ ਬੈਠੋ।'
      ]
    },
    {
      id: 'severe_weather',
      category: 'severe_weather',
      titleEn: 'Severe Weather & Monsoon Driving',
      titleHi: 'बारिश, जलभराव एवं खराब मौसम',
      titlePa: 'ਮੀਂਹ ਅਤੇ ਖ਼ਰਾਬ ਮੌਸਮ ਵਿੱਚ ਬਚਾਅ',
      icon: '⛈️',
      tipsEn: [
        'Never attempt to cross submerged roads or underpasses where water depth is unknown.',
        'Tyre grip drops drastically on wet tar and oily intersections. Brake early using both front and rear brakes gently.',
        'Keep your smartphone in a transparent waterproof pouch to prevent water damage during monsoon orders.',
        'During lightning and severe thunderstorms, avoid taking shelter under isolated trees, metal billboards, or high-voltage poles.'
      ],
      tipsHi: [
        'जलभराव वाले अंडरपास या अनजान गहरे पानी में गाड़ी निकालने का जोखिम कभी न लें।',
        'गीली सड़कों पर ब्रेक धीरे-धीरे और दोनों पहियों के एक साथ लगाएं ताकि पहिया फिसले नहीं।',
        'अपने स्मार्टफोन को वाटरप्रूफ पाउच में रखें ताकि बारिश में फोन खराब न हो।',
        'बिजली कड़कने या आंधी के समय अकेले ऊंचे पेड़ों या बिजली के खंभों के नीचे शरण न लें।'
      ],
      tipsPa: [
        'ਪਾਣੀ ਭਰੇ ਅੰਡਰਪਾਸ ਜਾਂ ਡੂੰਘੇ ਪਾਣੀ ਵਿੱਚੋਂ ਵਾਹਨ ਕੱਢਣ ਦਾ ਖ਼ਤਰਾ ਨਾ ਲਓ।',
        'ਮੀਂਹ ਵਿੱਚ ਬਰੇਕ ਹੌਲੀ-ਹੌਲੀ ਲਗਾਓ ਤਾਂ ਜੋ ਵਾਹਨ ਤਿਲਕੇ ਨਾ।',
        'ਆਪਣੇ ਫ਼ੋਨ ਨੂੰ ਪਾਣੀ ਤੋਂ ਬਚਾਉਣ ਲਈ ਵਾਟਰਪਰੂਫ਼ ਪਾਊਚ ਵਿੱਚ ਰੱਖੋ।'
      ]
    },
    {
      id: 'night_shift',
      category: 'night_shift',
      titleEn: 'Night Shift & Solitary Worker Safety',
      titleHi: 'नाइट शिफ्ट एवं एकांत डिलीवरी सुरक्षा',
      titlePa: 'ਰਾਤ ਦੀ ਸ਼ਿਫਟ ਅਤੇ ਇਕੱਲੇ ਕੰਮ ਦੀ ਸੁਰੱਖਿਆ',
      icon: '🌙',
      tipsEn: [
        'Share your live location with a family member or trusted friend before beginning a night shift after 10 PM.',
        'In poorly-lit lanes, park facing the exit for a quick departure if needed. Keep vehicle engine keys handy.',
        'If a customer drop-off location feels unsafe, unlit, or suspicious, stay on your vehicle and ask the customer to meet in an illuminated area.',
        'Keep your mobile battery charged above 30% and carry a reliable power bank for emergencies.'
      ],
      tipsHi: [
        'रात 10 बजे के बाद काम शुरू करने से पहले अपने परिवार या दोस्त के साथ लाइव लोकेशन शेयर करें।',
        'अंधेरी गलियों में गाड़ी का मुंह हमेशा बाहर की तरफ रखें ताकि जरूरत पड़ने पर तुरंत निकल सकें।',
        'यदि डिलीवरी लोकेशन असुरक्षित या संदिग्ध लगे तो गाड़ी से न उतरें और कस्टमर को उजाले वाली जगह बुलाएं।',
        'फोन की बैटरी हमेशा 30% से ऊपर रखें और इमरजेंसी के लिए पावर बैंक साथ रखें।'
      ],
      tipsPa: [
        'ਰਾਤ 10 ਵਜੇ ਤੋਂ ਬਾਅਦ ਕੰਮ ਕਰਦੇ ਸਮੇਂ ਪਰਿਵਾਰ ਨਾਲ ਲਾਈਵ ਲੋਕੇਸ਼ਨ ਸਾਂਝੀ ਕਰੋ।',
        'ਜੇਕਰ ਡਿਲੀਵਰੀ ਵਾਲੀ ਥਾਂ ਸ਼ੱਕੀ ਜਾਂ ਹਨੇਰੀ ਲੱਗੇ ਤਾਂ ਗਾਹਕ ਨੂੰ ਚਾਨਣ ਵਾਲੀ ਥਾਂ ਆਉਣ ਲਈ ਕਹੋ।'
      ]
    },
    {
      id: 'reporting_concern',
      category: 'reporting_concern',
      titleEn: 'Handling Disputes & Threat Escalation',
      titleHi: 'विवाद, दुर्व्यवहार या धमकी से निपटना',
      titlePa: 'ਝਗੜੇ ਜਾਂ ਧਮਕੀ ਦੀ ਰਿਪੋਰਟ ਕਰਨਾ',
      icon: '⚠️',
      tipsEn: [
        'If faced with an aggressive customer or merchant, de-escalate calmly and do not engage in physical arguments. Prioritize your physical safety.',
        'Take note of time, location, order ID, and merchant/customer name. Report the incident via the SOS button in your partner app.',
        'If physically threatened or assaulted, immediately move to a crowded public space and call 112 (National Emergency).',
        'Preserve platform chat messages and audio recordings as factual evidence for grievance redressal.'
      ],
      tipsHi: [
        'यदि कोई ग्राहक या दुकानदार दुर्व्यवहार करे तो शांत रहें और बहस में न उलझें। अपनी शारीरिक सुरक्षा सबसे पहले देखें।',
        'तारीख, समय, ऑर्डर आईडी नोट करें और अपनी पार्टनर ऐप में दिए गए एसओएस (SOS) बटन से तुरंत सूचित करें।',
        'शारीरिक खतरे की स्थिति में तुरंत भीड़भाड़ वाली जगह जाएं और 112 डायल करें।',
        'कंपनी सपोर्ट को सूचित करने के लिए चैट और ऑर्डर का स्क्रीनशॉट सुरक्षित रखें।'
      ],
      tipsPa: [
        'ਕਿਸੇ ਵੀ ਬਹਿਸ ਜਾਂ ਝਗੜੇ ਵਿੱਚ ਨਾ ਪਓ, ਆਪਣੀ ਸੁਰੱਖਿਆ ਨੂੰ ਪਹਿਲ ਦਿਓ।',
        'ਐਮਰਜੈਂਸੀ ਵਿੱਚ ਤੁਰੰਤ 112 ਨੰਬਰ \'ਤੇ ਕਾਲ ਕਰੋ ਅਤੇ ਕੰਪਨੀ ਐਪ ਵਿੱਚ SOS ਬਟਨ ਦਬਾਓ।'
      ]
    }
  ];

  selectedGuideId = 'road_safety';

  get activeGuide(): SafetyGuide | undefined {
    return this.guides.find(g => g.id === this.selectedGuideId);
  }

  getGuideTitle(guide: SafetyGuide): string {
    const lang = this.i18n.currentLanguage();
    if (lang === 'hi') return guide.titleHi;
    if (lang === 'pa') return guide.titlePa;
    return guide.titleEn;
  }

  getGuideTips(guide: SafetyGuide): string[] {
    const lang = this.i18n.currentLanguage();
    if (lang === 'hi') return guide.tipsHi;
    if (lang === 'pa' && guide.tipsPa?.length) return guide.tipsPa;
    return guide.tipsEn;
  }
}
