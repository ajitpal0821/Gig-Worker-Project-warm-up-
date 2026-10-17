import express from 'express';
import { Case } from '../models/case.model.js';
import { requireAuth, csrfProtection } from '../auth.js';
import { isDbConnected } from '../db.js';

const router = express.Router();

// Require authentication and CSRF protection for all case routes
router.use(requireAuth);

/**
 * GET /api/cases
 * List all cases owned by the authenticated user
 */
router.get('/', async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ error: 'Database service is temporarily unavailable.' });
    }

    // Strictly scoped to authenticated user ID (D2, D3, D11)
    const cases = await Case.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    return res.json({
      success: true,
      cases: cases.map(c => c.toJSON())
    });
  } catch (error) {
    console.error('[Cases Error] List failure:', error.message);
    return res.status(500).json({ error: 'Failed to retrieve cases.' });
  }
});

/**
 * POST /api/cases
 * Create or save a case for the authenticated user
 */
router.post('/', csrfProtection, async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ error: 'Database service is temporarily unavailable.' });
    }

    const body = req.body || {};
    const caseId = body.id || `STH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (!caseId || typeof caseId !== 'string') {
      return res.status(400).json({ error: 'Invalid case ID format.' });
    }

    // Prevent forged owner IDs (D7, D15): Always assign req.user.userId
    const caseData = {
      userId: req.user.userId,
      id: caseId.trim(),
      category: body.category || 'Other',
      platform: body.platform || '',
      subject: body.subject || '',
      complaintDraft: body.complaintDraft || '',
      complaintDraftEnglish: body.complaintDraftEnglish || '',
      language: ['en', 'hi', 'pa'].includes(body.language) ? body.language : 'en',
      status: ['Draft', 'Saved', 'Copied', 'Resolved'].includes(body.status) ? body.status : 'Saved',
      providedFacts: Array.isArray(body.providedFacts) ? body.providedFacts : [],
      missingDetails: Array.isArray(body.missingDetails) ? body.missingDetails : [],
      recommendedNextSteps: Array.isArray(body.recommendedNextSteps) ? body.recommendedNextSteps : []
    };

    // Upsert case owned by this user
    const savedCase = await Case.findOneAndUpdate(
      { userId: req.user.userId, id: caseData.id },
      { $set: caseData },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(201).json({
      success: true,
      case: savedCase.toJSON()
    });
  } catch (error) {
    console.error('[Cases Error] Create failure:', error.message);
    return res.status(500).json({ error: 'Failed to save case.' });
  }
});

/**
 * GET /api/cases/:id
 * Retrieve a single case by ID for the authenticated user
 */
router.get('/:id', async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ error: 'Database service is temporarily unavailable.' });
    }

    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid case ID parameter.' });
    }

    // Must match both the case id AND the authenticated user's ID (D4)
    const existing = await Case.findOne({ id: id.trim(), userId: req.user.userId });
    if (!existing) {
      return res.status(404).json({ error: 'Case not found or access denied.' });
    }

    return res.json({
      success: true,
      case: existing.toJSON()
    });
  } catch (error) {
    console.error('[Cases Error] Get failure:', error.message);
    return res.status(500).json({ error: 'Failed to fetch case.' });
  }
});

/**
 * PUT /api/cases/:id
 * Update status or fields of a case owned by the authenticated user
 */
router.put('/:id', csrfProtection, async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ error: 'Database service is temporarily unavailable.' });
    }

    const { id } = req.params;
    const body = req.body || {};

    // Validate ownership before update (D5)
    const existing = await Case.findOne({ id: id.trim(), userId: req.user.userId });
    if (!existing) {
      return res.status(404).json({ error: 'Case not found or access denied.' });
    }

    if (body.status && ['Draft', 'Saved', 'Copied', 'Resolved'].includes(body.status)) {
      existing.status = body.status;
    }
    if (body.subject) existing.subject = String(body.subject).trim();
    if (body.complaintDraft) existing.complaintDraft = String(body.complaintDraft).trim();

    await existing.save();

    return res.json({
      success: true,
      case: existing.toJSON()
    });
  } catch (error) {
    console.error('[Cases Error] Update failure:', error.message);
    return res.status(500).json({ error: 'Failed to update case.' });
  }
});

/**
 * DELETE /api/cases/:id
 * Delete a case owned by the authenticated user
 */
router.delete('/:id', csrfProtection, async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ error: 'Database service is temporarily unavailable.' });
    }

    const { id } = req.params;

    // Filter delete strictly by userId and id (D6, D12)
    const deleted = await Case.findOneAndDelete({ id: id.trim(), userId: req.user.userId });
    if (!deleted) {
      return res.status(404).json({ error: 'Case not found or access denied.' });
    }

    return res.json({
      success: true,
      message: 'Case deleted successfully.'
    });
  } catch (error) {
    console.error('[Cases Error] Delete failure:', error.message);
    return res.status(500).json({ error: 'Failed to delete case.' });
  }
});

export default router;
