import { describe, it } from 'node:test';
import assert from 'node:assert';

function isInputValid(period, platform, gross) {
  const g = Number(gross);
  return Boolean(
    period && period.trim() &&
    platform && platform.trim() &&
    !isNaN(g) &&
    g > 0
  );
}

function calculateNetEarnings(gross, deductions, expenses) {
  const g = typeof gross === 'number' && !isNaN(gross) ? gross : 0;
  const d = typeof deductions === 'number' && !isNaN(deductions) ? deductions : 0;
  const e = typeof expenses === 'number' && !isNaN(expenses) ? expenses : 0;
  return Number((g - d - e).toFixed(2));
}

function reconcilePayout(gross, deductions, payout) {
  const g = typeof gross === 'number' && !isNaN(gross) ? Math.max(0, gross) : 0;
  const d = typeof deductions === 'number' && !isNaN(deductions) ? Math.max(0, deductions) : 0;
  const p = typeof payout === 'number' && !isNaN(payout) ? Math.max(0, payout) : 0;
  const expectedTransfer = Number((g - d).toFixed(2));
  const diff = Number((expectedTransfer - p).toFixed(2));

  if (Math.abs(diff) < 0.01) {
    return {
      status: 'MATCH',
      message: 'Actual bank transfer matches Gross minus entered Platform Deductions exactly.'
    };
  } else if (diff > 0) {
    return {
      status: 'LOWER',
      difference: diff,
      message: `Actual bank transfer is ₹${diff.toFixed(2)} lower than expected (Gross - entered deductions). Check if unentered adjustments or withheld tips apply.`
    };
  } else {
    return {
      status: 'HIGHER',
      difference: Math.abs(diff),
      message: `Actual bank transfer is ₹${Math.abs(diff).toFixed(2)} higher than expected (e.g. added tips or previous adjustment).`
    };
  }
}

describe('Worker Earnings Deterministic Calculations & Safety Audit', () => {
  it('should calculate net earnings deterministically without AI invention', () => {
    const gross = 8500;
    const deductions = 750;
    const expenses = 1800;
    const net = calculateNetEarnings(gross, deductions, expenses);
    assert.strictEqual(net, 5950, '8500 - 750 - 1800 must equal exactly 5950');
  });

  it('should handle decimal precision correctly without floating point errors', () => {
    const gross = 8500.50;
    const deductions = 750.25;
    const expenses = 1800.10;
    const net = calculateNetEarnings(gross, deductions, expenses);
    assert.strictEqual(net, 5950.15, '8500.50 - 750.25 - 1800.10 must equal 5950.15');
  });

  it('should reject invalid, zero, or negative gross earnings in form validation', () => {
    assert.strictEqual(isInputValid('10-16 Oct', 'Zomato', -500), false, 'Negative gross must be rejected');
    assert.strictEqual(isInputValid('10-16 Oct', 'Zomato', 0), false, 'Zero gross must be rejected');
    assert.strictEqual(isInputValid('10-16 Oct', 'Zomato', NaN), false, 'NaN must be rejected');
    assert.strictEqual(isInputValid('10-16 Oct', '', 5000), false, 'Empty platform must be rejected');
    assert.strictEqual(isInputValid('', 'Zomato', 5000), false, 'Empty period must be rejected');
    assert.strictEqual(isInputValid('10-16 Oct', 'Zomato', 5000), true, 'Valid fields must be accepted');
  });

  it('should allow realistic negative net when expenses exceed earnings (shift loss)', () => {
    const gross = 1000;
    const deductions = 200;
    const expenses = 1500; // e.g. severe vehicle puncture/repair
    const net = calculateNetEarnings(gross, deductions, expenses);
    assert.strictEqual(net, -700, 'Net loss must be mathematically preserved rather than masked');
  });

  it('should reconcile matching actual payout without double deductions', () => {
    const gross = 8500;
    const deductions = 750;
    const reportedPayout = 7750; // Bank payout already reflects the 750 deduction

    const recon = reconcilePayout(gross, deductions, reportedPayout);
    assert.strictEqual(recon.status, 'MATCH');
    assert.ok(recon.message.includes('matches Gross minus entered Platform Deductions'));
  });

  it('should flag discrepancy when reported payout is lower without accusing fraud', () => {
    const gross = 8500;
    const deductions = 750;
    const reportedPayout = 7250; // ₹500 lower than expected

    const recon = reconcilePayout(gross, deductions, reportedPayout);
    assert.strictEqual(recon.status, 'LOWER');
    assert.strictEqual(recon.difference, 500);

    // Verify non-defamatory phrasing
    assert.ok(!recon.message.toLowerCase().includes('fraud'));
    assert.ok(!recon.message.toLowerCase().includes('cheated'));
    assert.ok(!recon.message.toLowerCase().includes('stolen'));
    assert.ok(recon.message.includes('Check if unentered adjustments or withheld tips apply'));
  });

  it('should handle higher payout with neutral explanation (e.g. tips or arrears)', () => {
    const gross = 8500;
    const deductions = 750;
    const reportedPayout = 8000; // ₹250 higher (customer cash tips added)

    const recon = reconcilePayout(gross, deductions, reportedPayout);
    assert.strictEqual(recon.status, 'HIGHER');
    assert.strictEqual(recon.difference, 250);
    assert.ok(recon.message.includes('higher than expected'));
  });
});
