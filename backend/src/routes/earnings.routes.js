import express from 'express';
import { Earnings } from '../models/earnings.model.js';
import { requireAuth, csrfProtection } from '../auth.js';
import { isDbConnected } from '../db.js';

const router = express.Router();

// Require authentication for all earnings routes (D10)
router.use(requireAuth);

/**
 * GET /api/earnings
 * List all earnings records belonging to authenticated user
 */
router.get('/', async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ error: 'Database service is temporarily unavailable.' });
    }

    // Scoped strictly to authenticated user (D8, D11)
    const records = await Earnings.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    return res.json({
      success: true,
      earnings: records.map(r => r.toJSON())
    });
  } catch (error) {
    console.error('[Earnings Error] List failure:', error.message);
    return res.status(500).json({ error: 'Failed to retrieve earnings records.' });
  }
});

/**
 * POST /api/earnings
 * Create a new earnings record for authenticated user
 */
router.post('/', csrfProtection, async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ error: 'Database service is temporarily unavailable.' });
    }

    const body = req.body || {};
    const id = body.id || `ERN-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid record ID format.' });
    }

    const grossEarnings = Number(body.grossEarnings) || 0;
    const platformDeductions = Number(body.platformDeductions) || 0;
    const workExpenses = Number(body.workExpenses) || 0;
    const calculatedNet = Number(body.calculatedNet ?? (grossEarnings - platformDeductions - workExpenses));

    // Force owner to authenticated user (D7, D15)
    const record = await Earnings.findOneAndUpdate(
      { userId: req.user.userId, id: id.trim() },
      {
        $set: {
          userId: req.user.userId,
          id: id.trim(),
          periodOrDate: body.periodOrDate || new Date().toISOString().split('T')[0],
          platform: body.platform || '',
          grossEarnings,
          platformDeductions,
          workExpenses,
          reportedPayout: body.reportedPayout !== undefined ? Number(body.reportedPayout) : null,
          calculatedNet,
          reconciliationNotes: body.reconciliationNotes || '',
          notes: body.notes || ''
        }
      },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(201).json({
      success: true,
      earning: record.toJSON()
    });
  } catch (error) {
    console.error('[Earnings Error] Create failure:', error.message);
    return res.status(500).json({ error: 'Failed to save earnings record.' });
  }
});

/**
 * PUT /api/earnings/:id
 * Update an earnings record owned by the authenticated user
 */
router.put('/:id', csrfProtection, async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ error: 'Database service is temporarily unavailable.' });
    }

    const { id } = req.params;
    const body = req.body || {};

    // Validate ownership before update (D9)
    const existing = await Earnings.findOne({ id: id.trim(), userId: req.user.userId });
    if (!existing) {
      return res.status(404).json({ error: 'Earnings record not found or access denied.' });
    }

    if (body.periodOrDate) existing.periodOrDate = body.periodOrDate;
    if (body.platform !== undefined) existing.platform = body.platform;
    if (body.grossEarnings !== undefined) existing.grossEarnings = Number(body.grossEarnings);
    if (body.platformDeductions !== undefined) existing.platformDeductions = Number(body.platformDeductions);
    if (body.workExpenses !== undefined) existing.workExpenses = Number(body.workExpenses);
    if (body.calculatedNet !== undefined) existing.calculatedNet = Number(body.calculatedNet);
    if (body.notes !== undefined) existing.notes = body.notes;

    await existing.save();

    return res.json({
      success: true,
      earning: existing.toJSON()
    });
  } catch (error) {
    console.error('[Earnings Error] Update failure:', error.message);
    return res.status(500).json({ error: 'Failed to update earnings record.' });
  }
});

/**
 * DELETE /api/earnings/:id
 * Delete an earnings record owned by the authenticated user
 */
router.delete('/:id', csrfProtection, async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ error: 'Database service is temporarily unavailable.' });
    }

    const { id } = req.params;

    // Filter delete strictly by userId and id (D9, D12)
    const deleted = await Earnings.findOneAndDelete({ id: id.trim(), userId: req.user.userId });
    if (!deleted) {
      return res.status(404).json({ error: 'Earnings record not found or access denied.' });
    }

    return res.json({
      success: true,
      message: 'Earnings record deleted successfully.'
    });
  } catch (error) {
    console.error('[Earnings Error] Delete failure:', error.message);
    return res.status(500).json({ error: 'Failed to delete earnings record.' });
  }
});

export default router;
