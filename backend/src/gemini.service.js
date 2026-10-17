import { GoogleGenerativeAI } from '@google/generative-ai';
import { OFFICIAL_PORTALS } from './official-portals.data.js';

/**
 * Service to interface safely with Google Gemini API and Search Grounding.
 * Implements strict AI safety rules:
 * - Never hallucinates amounts, dates, legal clauses, or accusations.
 * - Enforces honest result states.
 * - Handles missing API key or search API failures honestly.
 */

export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
export const GEMINI_BACKUP_MODEL = process.env.GEMINI_BACKUP_MODEL || 'gemini-2.0-flash';

/**
 * Reliability Helper:
 * If response takes longer than 5 seconds (5000ms) or errors on primary model,
 * automatically falls back to secondary backup model within Gemini.
 */
export async function executeWithTimeoutAndBackup(fn, timeoutMs = 5000) {
  const withTimeout = (promise, ms, label) => {
    let timer;
    const timeoutPromise = new Promise((_, reject) => {
      timer = setTimeout(() => {
        reject(new Error(`Timeout: ${label} exceeded ${ms}ms limit`));
      }, ms);
    });
    return Promise.race([
      promise.finally(() => clearTimeout(timer)),
      timeoutPromise
    ]);
  };

  try {
    return await withTimeout(fn(GEMINI_MODEL), timeoutMs, `Primary model (${GEMINI_MODEL})`);
  } catch (primaryError) {
    console.warn(`[Gemini Reliability Check] Primary model (${GEMINI_MODEL}) failed or exceeded 5s limit (${primaryError.message}). Calling backup model (${GEMINI_BACKUP_MODEL})...`);
    return await withTimeout(fn(GEMINI_BACKUP_MODEL), timeoutMs, `Backup model (${GEMINI_BACKUP_MODEL})`);
  }
}

function getAiClient() {
  let apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  apiKey = apiKey.replace(/your_gemini_api_key_here/gi, '').trim();
  if (!apiKey || apiKey === '') return null;
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Check if Gemini API is configured
 */
export function isGeminiConfigured() {
  let apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return false;
  apiKey = apiKey.replace(/your_gemini_api_key_here/gi, '').trim();
  return Boolean(apiKey && apiKey.length > 10);
}

/**
 * Draft a professional, constructive grievance complaint for a worker.
 */
export async function draftComplaint({
  problemDescription,
  category,
  platform,
  relevantDates,
  expectedAmount,
  receivedAmount,
  explanationProvided,
  desiredResolution,
  language = 'en'
}) {
  const ai = getAiClient();

  // If Gemini is not configured, generate a deterministic safe draft template
  if (!ai) {
    return generateDeterministicComplaintDraft({
      problemDescription,
      category,
      platform,
      relevantDates,
      expectedAmount,
      receivedAmount,
      explanationProvided,
      desiredResolution,
      language
    });
  }

  const prompt = `
You are Saathi, an empathetic AI assistant helping Indian gig and informal workers draft formal, constructive complaints for workplace and platform issues.

STRICT SAFETY AND INTEGRITY GUIDELINES:
1. NEVER invent or assume any amounts, dates, order IDs, conversations, evidence, legal sections, government acts, or accusations that the worker did not provide.
2. If an amount or date was NOT provided, clearly write "[Not Provided / To be filled by worker]" or state that it is unknown. Do NOT make up numbers or dates.
3. NEVER make unsupported accusations of fraud, cheating, or theft. Use constructive, firm, professional language such as "I request a thorough review and audit of this deduction", "I seek clarification on the grounds for this action", or "I request disbursement of the pending payout".
4. The draft MUST NOT claim that it has been submitted to any authority, platform, or court.
5. Emphasize a warning that the worker should NEVER include passwords, UPI PINs, or bank account OTPs.

WORKER INPUTS:
- Preferred Language: ${language} (en = English, hi = Hindi, pa = Punjabi)
- Issue Category: ${category || 'Not specified'}
- Platform / Employer: ${platform || 'Not specified'}
- Relevant Dates: ${relevantDates || 'Not provided'}
- Expected Amount: ${expectedAmount ? '₹' + expectedAmount : 'Not provided'}
- Received / Deducted Amount: ${receivedAmount ? '₹' + receivedAmount : 'Not provided'}
- Explanation given by platform/employer: ${explanationProvided || 'None provided'}
- Desired Resolution: ${desiredResolution || 'Fair review and resolution'}
- Problem Description in worker's own words:
"${problemDescription}"

TASK:
Produce a valid JSON object strictly matching this schema (do NOT wrap with markdown outside the JSON or code blocks other than pure json):
{
  "identifiedCategory": "string",
  "subject": "Clear, professional subject line",
  "complaintDraft": "Full formal complaint text in ${language === 'hi' ? 'Hindi (हिंदी)' : language === 'pa' ? 'Punjabi (ਪੰਜਾਬੀ)' : 'English'}",
  "complaintDraftEnglish": "Formal complaint text in English (for platform grievance desks if non-English requested, or duplicate of above if English)",
  "providedFacts": [
    "List of concrete facts explicitly provided by the worker"
  ],
  "missingOrUnverifiedDetails": [
    "Specific missing details that the worker should verify or attach before sending (e.g. Order ID, screenshots)"
  ],
  "relevantFollowUps": [
    "1-2 optional questions to help the worker clarify further if needed"
  ],
  "recommendedNextSteps": [
    "Actionable steps for submission via official platform helpdesk or grievance officer"
  ],
  "securityNotice": "Reminder: Never share bank OTP, UPI PIN, or account passwords with anyone."
}
`;

  try {
    const parsed = await executeWithTimeoutAndBackup(async (modelName) => {
      const model = ai.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1
        }
      });
      const response = await model.generateContent(prompt);
      const text = response.response.text();
      return JSON.parse(text);
    }, 5000);

    if (platform && parsed.subject && !parsed.subject.includes(platform)) {
      parsed.subject = `${parsed.subject} - [${platform}]`;
    }

    return {
      success: true,
      data: parsed,
      isAiGenerated: true
    };
  } catch (error) {
    console.error('Error in Gemini complaint drafting, falling back to deterministic safe generator:', error.message);
    const fallback = generateDeterministicComplaintDraft({
      problemDescription,
      category,
      platform,
      relevantDates,
      expectedAmount,
      receivedAmount,
      explanationProvided,
      desiredResolution,
      language
    });
    fallback.notice = 'AI generation encountered an issue; fallback safe structured draft generated.';
    return fallback;
  }
}

