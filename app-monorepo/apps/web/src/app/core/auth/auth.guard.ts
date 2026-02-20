import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../api/auth.service';

export const authGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) {
    return true;
  }
  router.navigate(['/signin']);
  return false;
};

export const guestGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated()) {
    return true;
  }
  router.navigate(['/dashboard']);
  return false;
};
