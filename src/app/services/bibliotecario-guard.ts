import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from './auth';

export const bibliotecarioGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);
  if (!auth.tieneTokenValido()) return router.createUrlTree(['/login']);
  return auth.tieneRol('INSTRUCTOR') ? true : router.createUrlTree(['/home']);
};
