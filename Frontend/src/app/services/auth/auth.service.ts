import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';
import { environment } from '../../environments/environment.prod';
import { user, users } from '../../models/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl = environment.apiUrl;
  private readonly headers = new HttpHeaders({
    Accept: 'application/json',
    'Content-Type': 'application/json'
  });

  constructor(private http: HttpClient, private router: Router) { }

  /** Autenticación **/
  getToken(dataUser: user): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/signin`, dataUser, { headers: this.headers });
  }

  refreshToken(): Observable<any> {
    const refreshToken = sessionStorage.getItem('refresh_token');
    if (!refreshToken) return of(null);

    return this.http.post(`${this.apiUrl}/auth/refresh-token`, { refresh_token: refreshToken }, { headers: this.headers });
  }

  // Obtiene el token de acceso del almacenamiento local
  getAccessToken(): string | null {
    return sessionStorage.getItem('access_token');
  }
  isLoggedIn(): boolean {
    return !!sessionStorage.getItem('access_token');
  }

  logout(): void {
    sessionStorage.clear();
    this.router.navigateByUrl('/login');
  }
  // Verifica si el usuario tiene uno de los roles especificados
  hasRole(roles: string[]): boolean {
    const userRole = sessionStorage.getItem('role');
    return roles.includes(userRole || '');
  }
  // Función para obtener el rol super usuario
  isSuperAdmin(): boolean {
    return !!sessionStorage.getItem('isSuperUser');
  }
  isAdmin(): boolean {
    const role = sessionStorage.getItem('role');
    return role === 'ADMIN';
  }
  /** Gestión de Usuarios **/
  createNewUser(dataUser: users): Observable<any> {
    return this.fetch('/auth/signup', 'POST', dataUser);
  }

  importUsers(file: FormData): Observable<any> {
    return this.http.post(`/auth/import-users`, file, { headers: this.getHeadersWithFile() });
  }

  // Cambio de contraseña estando logueado
  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    const body = { oldPassword, newPassword };
    return this.fetch(`/auth/change-password`, 'PUT', body);
  }

  // Solicita el restablecimiento de contraseña desde form login
  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`/auth/password-reset/request`, { email }, { headers: this.headers });
  }
  // Confirma el restablecimiento de contraseña
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`/auth/password-reset/confirm`, { token, newPassword }, { headers: this.headers });
  }
  /** Utilidades **/
  private getHeadersWithFile(): HttpHeaders {
    const token = sessionStorage.getItem('access_token');
    const headersConfig: { [key: string]: string } = {};
    if (token) {
      headersConfig['Authorization'] = `Bearer ${token}`;
    }
    return new HttpHeaders(headersConfig);
  }

  private getHeaders(token?: string): HttpHeaders {
    const headersConfig: { [key: string]: string } = { Accept: 'application/json' };
    if (token) {
      headersConfig['Authorization'] = `Bearer ${token}`;
    }
    return new HttpHeaders(headersConfig);
  }
  /** Manejador de solicitudes **/
  private fetch<T>(endpoint: string, method: 'GET' | 'POST' | 'PUT', body?: any): Observable<T> {
    const token = sessionStorage.getItem('access_token');

    if ((method === 'POST' || method === 'PUT') && !token) {
      return throwError(() => new Error('Token de autenticación no disponible'));
    }

    const headers = this.getHeaders(token ?? undefined);
    const request = method === 'GET'
      ? this.http.get<T>(`${this.apiUrl}${endpoint}`, { headers })
      : method === 'PUT'
        ? this.http.put<T>(`${this.apiUrl}${endpoint}`, body, { headers })
        : this.http.post<T>(`${this.apiUrl}${endpoint}`, body, { headers });

    return request.pipe(catchError(error => this.handleError(error, endpoint, method, body)));
  }

  private handleError(error: any, endpoint: string, method: 'GET' | 'POST' | 'PUT', body?: any): Observable<any> {
    if (error.status === 401) {
      return this.refreshToken().pipe(
        switchMap((response) => {
          const newToken = response?.accessToken;
          if (!newToken) {
            return throwError(() => new Error('No se pudo refrescar el token'));
          }

          sessionStorage.setItem('access_token', newToken);
          return this.retryRequest(newToken, endpoint, method, body);
        })
      );
    }

    return throwError(() => error);
  }

  private retryRequest<T>(newToken: string, endpoint: string, method: 'GET' | 'POST' | 'PUT', body?: any): Observable<T> {
    const headers = this.getHeaders(newToken);
    return method === 'GET'
      ? this.http.get<T>(`${this.apiUrl}${endpoint}`, { headers })
      : method === 'PUT'
        ? this.http.put<T>(`${this.apiUrl}${endpoint}`, body, { headers })
        : this.http.post<T>(`${this.apiUrl}${endpoint}`, body, { headers });
  }
}
