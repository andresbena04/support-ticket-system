import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { AlertsService } from '../alerts.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const alertSercive = inject(AlertsService);
  
  let authReq = req;
  const token = authService.getAccessToken();  // Obtiene el token almacenado


  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        if (error.error?.message === 'El token ha expirado' || error.error?.message === 'Token inválido o expirado') {
          alertSercive.showSessionExpiredAlert()
          authService.logout();  
          return throwError(() => new Error('Token expirado o inválido'));
        }

        if (error.error?.message === 'Token no proporcionado') {
          alertSercive.showSessionExpiredAlert('No se encontró un token. Inicia sesión para continuar.')
          return throwError(() => new Error('Token no proporcionado'));
        }
      }

      if (error.error?.message === 'El usuario ya existe') {
        return throwError(() => new Error('El usuario ya se encuentra registrado'));
      }
      if (error.status === 403) {
        alertSercive.showNoPermissionAlert()
        return throwError(() => new Error('Acceso denegado'));
      }

      return throwError(() => error);
    })
  );
};