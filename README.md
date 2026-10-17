# Saathi (साथी / ਸਾਥੀ)
### A Multilingual AI Assistant for Gig and Informal Workers in India
*Built for the Prompt Wars Hackathon*

---

## 🌟 Overview & Mission
**Saathi** is a mobile-first, multilingual civic-tech web application specifically engineered for India's 12+ million gig and platform delivery partners (Zomato, Swiggy, Zepto, Blinkit, Porter), ride-hailing drivers (Ola, Uber), and informal workers (street vendors, daily-wage laborers).

### Core Problem It Solves
1. **Unfair deductions & opaque deactivations**: Workers face unexplained algorithmic penalties without clear redressal paths or professional wording.
2. **Scattered welfare schemes**: Millions of eligible workers miss out on official social security (e-Shram, PM-SVANidhi, PM-SYM, Ayushman Bharat PM-JAY) due to fragmented portals and fraudulent third-party agents.
3. **Earnings opacity**: Payouts often bundle deductions, fuel, and commissions without clear separation between gross income and take-home savings.
4. **Field safety & vulnerability**: Workers face extreme weather, night shifts, and highway emergencies without instant access to official government helplines.

---

## 🚀 Key Modules & Capabilities

### 1. ✍️ Multilingual Grievance Assistant
- **Empathetic & Constructive**: Transforms worker input (in Hindi, Punjabi, or English) into formal, constructive grievance letters.
- **Strict AI Safety Guarantee**:
  - **Zero hallucinated amounts or dates**: If details are missing, Saathi explicitly marks them as `[To be filled by worker]`.
  - **No unbacked accusations**: Uses respectful, firm language (e.g. *"I request an audit and review of this deduction"*) rather than accusing the platform of fraud.
  - **Zero fake submission claims**: Clearly states that complaints are drafted locally and have NOT been submitted to platforms or authorities.
- **Actionable Output**: Editable draft, one-tap copy, text download, and local case saving with a unique Reference ID (e.g., `STH-2026-8492`).

### 2. 🏛️ Official Government Scheme & Document Discovery
- **Gemini Search Grounding**: Integrates Google Search Grounding to discover authoritative government portals (`gov.in`, `nic.in`).
- **Real Source Grounding**: Displays actual source URLs, issuing ministries, and explicit eligibility criteria supported by official pages.
- **Honest Result States**:
  - `Potentially relevant`
  - `Official verification required`
  - `More information needed`
  - `No reliable match found`
- **Transparent Fallback**: When live search or API keys are unavailable, clearly reports:
  `"Live search unavailable — browse official portals"`
  Offers curated, verified central portals (`eshram.gov.in`, `myscheme.gov.in`, `pmsvanidhi.mohua.gov.in`, `pmjay.gov.in`).
- **Interactive Verification Checklist**: "What should I verify?" checklist for every scheme before applying.

### 3. 📊 Worker-Entered Earnings Calculator
- **Deterministic TypeScript Arithmetic**:
  $$\text{Real Net Earnings} = \text{Gross Earnings} - \text{Platform Deductions} - \text{Work Expenses (Fuel/Data/Repairs)}$$
- **Reconciliation Engine**: Compares worker-entered bank payout against gross minus platform deductions. Identifies discrepancies without defamatory claims.
- **Strict Data Integrity**: Zero AI-generated transactions or seeded fake numbers.

### 4. 🛡️ Worker Safety & Practical Support
- **Reviewed Guidance Protocols**: Road safety & defensive riding, fatigue & heat stroke management, severe weather/monsoon precautions, night shift protocols, and dispute de-escalation.
- **Telemetry Transparency**: Explicitly clarifies that advice is not based on live GPS or weather telemetry.
- **Verified Indian Emergency Directory**: One-tap dialing for `112` (National Emergency), `1091` (Women Helpline), `14434` (e-Shram Helpdesk), `1033` (National Highway Emergency), and `1930` (Cyber Financial Fraud).

### 5. 📁 Saved Cases & Privacy
- **Client-Side Storage**: LocalStorage for case drafts and earnings records.
- **Zero Sensitive Data Storage**: Never requests or stores Aadhaar numbers, UPI PINs, or bank passwords.
- **Instant Privacy Reset**: One-click "Clear Local Data" removes all stored demo records.

---

