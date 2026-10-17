/**
 * Authoritative official government portals and core schemes for gig, platform, and informal workers in India.
 * These are verified public portals used as authoritative references and safe fallbacks.
 */
export const OFFICIAL_PORTALS = [
  {
    id: 'eshram',
    name: 'e-Shram Portal (National Database of Unorganised Workers)',
    nameHi: 'ई-श्रम पोर्टल (असंगठित कामगारों का राष्ट्रीय डेटाबेस)',
    namePa: 'ਈ-ਸ਼੍ਰਮ ਪੋਰਟਲ (ਗ਼ੈਰ-ਸੰਗਠਿਤ ਕਾਮਿਆਂ ਦਾ ਰਾਸ਼ਟਰੀ ਡੇਟਾਬੇਸ)',
    description: 'Central portal to register unorganised, gig, and platform workers to access social security benefits, universal UAN card, and DBT welfare schemes.',
    targetWorkers: 'Gig delivery workers, cab drivers, street vendors, construction & domestic workers aged 16-59.',
    authority: 'Ministry of Labour & Employment, Government of India',
    officialUrl: 'https://eshram.gov.in/Schemes',
    isOfficial: true,
    domain: 'gov.in',
    keyEligibility: [
      'Age between 16-59 years',
      'Worker in unorganised sector or gig/platform economy',
      'Should not be a member of EPFO/ESIC or an income tax payer'
    ],
    documentsNeeded: [
      'Aadhaar number (linked with active mobile for OTP)',
      'Active savings bank account details (for DBT)',
      'Current mobile number'
    ],
    verificationChecklist: [
      'Verify that registration on eshram.gov.in is free of cost',
      'Ensure your bank account is Aadhaar-seeded for direct benefit transfer',
      'Download UAN card only from official eshram.gov.in portal'
    ]
  },
  {
    id: 'myscheme',
    name: 'myScheme Government Benefits Discovery Portal',
    nameHi: 'माई-स्कीम सरकारी योजना खोज पोर्टल',
    namePa: 'ਮਾਈ-ਸਕੀਮ ਸਰਕਾਰੀ ਯੋਜਨਾ ਪੋਰਟਲ',
    description: 'National government platform to discover eligible central and state government welfare schemes across employment, insurance, health, and pensions.',
    targetWorkers: 'All gig, informal, street vendors, and low-income workers across India.',
    authority: 'National e-Governance Division (NeGD), MeitY, Government of India',
    officialUrl: 'https://www.myscheme.gov.in/',
    isOfficial: true,
    domain: 'gov.in',
    keyEligibility: [
      'Varies by individual scheme rules',
      'Filterable by income, occupation, category, state, and age'
    ],
    documentsNeeded: [
      'Identity proof (Voter ID / Aadhaar / Ration Card)',
      'Income certificate or self-declaration as required by specific scheme'
    ],
    verificationChecklist: [
      'Check specific state and category eligibility on myscheme.gov.in',
      'Verify application deadlines and designated application offices',
      'Do not pay any intermediary fees to search or apply'
    ]
  },
  {
    id: 'pmsvanidhi',
    name: 'PM SVANidhi (Street Vendor\'s AtmaNirbhar Nidhi)',
    nameHi: 'पीएम स्वनिधि (स्ट्रीट वेंडर्स आत्मनिर्भर निधि)',
    namePa: 'ਪੀਐਮ ਸਵਨਿਧੀ (ਸਟਰੀਟ ਵੈਂਡਰਜ਼ ਆਤਮ-ਨਿਰਭਰ ਨਿਧੀ)',
    description: 'Affordable working capital collateral-free micro-loans (First tranche ₹10,000, subsequent tranches ₹20,000 & ₹50,000) with 7% interest subsidy and digital transaction cashback.',
    targetWorkers: 'Street vendors, hawkers, thelawalas, and urban/semi-urban informal micro-sellers.',
    authority: 'Ministry of Housing and Urban Affairs (MoHUA), Government of India',
    officialUrl: 'https://pmsvanidhi.mohua.gov.in/',
    isOfficial: true,
    domain: 'gov.in',
    keyEligibility: [
      'Engaged in vending in urban areas on or before designated cutoff dates',
      'Possess Certificate of Vending / ID card issued by Urban Local Body (ULB) or Town Vending Committee (TVC), or Letter of Recommendation (LoR)'
    ],
    documentsNeeded: [
      'Vending Certificate / TVC Survey slip or Letter of Recommendation from local Municipality',
      'Aadhaar Card and Bank Account details'
    ],
    verificationChecklist: [
      'Verify status at local Municipal Corporation / Town Vending Committee',
      'Check that applications are routed through official lending banks on pmsvanidhi.mohua.gov.in',
      'Ensure regular repayment to unlock higher credit tranches'
    ]
  },
  {
    id: 'services-india',
    name: 'National Government Services Portal (Services.india.gov.in)',
    nameHi: 'राष्ट्रीय सरकारी सेवा पोर्टल (services.india.gov.in)',
    namePa: 'ਰਾਸ਼ਟਰੀ ਸਰਕਾਰੀ ਸੇਵਾਵਾਂ ਪੋਰਟਲ (services.india.gov.in)',
    description: 'Single access point to over 13,000 citizen services across central and state governments, including labor welfare, labor cards, driving licenses, and ration cards.',
    targetWorkers: 'All Indian workers requiring official municipal, state, or central department services.',
    authority: 'National Informatics Centre (NIC), Ministry of Electronics & IT',
    officialUrl: 'https://services.india.gov.in/',
    isOfficial: true,
    domain: 'gov.in',
    keyEligibility: [
      'Citizen of India meeting service-specific criteria'
    ],
    documentsNeeded: [
      'Depends on the specific state service chosen'
    ],
    verificationChecklist: [
      'Select your specific state portal link directly from services.india.gov.in',
      'Never share password or OTP with unauthorized intermediaries'
    ]
  },
  {
    id: 'pmjay',
    name: 'Ayushman Bharat PM-JAY (Health Protection Scheme)',
    nameHi: 'आयुष्मान भारत प्रधानमंत्री जन आरोग्य योजना (PM-JAY)',
    namePa: 'ਆਯੁਸ਼ਮਾਨ ਭਾਰਤ ਪ੍ਰਧਾਨ ਮੰਤਰੀ ਜਨ ਅਰੋਗਿਆ ਯੋਜਨਾ (PM-JAY)',
    description: 'Health cover of up to ₹5 lakh per family per year for secondary and tertiary care hospitalization across empanelled public and private hospitals.',
    targetWorkers: 'Vulnerable and low-income informal and unorganised sector families identified under SECC database and state schemes.',
    authority: 'National Health Authority (NHA), Ministry of Health and Family Welfare',
    officialUrl: 'https://pmjay.gov.in/',
    isOfficial: true,
    domain: 'gov.in',
    keyEligibility: [
      'Name must be listed in the PM-JAY beneficiary database (SECC 2011 criteria or expanded state criteria)',
      'No cap on family size or age of members'
    ],
    documentsNeeded: [
      'Ration Card / PM-JAY letter',
      'Aadhaar Card / Government photo ID for identity verification'
    ],
    verificationChecklist: [
      'Check eligibility online at beneficiary.nha.gov.in or nearest Ayushman Kendra / CSC',
      'Treatment is cashless only at officially empanelled hospitals listed on pmjay.gov.in'
    ]
  },
  {
    id: 'pmsym',
    name: 'Pradhan Mantri Shram Yogi Maandhan (PM-SYM Pension)',
    nameHi: 'प्रधानमंत्री श्रम योगी मानधन योजना (PM-SYM)',
    namePa: 'ਪ੍ਰਧਾਨ ਮੰਤਰੀ ਸ਼੍ਰਮ ਯੋਗੀ ਮਾਨਧਨ ਯੋਜਨਾ (PM-SYM)',
    description: 'Voluntary and contributory pension scheme providing guaranteed minimum pension of ₹3,000 per month after attaining 60 years of age, with 50% central matching contribution.',
    targetWorkers: 'Home-based workers, street vendors, rickshaw pullers, delivery partners, and similar informal workers earning <= ₹15,000/month.',
    authority: 'Ministry of Labour & Employment / LIC of India',
    officialUrl: 'https://maandhan.in/',
    isOfficial: true,
    domain: 'gov.in',
    keyEligibility: [
      'Unorganised worker aged 18 to 40 years',
      'Monthly income not exceeding ₹15,000 per month',
      'Should not be covered under EPFO, ESIC, or NPS (Govt), and not an income tax assessee'
    ],
    documentsNeeded: [
      'Aadhaar Card',
      'Savings Bank Account with IFSC code and auto-debit consent mandate'
    ],
    verificationChecklist: [
      'Calculate monthly premium (₹55 to ₹200 depending on entry age) matched equally by Central Govt',
      'Enroll at Common Service Center (CSC) or online at maandhan.in'
    ]
  },
  {
    id: 'labour-ministry',
    name: 'Ministry of Labour & Employment (Social Security & Gig Worker Acts)',
    nameHi: 'श्रम और रोजगार मंत्रालय (सामाजिक सुरक्षा प्रभाग)',
    namePa: 'ਕਿਰਤ ਅਤੇ ਰੋਜ਼ਗਾਰ ਮੰਤਰਾਲਾ (ਸਮਾਜਿਕ ਸੁਰੱਖਿਆ)',
    description: 'Official notifications regarding the Code on Social Security 2020 provisions for gig & platform workers, welfare fund notifications, and state board rules.',
    targetWorkers: 'Gig and platform delivery partners, ride-hailing drivers, and logistics workers.',
    authority: 'Government of India',
    officialUrl: 'https://labour.gov.in/',
    isOfficial: true,
    domain: 'gov.in',
    keyEligibility: [
      'Applies to workers categorized under platform work and gig economy arrangements'
    ],
    documentsNeeded: [
      'Platform partner ID / registration documents'
    ],
    verificationChecklist: [
      'Read official gazette notifications directly on labour.gov.in',
      'Refer to state-specific gig worker welfare board rules (e.g. Rajasthan Gig Workers Act, Karnataka gig worker insurance)'
    ]
  }
];