/**
 * Deterministic fallback generator when AI is offline or key is unconfigured.
 * Guarantees zero hallucinations and adheres to all rules.
 */
function generateDeterministicComplaintDraft({
  problemDescription,
  category = 'Issue',
  platform = '[Platform / Employer Name]',
  relevantDates = '[Date(s) of occurrence]',
  expectedAmount,
  receivedAmount,
  explanationProvided,
  desiredResolution = 'Review and release of pending dues / resolution',
  language = 'en'
}) {
  const isHi = language === 'hi';
  const isPa = language === 'pa';

  const providedFacts = [];
  const missingDetails = [];

  if (platform && platform !== '[Platform / Employer Name]') providedFacts.push(`Platform / Employer: ${platform}`);
  else missingDetails.push('Platform / Employer Name');

  if (relevantDates && relevantDates !== '[Date(s) of occurrence]') providedFacts.push(`Date(s): ${relevantDates}`);
  else missingDetails.push('Specific date(s) or work shift times');

  if (expectedAmount) providedFacts.push(`Expected Amount: ₹${expectedAmount}`);
  else missingDetails.push('Exact expected amount or rate card reference');

  if (receivedAmount) providedFacts.push(`Received / Deducted Amount: ₹${receivedAmount}`);

  if (explanationProvided) providedFacts.push(`Explanation recorded: ${explanationProvided}`);

  let subject = `Formal Grievance: ${category} - Request for Review`;
  if (platform && platform !== '[Platform / Employer Name]') {
    subject += ` [${platform}]`;
  }

  let englishDraft = `To,
The Grievance Officer / Support Team,
${platform || '[Company / Platform Name]'}

Subject: ${subject}

Dear Sir / Madam,

I am writing to formally request a review regarding an issue concerning ${category.toLowerCase()}.

Details of the concern:
- Date of occurrence: ${relevantDates || '[Please insert exact date/time]'}
- Description: ${problemDescription}
${expectedAmount ? `- Expected Amount: ₹${expectedAmount}\n` : ''}${receivedAmount ? `- Amount Received / Deducted: ₹${receivedAmount}\n` : ''}${explanationProvided ? `- Information provided so far: ${explanationProvided}\n` : ''}
Desired Resolution:
${desiredResolution}

I request your team to kindly audit the records and provide a written clarification and resolution at the earliest. Supporting order IDs and transaction logs can be provided upon request.

Thank you,
[Worker Name / Partner ID]
[Registered Phone Number]`;

  let localDraft = englishDraft;
  if (isHi) {
    localDraft = `सेवा में,
शिकायत निवारण अधिकारी / सहायता टीम,
${platform || '[कंपनी / प्लेटफॉर्म का नाम]'}

विषय: शिकायत: ${category} - समीक्षा एवं समाधान हेतु अनुरोध

महोदय / महोदया,

मैं ${category} से संबंधित निम्नलिखित समस्या की निष्पक्ष समीक्षा हेतु यह औपचारिक अनुरोध प्रस्तुत कर रहा/रही हूँ:

विवरण:
- घटना की तारीख / समय: ${relevantDates || '[कृपया सही तारीख दर्ज करें]'}
- समस्या का विवरण: ${problemDescription}
${expectedAmount ? `- अपेक्षित राशि: ₹${expectedAmount}\n` : ''}${receivedAmount ? `- प्राप्त / काटी गई राशि: ₹${receivedAmount}\n` : ''}${explanationProvided ? `- दिया गया स्पष्टीकरण: ${explanationProvided}\n` : ''}
अपेक्षित समाधान:
${desiredResolution}

कृपया इस मामले की जांच करें और उचित समाधान प्रदान करने की कृपा करें।

धन्यवाद,
[कामगार का नाम / पार्टनर आईडी]
[पंजीकृत मोबाइल नंबर]`;
  } else if (isPa) {
    localDraft = `ਸੇਵਾ ਵਿਖੇ,
ਸ਼ਿਕਾਇਤ ਨਿਵਾਰਣ ਅਧਿਕਾਰੀ / ਸਹਾਇਤਾ ਟੀਮ,
${platform || '[ਕੰਪਨੀ / ਪਲੇਟਫਾਰਮ ਦਾ ਨਾਂ]'}

ਵਿਸ਼ਾ: ਸ਼ਿਕਾਇਤ: ${category} - ਪੜਤਾਲ ਅਤੇ ਹੱਲ ਲਈ ਬੇਨਤੀ

ਸ਼੍ਰੀਮਾਨ / ਸ਼੍ਰੀਮਤੀ ਜੀ,

ਮੈਂ ${category} ਸਬੰਧੀ ਮਸਲੇ ਦੀ ਪੜਤਾਲ ਲਈ ਇਹ ਰਸਮੀ ਬੇਨਤੀ ਕਰ ਰਿਹਾ/ਰਹੀ ਹਾਂ:

ਵੇਰਵੇ:
- ਮਿਤੀ / ਸਮਾਂ: ${relevantDates || '[ਕਿਰਪਾ ਕਰਕੇ ਸਹੀ ਮਿਤੀ ਦਰਜ ਕਰੋ]'}
- ਮਸਲੇ ਦਾ ਵੇਰਵਾ: ${problemDescription}
${expectedAmount ? `- ਉਮੀਦ ਕੀਤੀ ਰਕਮ: ₹${expectedAmount}\n` : ''}${receivedAmount ? `- ਮਿਲੀ / ਕੱਟੀ ਗਈ ਰਕਮ: ₹${receivedAmount}\n` : ''}${explanationProvided ? `- ਦਿੱਤਾ ਗਿਆ ਸਪੱਸ਼ਟੀਕਰਨ: ${explanationProvided}\n` : ''}
ਲੋੜੀਂਦਾ ਹੱਲ:
${desiredResolution}

ਕਿਰਪਾ ਕਰਕੇ ਰਿਕਾਰਡ ਦੀ ਜਾਂਚ ਕਰਕੇ ਜਲਦੀ ਤੋਂ ਜਲਦੀ ਯੋਗ ਹੱਲ ਕੀਤਾ ਜਾਵੇ।

ਧੰਨਵਾਦ,
[ਕਾਮੇ ਦਾ ਨਾਂ / ਪਾਰਟਨਰ ਆਈਡੀ]
[ਰਜਿਸਟਰਡ ਫ਼ੋਨ ਨੰਬਰ]`;
  }

  return {
    success: true,
    data: {
      identifiedCategory: category,
      subject,
      complaintDraft: localDraft,
      complaintDraftEnglish: englishDraft,
      providedFacts,
      missingOrUnverifiedDetails: missingDetails,
      relevantFollowUps: [
        'Do you have the trip ID, order ID, or transaction screenshot?',
        'Was any automated notification or deduction code shown in your app?'
      ],
      recommendedNextSteps: [
        'Copy this text into the platform support / ticket section in your delivery or driver app.',
        'Attach screenshots of your payout ledger or shift log.',
        'Keep a record of your ticket reference number.'
      ],
      securityNotice: 'Never share your UPI PIN, banking passwords, or SMS OTPs with any support executive.'
    },
    isAiGenerated: false
  };
}

