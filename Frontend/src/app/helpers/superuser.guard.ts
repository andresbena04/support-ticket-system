import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { inject } from '@angular/core';

export const superUserGuard: CanActivateFn = (route, state) => {
  const router = inject(Router)
    const authService = inject(AuthService)
  
    if(!authService.isSuperAdmin()){
      router.navigate(['/unauthorized']);
      return false;
    }
    return true
};