## 🛠️ Technology Stack
- **Frontend**: Angular 19 (Standalone Components, Reactive Forms, Signals, Responsive CSS, I18n for English, Hindi, Punjabi)
- **Backend**: Node.js & Express API (`backend/src/index.js`)
- **AI & Grounding**: Google Gemini API (`gemini-1.5-flash` / `gemini-2.0-flash` with Google Search Grounding)
- **Security**: Backend-only API key isolation via `process.env.GEMINI_API_KEY`

---

## 💻 Setup & Startup Instructions

### 1. Prerequisites
- Node.js v18+ or v20+
- npm v9+

### 2. Configure Backend Environment
Navigate to `backend/` and create your `.env` file:
```bash
cd backend
cp .env.example .env
```
Edit `backend/.env`:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
PORT=3000
NODE_ENV=development
```
*(Note: If no Gemini API key is provided, Saathi automatically operates in its verified offline fallback mode with deterministic complaint generation and authoritative government portal directories).*

### 3. Start the Backend API
From the root directory or inside `backend/`:
```bash
cd backend
npm install
npm start
```
The backend will start on `http://localhost:3000`. You can test health at `http://localhost:3000/api/health`.

### 4. Start the Angular Frontend
In a separate terminal:
```bash
cd frontend
npm install
npm start
```
Open your browser and navigate to:
```
http://localhost:4200
```

### 5. Production Build Verification
To test the production build:
```bash
cd frontend
npm run build
```
Build files will be generated in `frontend/dist/frontend`.

---

## 🧪 Hackathon Demo Walkthrough Sequence

1. **Home Screen & Safety Charter**:
   - Notice the top language switch: Toggle between **English**, **हिंदी (Hindi)**, and **ਪੰਜਾਬੀ (Punjabi)**.
   - Read the **Transparency & Safety Charter**: "What Saathi CAN & CANNOT Do".
   - Notice the live Backend & AI status indicator in the header.

2. **Draft a Complaint (Grievance Assistant)**:
   - Select the category: `Unexpected Deduction`.
   - Click "Sample / उदाहरण भरें" or type an issue (e.g. ₹500 deduction on Zomato due to restaurant food preparation delay).
   - Click **"Draft Formal Complaint"**.
   - Notice that Saathi generates a polite, constructive formal grievance.
   - Check the **"Worker-Provided Facts"** vs **"Missing / Unverified Details"** cards.
   - Click **"Save to My Cases"** or **"Copy Complaint"**.

3. **Find Schemes & Official Documents**:
   - Click any popular query chip (e.g., *"Delivery Partner Schemes"* or *"e-Shram Registration"*).
   - Inspect the honest status banner: shows live Gemini search status or fallback notice.
   - Observe the **Result State Badge**: `Official verification required` / `Potentially relevant`.
   - Click **"What should I verify?"** to open the pre-application checklist.
   - Click **"Open Official Source"** to view the real official portal (`eshram.gov.in`, `myscheme.gov.in`, `pmjay.gov.in`).

4. **Calculate Net Earnings**:
   - Enter Gross Earnings: `₹8,500`
   - Platform Deductions: `₹750`
   - Work Expenses (Fuel/Data): `₹1,800`
   - Actual Payout: `₹7,750`
   - View the deterministic breakdown: Net Earnings = `₹5,950`.
   - Inspect the **Reconciliation Box**: Explains the exact arithmetic match between reported bank transfer and gross minus deductions.

5. **Safety & Emergency Helplines**:
   - Select your work situation (e.g., *Night Shift & Solitary Worker Safety* or *Severe Weather*).
   - Review the reviewed tips and verified national helplines (`112`, `1091`, `14434`).

6. **Review My Cases & Clear Data**:
   - Navigate to **My Cases** to see the saved case with its reference ID (`STH-2026-XXXX`).
   - Click **"Clear Local Data"** to demonstrate complete client privacy.

---

## 🛡️ Truthfulness & AI Safety Commitments
- **No Hallucinated Data**: If an amount, date, or policy number isn't supplied, Saathi never invents one.
- **No Bogus Accusations**: Wording is firm and constructive, never defamatory.
- **No False Submissions**: The application never claims to have lodged a complaint with platforms or government authorities.
- **No Bogus Eligibility Declarations**: The user is never declared "confirmed eligible" by an LLM guess.
- **Privacy-First**: No Aadhaar, PAN, UPI PIN, or bank passwords requested or stored.
