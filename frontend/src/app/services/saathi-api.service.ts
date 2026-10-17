import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { ComplaintFormData, ComplaintResult, SchemeSearchResponse } from '../models/saathi.models';

const API_BASE = 'http://localhost:3000/api';

@Injectable({
  providedIn: 'root'
})
export class SaathiApiService {
  private http = inject(HttpClient);

  checkHealth(): Observable<{ status: string; geminiConfigured: boolean; groundingEnabled: boolean }> {
    return this.http.get<{ status: string; geminiConfigured: boolean; groundingEnabled: boolean }>(`${API_BASE}/health`).pipe(
      catchError(() => of({ status: 'offline', geminiConfigured: false, groundingEnabled: false }))
    );
  }

  draftComplaint(data: ComplaintFormData): Observable<{ success: boolean; data: ComplaintResult; isAiGenerated?: boolean; notice?: string }> {
    return this.http.post<{ success: boolean; data: ComplaintResult; isAiGenerated?: boolean; notice?: string }>(
      `${API_BASE}/assistant/complaint`,
      data
    ).pipe(
      catchError((err) => {
        console.warn('API complaint endpoint error, using client-side fallback draft:', err);
        return of({
          success: true,
          data: this.generateClientFallbackDraft(data),
          isAiGenerated: false,
          notice: 'Backend unreachable. Clean offline complaint draft generated.'
        });
      })
    );
  }

  searchSchemes(query: string, language: string): Observable<SchemeSearchResponse> {
    return this.http.post<SchemeSearchResponse>(
      `${API_BASE}/schemes/search`,
      { query, language }
    ).pipe(
      catchError((err) => {
        console.warn('API scheme search error, using client-side official portals fallback:', err);
        return of(this.getClientFallbackPortals(query, language));
      })
    );
  }

  explainSource(schemeName: string, officialUrl: string, language: string): Observable<{ success: boolean; data?: any; explanation?: string; checklist?: string[] }> {
    return this.http.post<{ success: boolean; data?: any; explanation?: string; checklist?: string[] }>(
      `${API_BASE}/assistant/explain-source`,
      { schemeName, officialUrl, language }
    ).pipe(
      catchError(() => of({
        success: true,
        explanation: `Please visit the verified official portal at ${officialUrl} to review eligibility rules and application steps.`,
        checklist: [
          'Verify your age and occupation on the official portal',
          'Check required identity proofs (Aadhaar / Voter ID / Ration Card)',
          'Ensure your bank account is active and seeded with Aadhaar'
        ]
      }))
    );
  }