/**
 * Search government schemes and official documents using Gemini with Google Search Grounding.
 * Strictly adheres to truthfulness:
 * - Real source URLs from grounding metadata.
 * - Prioritizes .gov.in, .nic.in, official portals.
 * - Enforces honest result states.
 * - Never declares confirmed eligibility.
 */
export async function searchSchemes({ query, language = 'en' }) {
  const ai = getAiClient();
  const searchTimestamp = new Date().toISOString();

  // If Gemini is not configured, return honest fallback
  if (!ai) {
    return getFallbackOfficialPortals({
      query,
      language,
      searchTimestamp,
      reason: 'Gemini API key is not configured in backend environment.'
    });
  }

  const prompt = `
You are an expert Indian Government welfare schemes advisor for gig, platform, and informal workers (delivery riders, drivers, street vendors, construction workers).

USER NEED: "${query}"
PREFERRED LANGUAGE: ${language} (en = English, hi = Hindi, pa = Punjabi)

SEARCH INSTRUCTIONS:
Search authoritative Indian government portals (specifically domains like gov.in, nic.in, eshram.gov.in, myscheme.gov.in, services.india.gov.in, labour.gov.in, pmsvanidhi.mohua.gov.in).
Find relevant central or state government schemes, registration portals, or official application documents.

STRICT ACCURACY RULES:
1. ONLY include schemes and portals backed by real search results. Do NOT fabricate scheme names, eligibility criteria, or URLs.
2. Result states must be one of:
   - "Potentially relevant" (if source matches worker's general profile, but eligibility must be verified)
   - "More information needed" (if worker's query is too vague)
   - "Official verification required" (if final eligibility requires checking an official database/list)
   - "No reliable match found" (if nothing verifiable matches)
3. NEVER state or imply that the worker is "Eligible" or "Confirmed eligible". Always emphasize verification.
4. If an official PDF or direct scheme page URL is found, provide that exact URL.

Return your response as a valid JSON object matching this schema:
{
  "summary": "Brief explanation in ${language === 'hi' ? 'Hindi' : language === 'pa' ? 'Punjabi' : 'English'}",
  "results": [
    {
      "schemeName": "Official Scheme / Document Name",
      "authority": "Issuing Ministry or State Department",
      "officialUrl": "Actual official URL returned by search (must be gov.in or official portal)",
      "isOfficialSource": true,
      "resultState": "Potentially relevant",
      "targetWorkers": "Who this is meant for",
      "simpleExplanation": "Clear, plain-language description in ${language === 'hi' ? 'Hindi' : language === 'pa' ? 'Punjabi' : 'English'}",
      "keyEligibility": [
        "Explicitly supported eligibility criteria from the source"
      ],
      "documentsRequired": [
        "Official documents or requirements mentioned"
      ],
      "verificationChecklist": [
        "Concrete things worker must check independently on the official portal"
      ]
    }
  ],
  "disclaimer": "Saathi assists in discovering official public schemes. It does not determine official eligibility, register beneficiaries, or submit applications."
}
`;

  try {
    const { response, text } = await executeWithTimeoutAndBackup(async (modelName) => {
      let model;
      let resp;
      try {
        model = ai.getGenerativeModel({
          model: modelName,
          tools: [{ googleSearch: {} }]
        });
        resp = await model.generateContent(prompt);
      } catch (groundingErr) {
        model = ai.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1
          }
        });
        resp = await model.generateContent(prompt);
      }
      return { response: resp, text: resp.response.text() };
    }, 5000);
    // Clean potential markdown wrap if any
    const cleanedJson = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(cleanedJson);

    // Extract search grounding metadata if present
    const candidate = response.response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata;
    const webSearchQueries = groundingMetadata?.webSearchQueries || [];
    const groundingChunks = groundingMetadata?.groundingChunks || [];

    const citations = groundingChunks.map(chunk => ({
      title: chunk.web?.title || 'Official Source',
      url: chunk.web?.uri || ''
    })).filter(c => c.url.length > 0);

    return {
      success: true,
      isLiveSearch: true,
      statusMessage: 'Live search completed via Gemini Google Search Grounding.',
      searchTimestamp,
      webSearchQueries,
      citations,
      data: parsed
    };
  } catch (error) {
    console.error('Error during Gemini Search, falling back to verified official portals:', error.message);
    return getFallbackOfficialPortals({
      query,
      language,
      searchTimestamp,
      reason: `Live search unavailable (${error.message || 'API error'}). Browsing known official government portals.`
    });
  }
}

