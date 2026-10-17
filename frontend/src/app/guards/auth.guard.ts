import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';

/**
 * Protects routes requiring authentication (e.g. My Cases, Earnings).
 * Redirects unauthenticated workers to /login.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.initialized()) {
    if (authService.isAuthenticated()) {
      return true;
    }
    return router.createUrlTree(['/login']);
  }

  return authService.checkSession().pipe(
    map(() => {
      if (authService.isAuthenticated()) {
        return true;
      }
      return router.createUrlTree(['/login']);
    })
  );
};

/**
 * Redirects already authenticated workers away from /login and /signup back to dashboard.
 */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.initialized()) {
    if (authService.isAuthenticated()) {
      return router.createUrlTree(['/']);
    }
    return true;
  }

  return authService.checkSession().pipe(
    map(() => {
      if (authService.isAuthenticated()) {
        return router.createUrlTree(['/']);
      }
      return true;
    })
  );
};