  private generateClientFallbackDraft(data: ComplaintFormData): ComplaintResult {
    const isHi = data.language === 'hi';
    const isPa = data.language === 'pa';
    const platform = data.platform || '[Platform Name]';
    const dates = data.relevantDates || '[Date of issue]';
    const category = data.category || 'Grievance';

    const facts: string[] = [];
    if (data.platform) facts.push(`Platform: ${data.platform}`);
    if (data.relevantDates) facts.push(`Date: ${data.relevantDates}`);
    if (data.expectedAmount) facts.push(`Expected Amount: ₹${data.expectedAmount}`);
    if (data.receivedAmount) facts.push(`Received / Deducted: ₹${data.receivedAmount}`);

    const missing: string[] = [];
    if (!data.platform) missing.push('Platform / Employer Name');
    if (!data.relevantDates) missing.push('Specific date or shift time');
    if (!data.expectedAmount && (category.includes('payment') || category.includes('deduction'))) {
      missing.push('Expected amount or payment breakdown screenshot');
    }

    let draft = `To,
The Grievance Redressal Team,
${platform}

Subject: Request for Immediate Review: ${category}

Dear Sir / Madam,

I am writing to register an issue regarding my account / payouts on ${platform}.
Details of the concern:
- Date: ${dates}
- Description: ${data.problemDescription}
${data.expectedAmount ? `- Expected: ₹${data.expectedAmount}\n` : ''}${data.receivedAmount ? `- Received / Deducted: ₹${data.receivedAmount}\n` : ''}
Desired Resolution:
${data.desiredResolution || 'Prompt review and fair settlement.'}

Kindly audit the records and update me regarding the resolution.

Thank you,
[Worker Name / Partner ID]
[Registered Phone Number]`;

    if (isHi) {
      draft = `सेवा में,
शिकायत निवारण टीम,
${platform}

विषय: समीक्षा एवं समाधान हेतु अनुरोध: ${category}

महोदय / महोदया,

मैं ${platform} पर अपने कार्य से संबंधित निम्नलिखित समस्या की समीक्षा का अनुरोध करता/करती हूँ:
- तारीख: ${dates}
- समस्या का विवरण: ${data.problemDescription}
${data.expectedAmount ? `- अपेक्षित राशि: ₹${data.expectedAmount}\n` : ''}${data.receivedAmount ? `- प्राप्त / काटी गई राशि: ₹${data.receivedAmount}\n` : ''}
अपेक्षित समाधान:
${data.desiredResolution || 'उचित जांच और बकाया राशि का भुगतान।'}

कृपया रिकॉर्ड की जांच कर शीघ्र सूचित करें।

धन्यवाद,
[कामगार का नाम / पार्टनर आईडी]
[पंजीकृत मोबाइल नंबर]`;
    } else if (isPa) {
      draft = `ਸੇਵਾ ਵਿਖੇ,
ਸ਼ਿਕਾਇਤ ਨਿਵਾਰਣ ਟੀਮ,
${platform}

ਵਿਸ਼ਾ: ਪੜਤਾਲ ਅਤੇ ਹੱਲ ਲਈ ਬੇਨਤੀ: ${category}

ਸ਼੍ਰੀਮਾਨ / ਸ਼੍ਰੀਮਤੀ ਜੀ,

ਮੈਂ ${platform} 'ਤੇ ਆਪਣੇ ਕੰਮ ਸਬੰਧੀ ਇਸ ਮਸਲੇ ਦੀ ਪੜਤਾਲ ਲਈ ਬੇਨਤੀ ਕਰ ਰਿਹਾ/ਰਹੀ ਹਾਂ:
- ਮਿਤੀ: ${dates}
- ਮਸਲੇ ਦਾ ਵੇਰਵਾ: ${data.problemDescription}
${data.expectedAmount ? `- ਉਮੀਦ ਕੀਤੀ ਰਕਮ: ₹${data.expectedAmount}\n` : ''}${data.receivedAmount ? `- ਮਿਲੀ / ਕੱਟੀ ਗਈ ਰਕਮ: ₹${data.receivedAmount}\n` : ''}
ਲੋੜੀਂਦਾ ਹੱਲ:
${data.desiredResolution || 'ਨਿਰਪੱਖ ਪੜਤਾਲ ਅਤੇ ਹੱਲ।'}

ਧੰਨਵਾਦ,
[ਕਾਮੇ ਦਾ ਨਾਂ / ਪਾਰਟਨਰ ਆਈਡੀ]
[ਰਜਿਸਟਰਡ ਫ਼ੋਨ ਨੰਬਰ]`;
    }

    return {
      identifiedCategory: category,
      subject: `Formal Grievance: ${category} - [${platform}]`,
      complaintDraft: draft,
      complaintDraftEnglish: draft,
      providedFacts: facts,
      missingOrUnverifiedDetails: missing,
      relevantFollowUps: ['Do you have screenshots of the payment ledger or trip ID?'],
      recommendedNextSteps: [
        'Copy this text into the platform support / ticket section in your worker app.',
        'Attach screenshots of your shift log or deduction slip.',
        'Note down your ticket reference number.'
      ],
      securityNotice: 'Never share your UPI PIN, passwords, or SMS OTPs with anyone.'
    };
  }

