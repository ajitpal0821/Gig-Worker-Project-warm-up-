/**
 * Centralized API endpoint configuration for Saathi.
 *
 * In production (Vercel deployment) and same-origin environments, uses relative URLs (`/api`).
 * In local standalone development server (`localhost:4200`), routes to `http://localhost:3000/api`.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location) {
    // If running in development on port 4200 (direct ng serve without proxy)
    if (window.location.hostname === 'localhost' && window.location.port === '4200') {
      return 'http://localhost:3000/api';
    }
  }
  // Same-origin relative URLs for production on Vercel or proxied environments
  return '/api';
}

export const API_BASE = getApiBaseUrl();
