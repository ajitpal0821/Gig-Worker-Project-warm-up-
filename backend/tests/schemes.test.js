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

describe('Government Schemes & Official Document Discovery Tests', () => {
  it('should find relevant welfare schemes for delivery partners and gig workers', async () => {
    const res = await request('POST', '/api/schemes/search', {
      query: 'I am a delivery partner. Which government benefits should I investigate?',
      language: 'en'
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.results.length > 0, 'Results should be returned');

    // Assert official source links
    for (const scheme of res.body.data.results) {
      assert.ok(scheme.schemeName, 'Scheme name must be present');
      assert.ok(scheme.officialUrl, 'Official URL must be present');
      assert.ok(
        scheme.officialUrl.includes('gov.in') || scheme.officialUrl.includes('nic.in') || scheme.officialUrl.includes('maandhan.in'),
        `Scheme URL (${scheme.officialUrl}) must point to an official government domain`
      );
      assert.ok(scheme.keyEligibility?.length > 0, 'Key eligibility must be provided');
      assert.ok(scheme.verificationChecklist?.length > 0, 'Verification checklist must be provided');

      // Assert honest result state
      assert.ok(
        ['Potentially relevant', 'Official verification required', 'More information needed', 'No reliable match found'].includes(scheme.resultState),
        `Result state must be an honest state, got: ${scheme.resultState}`
      );
    }
  });

  it('should clearly label fallbacks as "Live search unavailable — browse official portals"', async () => {
    // When GEMINI_API_KEY is not configured or in fallback mode
    const res = await request('POST', '/api/schemes/search', {
      query: 'pension scheme for informal workers',
      language: 'en'
    });

    assert.strictEqual(res.status, 200);
    if (!res.body.isLiveSearch) {
      assert.strictEqual(res.body.statusMessage, 'Live search unavailable — browse official portals.');
      assert.ok(!res.body.statusMessage.includes('completed live search'), 'Must never claim offline fallback is a completed live search');
    }
  });

  it('should REJECT empty search queries with HTTP 400', async () => {
    const res = await request('POST', '/api/schemes/search', {
      query: '   ',
      language: 'en'
    });

    assert.strictEqual(res.status, 400);
    assert.ok(res.body.error, 'Must return error message for empty search query');
  });

  it('should provide localized responses in Hindi (हिंदी)', async () => {
    const res = await request('POST', '/api/schemes/search', {
      query: 'ई-श्रम पंजीकरण और सामाजिक सुरक्षा',
      language: 'hi'
    });

    assert.strictEqual(res.status, 200);
    assert.ok(res.body.data.summary.includes('पोर्टल') || res.body.data.summary.includes('योजना') || res.body.data.summary.includes('कामगार'), 'Summary should be localized in Hindi');
  });

  it('should test explain-source endpoint with honest verification checklist', async () => {
    const res = await request('POST', '/api/assistant/explain-source', {
      schemeName: 'e-Shram Portal',
      officialUrl: 'https://eshram.gov.in/Schemes',
      language: 'en'
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.checklist?.length > 0 || res.body.data?.verificationChecklist?.length > 0, 'Checklist must be provided');
  });

  it('should REJECT explain-source if schemeName or officialUrl is missing', async () => {
    const res = await request('POST', '/api/assistant/explain-source', {
      schemeName: '',
      officialUrl: ''
    });

    assert.strictEqual(res.status, 400);
    assert.ok(res.body.error);
  });
});