  private getClientFallbackPortals(query: string, language: string): SchemeSearchResponse {
    const isHi = language === 'hi';
    const isPa = language === 'pa';
    return {
      success: true,
      isLiveSearch: false,
      statusMessage: 'Live search unavailable — browse official portals.',
      searchTimestamp: new Date().toISOString(),
      fallbackReason: 'Backend API connection offline. Showing verified central portals.',
      data: {
        summary: isHi
          ? 'लाइव खोज उपलब्ध नहीं है — असंगठित एवं गिग कामगारों के लिए आधिकारिक सरकारी पोर्टल नीचे दिए गए हैं:'
          : isPa
          ? 'ਲਾਈਵ ਖੋਜ ਉਪਲਬਧ ਨਹੀਂ ਹੈ — ਅਧਿਕਾਰਤ ਸਰਕਾਰੀ ਪੋਰਟਲ ਹੇਠਾਂ ਦਿੱਤੇ ਗਏ ਹਨ:'
          : 'Live search unavailable — browse official portals. Here are verified central portals:',
        results: [
          {
            schemeName: 'e-Shram Portal (National Database of Unorganised Workers)',
            authority: 'Ministry of Labour & Employment, Government of India',
            officialUrl: 'https://eshram.gov.in/Schemes',
            isOfficialSource: true,
            resultState: 'Official verification required',
            targetWorkers: 'Gig delivery workers, drivers, street vendors, unorganised workers aged 16-59',
            simpleExplanation: 'Central registry card (UAN) giving access to social security benefits and accidental cover.',
            keyEligibility: ['Age 16-59 years', 'Unorganised/gig worker', 'Not an income tax payer / EPFO member'],
            documentsRequired: ['Aadhaar linked mobile', 'Bank Account details'],
            verificationChecklist: ['Verify free registration at eshram.gov.in', 'Ensure bank account is Aadhaar seeded']
          },
          {
            schemeName: 'myScheme Government Benefits Discovery Portal',
            authority: 'National e-Governance Division (NeGD), MeitY',
            officialUrl: 'https://www.myscheme.gov.in/',
            isOfficialSource: true,
            resultState: 'Official verification required',
            targetWorkers: 'All gig and informal workers across India',
            simpleExplanation: 'Searchable central and state scheme eligibility directory based on profile filters.',
            keyEligibility: ['Varies by individual scheme rules'],
            documentsRequired: ['Government Photo ID', 'Income certificate / Self declaration'],
            verificationChecklist: ['Check scheme-specific criteria on myscheme.gov.in', 'Never pay any application fees']
          },
          {
            schemeName: 'PM SVANidhi (Micro-Credit for Street Vendors)',
            authority: 'Ministry of Housing and Urban Affairs (MoHUA)',
            officialUrl: 'https://pmsvanidhi.mohua.gov.in/',
            isOfficialSource: true,
            resultState: 'Official verification required',
            targetWorkers: 'Urban and semi-urban street vendors, hawkers, daily informal sellers',
            simpleExplanation: 'Collateral-free working capital loan starting at ₹10,000 with 7% interest subsidy.',
            keyEligibility: ['Engaged in street vending', 'Certificate of Vending or Letter of Recommendation'],
            documentsRequired: ['Vending Certificate / TVC Survey slip', 'Aadhaar & Bank Account'],
            verificationChecklist: ['Confirm eligibility with local Town Vending Committee (TVC)', 'Apply only via pmsvanidhi.mohua.gov.in']
          },
          {
            schemeName: 'Ayushman Bharat PM-JAY (Health Insurance)',
            authority: 'National Health Authority (NHA)',
            officialUrl: 'https://pmjay.gov.in/',
            isOfficialSource: true,
            resultState: 'Official verification required',
            targetWorkers: 'Eligible informal, unorganised and vulnerable worker families',
            simpleExplanation: 'Cashless hospital treatment cover up to ₹5 lakh per family per year at empanelled hospitals.',
            keyEligibility: ['Listed in SECC / State PM-JAY database'],
            documentsRequired: ['Ration Card / PM-JAY letter', 'Aadhaar Card'],
            verificationChecklist: ['Check status at beneficiary.nha.gov.in', 'Treatment is cashless only at empanelled hospitals']
          }
        ],
        disclaimer: 'Saathi displays verified official government portals as reference starting points. Applications and eligibility checks must be done directly on the official portal.'
      }
    };
  }
}
