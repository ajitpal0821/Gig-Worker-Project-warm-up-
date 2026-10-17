import { describe, it } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';

function request(method, path, body, extraHeaders = {}) {
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
          'Content-Length': Buffer.byteLength(data),
          ...extraHeaders
        }
      },
      (res) => {
        let responseData = '';
        res.on('data', (chunk) => (responseData += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(responseData) });
          } catch {
            resolve({ status: res.statusCode, headers: res.headers, raw: responseData });
          }
        });
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

describe('Security, Privacy & API Protection Tests', () => {
  it('should NEVER leak Gemini API key in health check or any API response', async () => {
    const res = await request('GET', '/api/health');
    assert.strictEqual(res.status, 200);

    const bodyString = JSON.stringify(res.body);
    assert.ok(!bodyString.includes('AIzaSy'), 'Raw API key must never be exposed');
    assert.ok(!('apiKey' in res.body), 'apiKey property must not exist in response');
    assert.ok('geminiConfigured' in res.body, 'Only a safe boolean status should be exposed');
  });

  it('should sanitize script injection tags in user description', async () => {
    const maliciousPayload = '<script>alert("xss")</script> My payment was delayed.';
    const res = await request('POST', '/api/assistant/complaint', {
      problemDescription: maliciousPayload,
      category: 'missing_payment',
      platform: 'Swiggy',
      language: 'en'
    });

    assert.strictEqual(res.status, 200);
    // Draft must not execute script
    assert.ok(!res.body.data.complaintDraft.includes('<script>alert'), 'Script tags should not be evaluated as executable code');
  });

  it('should block multiple variations of OTP, PIN, and CVV leaks', async () => {
    const testCases = [
      'My OTP is 492019, please help.',
      'The support agent asked for my pin: 1234',
      'Here is the password: 994820 for my account',
      'The cvv is 892'
    ];

    for (const testText of testCases) {
      const res = await request('POST', '/api/assistant/complaint', {
        problemDescription: testText,
        category: 'other',
        language: 'en'
      });
      assert.strictEqual(res.status, 400, `Should reject suspicious pattern: "${testText}"`);
    }
  });

  it('should return CORS headers allowing frontend client origin', async () => {
    const res = await request('GET', '/api/health', null, { Origin: 'http://localhost:4200' });
    assert.strictEqual(res.headers['access-control-allow-origin'], 'http://localhost:4200', 'CORS headers must be present');
  });
});
