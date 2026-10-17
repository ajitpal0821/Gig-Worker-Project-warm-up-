export type AppLanguage = 'en' | 'hi' | 'pa';

export interface User {
  id: string;
  username: string;
  createdAt?: string;
}

export type ComplaintCategory =
  | 'missing_payment'
  | 'unexpected_deduction'
  | 'account_deactivation'
  | 'workplace_safety'
  | 'scheme_assistance'
  | 'other';

export interface CategoryOption {
  key: ComplaintCategory;
  labelEn: string;
  labelHi: string;
  labelPa: string;
  icon: string;
}

export interface ComplaintFormData {
  problemDescription: string;
  category: string;
  platform: string;
  relevantDates: string;
  expectedAmount: string;
  receivedAmount: string;
  explanationProvided: string;
  desiredResolution: string;
  language: AppLanguage;
}

export interface ComplaintResult {
  identifiedCategory: string;
  subject: string;
  complaintDraft: string;
  complaintDraftEnglish?: string;
  providedFacts: string[];
  missingOrUnverifiedDetails: string[];
  relevantFollowUps: string[];
  recommendedNextSteps: string[];
  securityNotice: string;
}

export interface LocalCase {
  id: string; // e.g. STH-2026-8492
  category: string;
  platform: string;
  subject: string;
  complaintDraft: string;
  complaintDraftEnglish?: string;
  language: AppLanguage;
  createdAt: string;
  status: 'Draft' | 'Saved' | 'Copied' | 'Resolved';
  providedFacts: string[];
  missingDetails: string[];
  recommendedNextSteps: string[];
}

export type ResultState =
  | 'Potentially relevant'
  | 'More information needed'
  | 'Official verification required'
  | 'No reliable match found'
  | 'Source unavailable';

export interface SchemeItem {
  schemeName: string;
  authority: string;
  officialUrl: string;
  isOfficialSource: boolean;
  resultState: ResultState;
  targetWorkers: string;
  simpleExplanation: string;
  keyEligibility: string[];
  documentsRequired: string[];
  verificationChecklist: string[];
}

export interface SchemeSearchResponse {
  success: boolean;
  isLiveSearch: boolean;
  statusMessage: string;
  searchTimestamp: string;
  fallbackReason?: string;
  webSearchQueries?: string[];
  citations?: { title: string; url: string }[];
  data: {
    summary: string;
    results: SchemeItem[];
    disclaimer: string;
  };
}

export interface EarningsRecord {
  id: string;
  periodOrDate: string;
  platform: string;
  grossEarnings: number;
  platformDeductions: number;
  workExpenses: number;
  reportedPayout?: number;
  calculatedNet: number;
  reconciliationNotes: string;
  notes?: string;
  createdAt: string;
}

export interface SafetyGuide {
  id: string;
  category: 'road_safety' | 'fatigue' | 'severe_weather' | 'night_shift' | 'reporting_concern';
  titleEn: string;
  titleHi: string;
  titlePa: string;
  icon: string;
  tipsEn: string[];
  tipsHi: string[];
  tipsPa: string[];
  verifiedHelplines?: { name: string; number: string; desc: string }[];
}