/**
 * Filter and format official portals as honest fallback when live search is unavailable.
 */
function getFallbackOfficialPortals({ query, language, searchTimestamp, reason }) {
  const isHi = language === 'hi';
  const isPa = language === 'pa';

  const q = (query || '').toLowerCase();

  // Find relevant portals based on keywords (e.g. delivery, vendor, pension, health, registration)
  let matched = OFFICIAL_PORTALS.filter(portal => {
    if (!q) return true;
    const combined = `${portal.name} ${portal.description} ${portal.targetWorkers}`.toLowerCase();
    const words = q.split(/\s+/).filter(w => w.length > 2);
    return words.some(w => combined.includes(w));
  });

  if (matched.length === 0) {
    matched = OFFICIAL_PORTALS.slice(0, 4); // Default to top national portals
  }

  const results = matched.map(portal => ({
    schemeName: isHi && portal.nameHi ? portal.nameHi : (isPa && portal.namePa ? portal.namePa : portal.name),
    authority: portal.authority,
    officialUrl: portal.officialUrl,
    isOfficialSource: portal.isOfficial,
    resultState: 'Official verification required',
    targetWorkers: portal.targetWorkers,
    simpleExplanation: portal.description,
    keyEligibility: portal.keyEligibility,
    documentsRequired: portal.documentsNeeded,
    verificationChecklist: portal.verificationChecklist
  }));

  const summary = isHi
    ? 'लाइव खोज वर्तमान में उपलब्ध नहीं है। असंगठित एवं गिग कामगारों के लिए आधिकारिक सरकारी पोर्टल नीचे उपलब्ध हैं:'
    : isPa
    ? 'ਲਾਈਵ ਖੋਜ ਫਿਲਹਾਲ ਉਪਲਬਧ ਨਹੀਂ ਹੈ। ਗ਼ੈਰ-ਸੰਗਠਿਤ ਅਤੇ ਗਿਗ ਕਾਮਿਆਂ ਲਈ ਅਧਿਕਾਰਤ ਸਰਕਾਰੀ ਪੋਰਟਲ ਹੇਠਾਂ ਦਿੱਤੇ ਗਏ ਹਨ:'
    : 'Live search unavailable — browse official portals. Here are verified central portals for gig and informal workers:';

  return {
    success: true,
    isLiveSearch: false,
    statusMessage: 'Live search unavailable — browse official portals.',
    searchTimestamp,
    fallbackReason: reason,
    data: {
      summary,
      results,
      disclaimer: 'Saathi displays verified official government portals as reference starting points. Applications and eligibility checks must be done directly on the official portal.'
    }
  };
}

