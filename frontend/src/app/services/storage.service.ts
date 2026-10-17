import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LocalCase, EarningsRecord } from '../models/saathi.models';

const CASES_STORAGE_KEY = 'saathi_cases_v1';
const EARNINGS_STORAGE_KEY = 'saathi_earnings_v1';
const API_BASE = 'http://localhost:3000/api';

const HTTP_OPTS = {
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'X-Saathi-Client': 'web'
  }
};

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private http = inject(HttpClient);

  cases = signal<LocalCase[]>([]);
  earnings = signal<EarningsRecord[]>([]);

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Load stored records from localStorage and optionally sync from backend if authenticated
   */
  loadFromStorage(): void {
    try {
      const rawCases = localStorage.getItem(CASES_STORAGE_KEY);
      if (rawCases) {
        this.cases.set(JSON.parse(rawCases));
      }
    } catch (e) {
      console.warn('Could not read cases from localStorage', e);
      this.cases.set([]);
    }

    try {
      const rawEarnings = localStorage.getItem(EARNINGS_STORAGE_KEY);
      if (rawEarnings) {
        this.earnings.set(JSON.parse(rawEarnings));
      }
    } catch (e) {
      console.warn('Could not read earnings from localStorage', e);
      this.earnings.set([]);
    }
  }

  /**
   * Fetch authenticated user's isolated cases from MongoDB backend
   */
  syncCasesFromBackend(): void {
    this.http.get<{ success: boolean; cases: LocalCase[] }>(`${API_BASE}/cases`, HTTP_OPTS).subscribe({
      next: (res) => {
        if (res && res.cases) {
          this.cases.set(res.cases);
          try {
            localStorage.setItem(CASES_STORAGE_KEY, JSON.stringify(res.cases));
          } catch {}
        }
      },
      error: () => {
        // Fall back to local data if unauthenticated or offline
      }
    });
  }

  /**
   * Fetch authenticated user's isolated earnings from MongoDB backend
   */
  syncEarningsFromBackend(): void {
    this.http.get<{ success: boolean; earnings: EarningsRecord[] }>(`${API_BASE}/earnings`, HTTP_OPTS).subscribe({
      next: (res) => {
        if (res && res.earnings) {
          this.earnings.set(res.earnings);
          try {
            localStorage.setItem(EARNINGS_STORAGE_KEY, JSON.stringify(res.earnings));
          } catch {}
        }
      },
      error: () => {
        // Fall back to local data
      }
    });
  }

  // --- CASES ---
  saveCase(newCase: LocalCase): void {
    const current = this.cases();
    const existingIndex = current.findIndex(c => c.id === newCase.id);
    let updated: LocalCase[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = newCase;
    } else {
      updated = [newCase, ...current];
    }
    this.cases.set(updated);
    try {
      localStorage.setItem(CASES_STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    // Persist to backend database if session is authenticated
    this.http.post(`${API_BASE}/cases`, newCase, HTTP_OPTS).subscribe({
      error: () => {
        // Kept in local state if offline or unauthenticated
      }
    });
  }

  deleteCase(id: string): void {
    const updated = this.cases().filter(c => c.id !== id);
    this.cases.set(updated);
    try {
      localStorage.setItem(CASES_STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    // Delete from backend database if authenticated
    this.http.delete(`${API_BASE}/cases/${id}`, HTTP_OPTS).subscribe({
      error: () => {}
    });
  }

  // --- EARNINGS ---
  saveEarnings(record: EarningsRecord): void {
    const current = this.earnings();
    const existingIndex = current.findIndex(e => e.id === record.id);
    let updated: EarningsRecord[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = record;
    } else {
      updated = [record, ...current];
    }
    this.earnings.set(updated);
    try {
      localStorage.setItem(EARNINGS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    // Persist to backend database if session is authenticated
    this.http.post(`${API_BASE}/earnings`, record, HTTP_OPTS).subscribe({
      error: () => {}
    });
  }

  deleteEarnings(id: string): void {
    const updated = this.earnings().filter(e => e.id !== id);
    this.earnings.set(updated);
    try {
      localStorage.setItem(EARNINGS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    // Delete from backend database if authenticated
    this.http.delete(`${API_BASE}/earnings/${id}`, HTTP_OPTS).subscribe({
      error: () => {}
    });
  }

  // --- CLEAR LOCAL DATA ---
  clearAllData(): void {
    try {
      localStorage.removeItem(CASES_STORAGE_KEY);
      localStorage.removeItem(EARNINGS_STORAGE_KEY);
    } catch {}
    this.cases.set([]);
    this.earnings.set([]);
  }
}
