import http from 'http';

function testEndpoint(method, path, body) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        });
      }
    );

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting Saathi Backend API Verification Tests ---');

  // Test 1: Health Check
  try {
    const health = await testEndpoint('GET', '/api/health');
    console.log('✓ Health Endpoint:', health.status, health.body);
  } catch (e) {
    console.error('✗ Health Endpoint Failed:', e.message);
  }

  // Test 2: Complaint Drafting (Deterministic / AI)
  try {
    const complaint = await testEndpoint('POST', '/api/assistant/complaint', {
      problemDescription: 'My Friday night payout on Zomato is missing ₹450 incentive deduction.',
      category: 'unexpected_deduction',
      platform: 'Zomato',
      relevantDates: '14 Oct 2026',
      expectedAmount: '1200',
      receivedAmount: '750',
      language: 'hi'
    });
    console.log('✓ Complaint Drafting Endpoint:', complaint.status);
    console.log('  Subject:', complaint.body.data?.subject);
    console.log('  Facts identified:', complaint.body.data?.providedFacts);
  } catch (e) {
    console.error('✗ Complaint Drafting Failed:', e.message);
  }

  // Test 3: Schemes Search
  try {
    const schemes = await testEndpoint('POST', '/api/schemes/search', {
      query: 'I am a delivery partner. Which government benefits should I investigate?',
      language: 'en'
    });
    console.log('✓ Schemes Search Endpoint:', schemes.status);
    console.log('  Status Message:', schemes.body.statusMessage);
    console.log('  Results Count:', schemes.body.data?.results?.length);
    console.log('  Top Result URL:', schemes.body.data?.results?.[0]?.officialUrl);
  } catch (e) {
    console.error('✗ Schemes Search Failed:', e.message);
  }

  // Test 4: Explain Source
  try {
    const explain = await testEndpoint('POST', '/api/assistant/explain-source', {
      schemeName: 'e-Shram Portal',
      officialUrl: 'https://eshram.gov.in/Schemes',
      language: 'en'
    });
    console.log('✓ Explain Source Endpoint:', explain.status);
    console.log('  Checklist items:', explain.body.checklist?.length);
  } catch (e) {
    console.error('✗ Explain Source Failed:', e.message);
  }

  console.log('--- Verification Tests Finished ---');
  process.exit(0);
}

runTests();
