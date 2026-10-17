import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';

class MockStorageService {
  constructor() {
    this.store = new Map();
  }

  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }

  setItem(key, value) {
    this.store.set(key, String(value));
  }

  removeItem(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }

  getCases() {
    try {
      const data = this.getItem('saathi_cases_v1');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveCase(newCase) {
    const cases = this.getCases();
    const idx = cases.findIndex(c => c.id === newCase.id);
    let updated;
    if (idx >= 0) {
      updated = [...cases];
      updated[idx] = newCase;
    } else {
      updated = [newCase, ...cases];
    }
    this.setItem('saathi_cases_v1', JSON.stringify(updated));
    return updated;
  }

  deleteCase(id) {
    const cases = this.getCases().filter(c => c.id !== id);
    this.setItem('saathi_cases_v1', JSON.stringify(cases));
    return cases;
  }

  clearAllData() {
    this.removeItem('saathi_cases_v1');
    this.removeItem('saathi_earnings_v1');
  }
}

describe('StorageService & Privacy Data Management Tests', () => {
  let storage;

  beforeEach(() => {
    storage = new MockStorageService();
  });

  it('should save a new local case and retrieve it by Reference ID', () => {
    const demoCase = {
      id: 'STH-2026-4091',
      category: 'unexpected_deduction',
      platform: 'Zomato',
      subject: 'Formal Grievance: unexpected_deduction - [Zomato]',
      complaintDraft: 'Dear Sir, I request a review of the ₹450 deduction.',
      language: 'en',
      createdAt: new Date().toISOString(),
      status: 'Saved',
      providedFacts: ['Platform: Zomato', 'Amount: ₹450'],
      missingDetails: [],
      recommendedNextSteps: []
    };

    storage.saveCase(demoCase);
    const retrieved = storage.getCases();
    assert.strictEqual(retrieved.length, 1);
    assert.strictEqual(retrieved[0].id, 'STH-2026-4091');
    assert.strictEqual(retrieved[0].status, 'Saved');
  });

  it('should update existing case status (e.g. from Saved to Resolved)', () => {
    const demoCase = {
      id: 'STH-2026-4091',
      category: 'unexpected_deduction',
      platform: 'Zomato',
      status: 'Saved'
    };
    storage.saveCase(demoCase);

    demoCase.status = 'Resolved';
    storage.saveCase(demoCase);

    const retrieved = storage.getCases();
    assert.strictEqual(retrieved.length, 1);
    assert.strictEqual(retrieved[0].status, 'Resolved');
  });

  it('should delete an individual case by ID', () => {
    storage.saveCase({ id: 'CASE-1', platform: 'Swiggy' });
    storage.saveCase({ id: 'CASE-2', platform: 'Zomato' });

    assert.strictEqual(storage.getCases().length, 2);
    storage.deleteCase('CASE-1');
    const remaining = storage.getCases();
    assert.strictEqual(remaining.length, 1);
    assert.strictEqual(remaining[0].id, 'CASE-2');
  });

  it('should clear all data on request for worker privacy', () => {
    storage.saveCase({ id: 'CASE-1', platform: 'Swiggy' });
    storage.setItem('saathi_earnings_v1', JSON.stringify([{ id: 'ERN-1' }]));

    assert.ok(storage.getItem('saathi_cases_v1'));
    assert.ok(storage.getItem('saathi_earnings_v1'));

    storage.clearAllData();

    assert.strictEqual(storage.getItem('saathi_cases_v1'), null);
    assert.strictEqual(storage.getItem('saathi_earnings_v1'), null);
    assert.strictEqual(storage.getCases().length, 0);
  });

  it('should gracefully handle corrupted JSON in localStorage without crashing', () => {
    storage.setItem('saathi_cases_v1', 'corrupted-{{json]]');
    const cases = storage.getCases();
    assert.deepStrictEqual(cases, [], 'Corrupted storage must return empty array instead of throwing');
  });
});
