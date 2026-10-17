import { Injectable, signal } from '@angular/core';
import { AppLanguage } from '../models/saathi.models';

export interface Translations {
  appName: string;
  appTagline: string;
  navHome: string;
  navGrievance: string;
  navSchemes: string;
  navEarnings: string;
  navSafety: string;
  navCases: string;
  switchLang: string;
  privacyNotice: string;
  clearData: string;
  dataCleared: string;
  statusOnline: string;
  statusFallback: string;
  openSource: string;
  copyText: string;
  copied: string;
  downloadPdf: string;
  saveCase: string;
  caseSaved: string;
  emergencyTitle: string;
  emergencySubtitle: string;
  verifyNotice: string;
  navLogin: string;
  navSignup: string;
  navLogout: string;
}

const EN_TRANSLATIONS: Translations = {
  appName: 'Saathi (साथी / ਸਾਥੀ)',
  appTagline: 'Multilingual AI Assistant for Gig & Informal Workers',
  navHome: 'Home / Saathi',
  navGrievance: 'Draft Complaint',
  navSchemes: 'Find Schemes',
  navEarnings: 'My Earnings',
  navSafety: 'Safety & Support',
  navCases: 'My Cases',
  switchLang: 'Language',
  privacyNotice: 'Privacy & Safety: We never ask for or store Aadhaar numbers, OTPs, or bank passwords. All drafts and calculations stay on your device.',
  clearData: 'Clear Local Data',
  dataCleared: 'All local demo data cleared safely.',
  statusOnline: 'Live AI Active',
  statusFallback: 'Offline / Fallback Mode',
  openSource: 'Open Official Source',
  copyText: 'Copy Complaint',
  copied: 'Copied to Clipboard!',
  downloadPdf: 'Download Text / Save',
  saveCase: 'Save to My Cases',
  caseSaved: 'Saved to My Cases locally!',
  emergencyTitle: 'Emergency Helplines (India)',
  emergencySubtitle: 'Verified national emergency contacts for immediate assistance',
  verifyNotice: 'Saathi displays official government sources. Final eligibility and applications must be completed on official portals.',
  navLogin: 'Login',
  navSignup: 'Sign Up',
  navLogout: 'Logout'
};

const HI_TRANSLATIONS: Translations = {
  appName: 'साथी (Saathi)',
  appTagline: 'गिग एवं असंगठित कामगारों के लिए बहुभाषी सहायक',
  navHome: 'होम / साथी',
  navGrievance: 'शिकायत ड्राफ्ट करें',
  navSchemes: 'सरकारी योजनाएं खोजें',
  navEarnings: 'मेरी कमाई (Earnings)',
  navSafety: 'सुरक्षा एवं सहायता',
  navCases: 'मेरे मामले (Cases)',
  switchLang: 'भाषा बदलें',
  privacyNotice: 'गोपनीयता सूचना: हम कभी भी आधार नंबर, बैंक पासवर्ड या ओटीपी नहीं मांगते। आपका डेटा आपके मोबाइल में ही सुरक्षित रहता है।',
  clearData: 'स्थानीय डेटा हटाएं',
  dataCleared: 'स्थानीय डेटा सुरक्षित रूप से हटा दिया गया।',
  statusOnline: 'एआई सक्रिय',
  statusFallback: 'ऑफलाइन / पोर्टल मोड',
  openSource: 'आधिकारिक पोर्टल खोलें',
  copyText: 'शिकायत कॉपी करें',
  copied: 'कॉपी हो गया!',
  downloadPdf: 'डाउनलोड / सेव करें',
  saveCase: 'केस सेव करें',
  caseSaved: 'आपके डिवाइस में सुरक्षित सहेजा गया!',
  emergencyTitle: 'आपातकालीन हेल्पलाइन (भारत)',
  emergencySubtitle: 'तत्काल सहायता के लिए सत्यापित राष्ट्रीय आपातकालीन संपर्क',
  verifyNotice: 'साथी केवल आधिकारिक सरकारी स्रोत दिखाता है। अंतिम पात्रता और आवेदन आधिकारिक पोर्टल पर ही मान्य होंगे।',
  navLogin: 'लॉग इन करें',
  navSignup: 'नया खाता बनाएं',
  navLogout: 'लॉग आउट'
};