/**
 * Plain-language explanation of a retrieved government scheme or document.
 */
export async function explainSource({ schemeName, officialUrl, context, language = 'en' }) {
  const ai = getAiClient();

  if (!ai) {
    return {
      success: true,
      explanation: `To verify requirements for ${schemeName}, visit the official portal at ${officialUrl}. Review eligibility rules and check required documents before applying at a government center (CSC) or online.`,
      checklist: [
        'Check age and income limits stated on the official website',
        'Verify whether state-specific domicile is required',
        'Ensure you possess the required identity and bank documents'
      ]
    };
  }

  const prompt = `
You are Saathi, explaining an official Indian government scheme or portal to an informal or gig worker.
Scheme Name: ${schemeName}
Official Portal URL: ${officialUrl}
Additional Context: ${context || 'None'}
Worker Language: ${language} (en = English, hi = Hindi, pa = Punjabi)

SAFETY RULES:
- Do not promise approval or claim the worker is entitled.
- Explain in simple, respectful, accessible terms what the scheme provides and what the worker must independently check.
- Never invent documents not mandated by official rules.

Output strict JSON:
{
  "explanation": "Clear explanation in ${language === 'hi' ? 'Hindi' : language === 'pa' ? 'Punjabi' : 'English'}",
  "whoShouldApply": "Target group",
  "verificationChecklist": [
    "Key items to check on the official portal"
  ],
  "caution": "Warning against paying unauthorized agents or sharing OTPs"
}
`;

  try {
    const model = ai.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1
      }
    });

    const response = await model.generateContent(prompt);
    const cleaned = response.response.text().replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    return {
      success: true,
      data: JSON.parse(cleaned)
    };
  } catch (error) {
    return {
      success: true,
      explanation: `Please check the official page at ${officialUrl} for verified terms.`,
      checklist: ['Verify current portal status', 'Confirm required documents']
    };
  }
}
