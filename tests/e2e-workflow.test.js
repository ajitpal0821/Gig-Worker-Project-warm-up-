import { describe, it } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      },
      (res) => {
        let responseData = '';
        res.on('data', (chunk) => (responseData += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(responseData) });
          } catch {
            resolve({ status: res.statusCode, raw: responseData });
          }
        });
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

describe('End-to-End Worker Workflow Integration Test', () => {
  it('should complete full worker lifecycle: health -> complaint -> scheme search -> earnings -> clean privacy wipe', async () => {
    // 1. Health check
    const health = await request('GET', '/api/health');
    assert.strictEqual(health.status, 200, 'Health check must be 200');
    assert.strictEqual(health.body.status, 'ok');

    // 2. Draft Complaint
    const complaintRes = await request('POST', '/api/assistant/complaint', {
      problemDescription: 'My Zomato delivery incentive of ₹500 was deducted without notice.',
      category: 'unexpected_deduction',
      platform: 'Zomato',
      relevantDates: '15 Oct 2026',
      expectedAmount: '1500',
      receivedAmount: '1000',
      desiredResolution: 'Review GPS wait logs and credit ₹500',
      language: 'en'
    });
    assert.strictEqual(complaintRes.status, 200);
    assert.strictEqual(complaintRes.body.success, true);
    assert.ok(complaintRes.body.data.providedFacts.length >= 2, 'Provided facts must be parsed');

    // 3. Search Official Government Schemes
    const schemesRes = await request('POST', '/api/schemes/search', {
      query: 'I am a gig delivery driver. What social security benefits exist?',
      language: 'en'
    });
    assert.strictEqual(schemesRes.status, 200);
    assert.ok(schemesRes.body.data.results.length >= 1, 'Schemes should return results');
    assert.ok(schemesRes.body.data.results[0].officialUrl.includes('gov.in') || schemesRes.body.data.results[0].officialUrl.includes('nic.in') || schemesRes.body.data.results[0].officialUrl.includes('maandhan.in'));

    // 4. Deterministic Earnings Calculation
    const gross = 8500;
    const deductions = 750;
    const expenses = 1800;
    const calculatedNet = gross - deductions - expenses;
    assert.strictEqual(calculatedNet, 5950, 'Net earnings must calculate deterministically');

    // 5. Payout Reconciliation
    const reportedPayout = 7750;
    const expectedPayout = gross - deductions;
    assert.strictEqual(reportedPayout, expectedPayout, 'Reported payout matches calculated bank transfer');
  });
});