const PA_TRANSLATIONS: Translations = {
  appName: 'ਸਾਥੀ (Saathi)',
  appTagline: 'ਗਿਗ ਅਤੇ ਗ਼ੈਰ-ਸੰਗਠਿਤ ਕਾਮਿਆਂ ਲਈ ਬਹੁ-ਭਾਸ਼ਾਈ ਸਹਾਇਕ',
  navHome: 'ਮੁੱਖ ਪੰਨਾ / ਸਾਥੀ',
  navGrievance: 'ਸ਼ਿਕਾਇਤ ਡਰਾਫਟ ਕਰੋ',
  navSchemes: 'ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਲੱਭੋ',
  navEarnings: 'ਮੇਰੀ ਕਮਾਈ',
  navSafety: 'ਸੁਰੱਖਿਆ ਅਤੇ ਮਦਦ',
  navCases: 'ਮੇਰੇ ਕੇਸ',
  switchLang: 'ਭਾਸ਼ਾ ਬਦਲੋ',
  privacyNotice: 'ਨਿੱਜਤਾ ਸੂਚਨਾ: ਅਸੀਂ ਕਦੇ ਵੀ ਆਧਾਰ ਨੰਬਰ, ਬੈਂਕ ਪਾਸਵਰਡ ਜਾਂ ਓਟੀਪੀ ਨਹੀਂ ਮੰਗਦੇ। ਤੁਹਾਡਾ ਡਾਟਾ ਤੁਹਾਡੇ ਫੋਨ ਵਿੱਚ ਹੀ ਸੁਰੱਖਿਅਤ ਰਹਿੰਦਾ ਹੈ।',
  clearData: 'ਸਥਾਨਕ ਡਾਟਾ ਮਿਟਾਓ',
  dataCleared: 'ਸਥਾਨਕ ਡਾਟਾ ਸੁਰੱਖਿਅਤ ਢੰਗ ਨਾਲ ਮਿਟਾ ਦਿੱਤਾ ਗਿਆ।',
  statusOnline: 'ਏਆਈ ਕਿਰਿਆਸ਼ੀਲ',
  statusFallback: 'ਆਫ਼ਲਾਈਨ / ਪੋਰਟਲ ਮੋਡ',
  openSource: 'ਅਧਿਕਾਰਤ ਪੋਰਟਲ ਖੋਲ੍ਹੋ',
  copyText: 'ਸ਼ਿਕਾਇਤ ਕਾਪੀ ਕਰੋ',
  copied: 'ਕਾਪੀ ਹੋ ਗਿਆ!',
  downloadPdf: 'ਡਾਊਨਲੋਡ / ਸੰਭਾਲੋ',
  saveCase: 'ਕੇਸ ਸੰਭਾਲੋ',
  caseSaved: 'ਤੁਹਾਡੇ ਫੋਨ ਵਿੱਚ ਸੁਰੱਖਿਅਤ ਸੰਭਾਲਿਆ ਗਿਆ!',
  emergencyTitle: 'ਐਮਰਜੈਂਸੀ ਹੈਲਪਲਾਈਨ (ਭਾਰਤ)',
  emergencySubtitle: 'ਤੁਰੰਤ ਮਦਦ ਲਈ ਪ੍ਰਮਾਣਿਤ ਰਾਸ਼ਟਰੀ ਸੰਪਰਕ',
  verifyNotice: 'ਸਾਥੀ ਸਿਰਫ਼ ਅਧਿਕਾਰਤ ਸਰਕਾਰੀ ਸਰੋਤ ਦਿਖਾਉਂਦਾ ਹੈ। ਅੰਤਿਮ ਯੋਗਤਾ ਅਤੇ ਅਰਜ਼ੀ ਅਧਿਕਾਰਤ ਪੋਰਟਲ \'ਤੇ ਹੀ ਪੂਰੀ ਕਰੋ।',
  navLogin: 'ਲਾਗ ਇਨ',
  navSignup: 'ਖਾਤਾ ਬਣਾਓ',
  navLogout: 'ਲਾਗ ਆਊਟ'
};

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  currentLanguage = signal<AppLanguage>('en');

  constructor() {
    const saved = localStorage.getItem('saathi_lang') as AppLanguage;
    if (saved && ['en', 'hi', 'pa'].includes(saved)) {
      this.currentLanguage.set(saved);
    }
  }

  setLanguage(lang: AppLanguage): void {
    this.currentLanguage.set(lang);
    localStorage.setItem('saathi_lang', lang);
  }

  get t(): Translations {
    const lang = this.currentLanguage();
    if (lang === 'hi') return HI_TRANSLATIONS;
    if (lang === 'pa') return PA_TRANSLATIONS;
    return EN_TRANSLATIONS;
  }
}
