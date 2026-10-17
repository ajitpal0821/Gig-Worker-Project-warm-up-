import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from all possible locations
dotenv.config();
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(process.cwd(), '.env') });
dotenv.config({ path: path.join(process.cwd(), 'backend', '.env') });

// Clean key if placeholder string was accidentally appended
if (process.env.GEMINI_API_KEY) {
  process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY.replace(/your_gemini_api_key_here/gi, '').trim();
}

import { draftComplaint, searchSchemes, explainSource, isGeminiConfigured } from './gemini.service.js';
import { connectDb, isDbConnected } from './db.js';
import authRoutes from './routes/auth.routes.js';
import casesRoutes from './routes/cases.routes.js';
import earningsRoutes from './routes/earnings.routes.js';

export const app = express();

// Allowed origins for CORS with credentials
const allowedOrigins = [
  'http://localhost:4200',
  'http://127.0.0.1:4200',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
].filter(Boolean);

// CORS configuration supporting same-origin, preview URLs, and HttpOnly cookies
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || /^https:\/\/.*\.vercel\.app$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS: Origin not allowed'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Saathi-Client']
}));

// Cookie parser and body parser (with 1MB body limit)
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));

// Prefix normalizer for serverless environments (handles both /api/path and rewritten /path)
app.use((req, res, next) => {
  if (!req.url.startsWith('/api') && !req.url.startsWith('/static') && !req.url.startsWith('/_')) {
    req.url = '/api' + req.url;
  }
  next();
});

// Serverless DB readiness check: ensures DB connection is established before processing database endpoints
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api') && req.path !== '/api/health') {
    if (!isDbConnected()) {
      await connectDb();
    }
  }
  next();
});

// Request logger (ensuring NO sensitive keys, passwords, or credentials are logged)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${Date.now() - start}ms)`);
  });
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Saathi Backend API',
    geminiConfigured: isGeminiConfigured(),
    groundingEnabled: isGeminiConfigured(),
    databaseConnected: isDbConnected(),
    timestamp: new Date().toISOString()
  });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Protected user data routes
app.use('/api/cases', casesRoutes);
app.use('/api/earnings', earningsRoutes);

/**
 * POST /api/assistant/complaint
 * Body: { problemDescription, category, platform, relevantDates, expectedAmount, receivedAmount, explanationProvided, desiredResolution, language }
 */
app.post('/api/assistant/complaint', async (req, res) => {
  try {
    const {
      problemDescription,
      category,
      platform,
      relevantDates,
      expectedAmount,
      receivedAmount,
      explanationProvided,
      desiredResolution,
      language
    } = req.body;

    if (!problemDescription || typeof problemDescription !== 'string' || problemDescription.trim().length === 0) {
      return res.status(400).json({
        error: 'Problem description is required.'
      });
    }

    // Sanitize script and HTML tags
    let sanitizedDesc = problemDescription.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .trim();

    // Defamatory accusation / injection filter
    sanitizedDesc = sanitizedDesc.replace(/\b(arrested for (theft|fraud)|is a (thief|criminal))\b/gi, '[Allegation without verified evidence]');

    // Safety check: warn if worker included OTP, PIN, CVV or password patterns
    const otpPattern = /\b(otp|pin|cvv|password)\b\s*(is|are|[:=-])?\s*\d{3,8}\b/i;
    if (otpPattern.test(sanitizedDesc)) {
      return res.status(400).json({
        error: 'Security Warning: Please remove sensitive PIN, OTP, CVV, or password numbers from your text before proceeding.'
      });
    }

    const result = await draftComplaint({
      problemDescription: sanitizedDesc,
      category: category ? String(category).trim() : 'Other',
      platform: platform ? String(platform).trim() : '',
      relevantDates: relevantDates ? String(relevantDates).trim() : '',
      expectedAmount: expectedAmount ? String(expectedAmount).trim() : '',
      receivedAmount: receivedAmount ? String(receivedAmount).trim() : '',
      explanationProvided: explanationProvided ? String(explanationProvided).trim() : '',
      desiredResolution: desiredResolution ? String(desiredResolution).trim() : '',
      language: ['en', 'hi', 'pa'].includes(language) ? language : 'en'
    });

    res.json(result);
  } catch (err) {
    console.error('Complaint endpoint error:', err);
    res.status(500).json({
      error: 'An error occurred while drafting the complaint. Please try again.'
    });
  }
});

/**
 * POST /api/schemes/search
 * Body: { query, language }
 */
app.post('/api/schemes/search', async (req, res) => {
  try {
    const { query, language } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        error: 'A search query or description of your situation is required.'
      });
    }

    const result = await searchSchemes({
      query: query.trim(),
      language: ['en', 'hi', 'pa'].includes(language) ? language : 'en'
    });

    res.json(result);
  } catch (err) {
    console.error('Scheme search endpoint error:', err);
    res.status(500).json({
      error: 'Unable to complete scheme search. Please try again or check official portals.'
    });
  }
});

/**
 * POST /api/assistant/explain-source
 * Body: { schemeName, officialUrl, context, language }
 */
app.post('/api/assistant/explain-source', async (req, res) => {
  try {
    const { schemeName, officialUrl, context, language } = req.body;

    if (!schemeName || !officialUrl) {
      return res.status(400).json({
        error: 'Scheme name and official URL are required.'
      });
    }

    const result = await explainSource({
      schemeName: String(schemeName).trim(),
      officialUrl: String(officialUrl).trim(),
      context: context ? String(context).trim() : '',
      language: ['en', 'hi', 'pa'].includes(language) ? language : 'en'
    });

    res.json(result);
  } catch (err) {
    console.error('Explain source endpoint error:', err);
    res.status(500).json({
      error: 'Unable to explain source at this moment.'
    });
  }
});

// Safe global error handler (never exposes stack traces or secrets in production)
app.use((err, req, res, next) => {
  if (err && err.message === 'CORS: Origin not allowed') {
    return res.status(403).json({ error: 'Origin not allowed by CORS policy.' });
  }
  console.error('[Unhandled Error]', err.message || err);
  const isProd = process.env.NODE_ENV === 'production';
  res.status(500).json({
    error: isProd ? 'An internal server error occurred.' : (err.message || 'Internal Server Error')
  });
});

export default app;
