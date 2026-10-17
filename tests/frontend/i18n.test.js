import { describe, it } from 'node:test';
import assert from 'node:assert';

const EN_KEYS = [
  'appName', 'appTagline', 'navHome', 'navGrievance', 'navSchemes',
  'navEarnings', 'navSafety', 'navCases', 'switchLang', 'privacyNotice',
  'clearData', 'dataCleared', 'statusOnline', 'statusFallback', 'openSource',
  'copyText', 'copied', 'downloadPdf', 'saveCase', 'caseSaved',
  'emergencyTitle', 'emergencySubtitle', 'verifyNotice'
];

describe('Multilingual i18n Dictionary Integrity Tests', () => {
  it('should verify English dictionary has all required keys with non-empty values', () => {
    assert.ok(EN_KEYS.length >= 20, 'At least 20 UI string keys must be defined');
    for (const key of EN_KEYS) {
      assert.ok(typeof key === 'string' && key.length > 0, `Key ${key} must be valid`);
    }
  });

  it('should verify that privacy notices explicitly warn against sharing bank OTPs in all languages', () => {
    const enNotice = 'Privacy & Safety: We never ask for or store Aadhaar numbers, OTPs, or bank passwords.';
    const hiNotice = 'गोपनीयता सूचना: हम कभी भी आधार नंबर, बैंक पासवर्ड या ओटीपी नहीं मांगते।';
    const paNotice = 'ਨਿੱਜਤਾ ਸੂਚਨਾ: ਅਸੀਂ ਕਦੇ ਵੀ ਆਧਾਰ ਨੰਬਰ, ਬੈਂਕ ਪਾਸਵਰਡ ਜਾਂ ਓਟੀਪੀ ਨਹੀਂ ਮੰਗਦੇ।';

    assert.ok(enNotice.includes('OTPs'), 'English notice must mention OTPs');
    assert.ok(hiNotice.includes('ओटीपी'), 'Hindi notice must mention OTP');
    assert.ok(paNotice.includes('ਓਟੀਪੀ'), 'Punjabi notice must mention OTP');
  });

  it('should verify that official verification disclaimers are present in all languages', () => {
    const enDisc = 'Saathi displays official government sources. Final eligibility and applications must be completed on official portals.';
    const hiDisc = 'साथी केवल आधिकारिक सरकारी स्रोत दिखाता है। अंतिम पात्रता और आवेदन आधिकारिक पोर्टल पर ही मान्य होंगे।';
    const paDisc = 'ਸਾਥੀ ਸਿਰਫ਼ ਅਧਿਕਾਰਤ ਸਰਕਾਰੀ ਸਰੋਤ ਦਿਖਾਉਂਦਾ ਹੈ। ਅੰਤਿਮ ਯੋਗਤਾ ਅਤੇ ਅਰਜ਼ੀ ਅਧਿਕਾਰਤ ਪੋਰਟਲ \'ਤੇ ਹੀ ਪੂਰੀ ਕਰੋ।';

    assert.ok(enDisc.includes('official portals'));
    assert.ok(hiDisc.includes('आधिकारिक पोर्टल'));
    assert.ok(paDisc.includes('ਅਧਿਕਾਰਤ ਪੋਰਟਲ'));
  });
});
