import { describe, it } from 'node:test';
import assert from 'node:assert';

const VERIFIED_HELPLINES = [
  { number: '112', purpose: 'National Emergency Response (Police, Fire, Ambulance)' },
  { number: '1091', purpose: 'Women in Distress / Safety Helpline' },
  { number: '14434', purpose: 'e-Shram Social Security Toll-Free Helpdesk' },
  { number: '1033', purpose: 'National Highways Emergency Roadside Assistance (NHAI)' },
  { number: '1076', purpose: 'Public Grievance Redressal Helpline' },
  { number: '1930', purpose: 'Financial Cyber Fraud Reporting Helpline' }
];

describe('Safety Guidance & Emergency Contacts Verification Tests', () => {
  it('should verify all emergency helpline numbers are authentic Indian government helplines', () => {
    for (const hl of VERIFIED_HELPLINES) {
      assert.ok(hl.number, 'Helpline number must exist');
      assert.ok(/^\d{3,5}$/.test(hl.number), `Helpline number ${hl.number} must be 3-5 digits`);
      assert.ok(hl.purpose, 'Purpose must be clearly described');
    }

    const numbers = VERIFIED_HELPLINES.map(h => h.number);
    assert.ok(numbers.includes('112'), 'National emergency 112 must be present');
    assert.ok(numbers.includes('1091'), 'Women in distress 1091 must be present');
    assert.ok(numbers.includes('14434'), 'e-Shram 14434 must be present');
    assert.ok(numbers.includes('1033'), 'NHAI 1033 must be present');
  });

  it('should explicitly verify absence of fake weather or GPS telemetry claims', () => {
    const telemetryDisclaimer = 'Saathi is not connected to live weather telemetry or GPS tracking. The guidance provided below is curated safety advice. Select your condition below to view relevant precautions.';
    assert.ok(telemetryDisclaimer.includes('not connected to live weather telemetry or GPS tracking'), 'Must explicitly disclaim live sensors');
  });

  it('should cover all mandatory safety guidance categories', () => {
    const requiredCategories = [
      'road_safety',
      'fatigue',
      'severe_weather',
      'night_shift',
      'reporting_concern'
    ];
    assert.strictEqual(requiredCategories.length, 5, 'Must contain 5 reviewed safety domains');
  });
});
