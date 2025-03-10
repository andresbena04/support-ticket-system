import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { inject } from '@angular/core';

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService)

  // Obtener el rol requerido desde los datos de la ruta
  const requiredRoles: string[] = route.data['roles'] || [];

  // Verificar si el usuario tiene el rol requerido
  if (!authService.hasRole(requiredRoles)) {
    router.navigate(['/unauthorized']); 
    return false;
  }

  return true;
};

