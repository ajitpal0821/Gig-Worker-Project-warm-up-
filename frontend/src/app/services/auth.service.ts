import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, throwError } from 'rxjs';
import { User } from '../models/saathi.models';
import { API_BASE } from '../config/api.config';

const AUTH_API_BASE = `${API_BASE}/auth`;

const HTTP_OPTIONS = {
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'X-Saathi-Client': 'web'
  }
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  currentUser = signal<User | null>(null);
  loading = signal<boolean>(false);
  initialized = signal<boolean>(false);

  isAuthenticated = computed(() => !!this.currentUser());

  constructor() {
    this.checkSession().subscribe();
  }

  /**
   * Check current active session via HttpOnly cookie
   */
  checkSession(): Observable<{ success: boolean; user?: User } | null> {
    return this.http.get<{ success: boolean; user: User }>(`${AUTH_API_BASE}/me`, HTTP_OPTIONS).pipe(
      tap((res) => {
        if (res && res.user) {
          this.currentUser.set(res.user);
        } else {
          this.currentUser.set(null);
        }
        this.initialized.set(true);
      }),
      catchError(() => {
        this.currentUser.set(null);
        this.initialized.set(true);
        return of(null);
      })
    );
  }

  /**
   * Signup new worker account
   */
  signup(credentials: { username: string; password: string; confirmPassword?: string }): Observable<any> {
    this.loading.set(true);
    return this.http.post<{ success: boolean; message: string; user: User }>(
      `${AUTH_API_BASE}/signup`,
      credentials,
      HTTP_OPTIONS
    ).pipe(
      tap((res) => {
        this.loading.set(false);
        if (res && res.user) {
          this.currentUser.set(res.user);
        }
      }),
      catchError((err: HttpErrorResponse) => {
        this.loading.set(false);
        const errorMsg = err.error?.error || 'Registration failed. Please check your information and try again.';
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  /**
   * Log into existing account
   */
  login(credentials: { username: string; password: string }): Observable<any> {
    this.loading.set(true);
    return this.http.post<{ success: boolean; message: string; user: User }>(
      `${AUTH_API_BASE}/login`,
      credentials,
      HTTP_OPTIONS
    ).pipe(
      tap((res) => {
        this.loading.set(false);
        if (res && res.user) {
          this.currentUser.set(res.user);
        }
      }),
      catchError((err: HttpErrorResponse) => {
        this.loading.set(false);
        const errorMsg = err.error?.error || 'Login failed. Please verify your username and password.';
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  /**
   * Log out of current session
   */
  logout(): Observable<any> {
    this.loading.set(true);
    try {
      localStorage.removeItem('saathi_cases_v1');
      localStorage.removeItem('saathi_earnings_v1');
    } catch {}
    return this.http.post<{ success: boolean }>(`${AUTH_API_BASE}/logout`, {}, HTTP_OPTIONS).pipe(
      tap(() => {
        this.currentUser.set(null);
        this.loading.set(false);
        this.router.navigate(['/login']);
      }),
      catchError(() => {
        // Even if server is unreachable, clear client state
        this.currentUser.set(null);
        this.loading.set(false);
        this.router.navigate(['/login']);
        return of({ success: true });
      })
    );
  }
}
