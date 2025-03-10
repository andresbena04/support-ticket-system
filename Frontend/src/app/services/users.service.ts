import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, switchMap, throwError, map } from 'rxjs';
import { AuthService } from './auth/auth.service';
import { users } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) { }

  // Método para configurar encabezados con token de autorizacióna
  private getHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  // Método genérico para hacer solicitudes con token
  private fetchWithToken<T>(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', body?: any): Observable<T> {
    const token = this.authService.getAccessToken(); // Obtiene el token desde AuthService
    if (!token) {
      return throwError(() => new Error('No se encontró el token de autenticación'));
    }

    const headers = this.getHeaders(token);

    let request$: Observable<T>;
    switch (method) {
      case 'GET':
        request$ = this.http.get<T>(`${this.apiUrl}${endpoint}`, { headers });
        break;
      case 'POST':
        request$ = this.http.post<T>(`${this.apiUrl}${endpoint}`, body, { headers });
        break;
      case 'PUT':
        request$ = this.http.put<T>(`${this.apiUrl}${endpoint}`, body, { headers });
        break;
      case 'DELETE':
        request$ = this.http.delete<T>(`${this.apiUrl}${endpoint}`, { headers });
        break;
      default:
        return throwError(() => new Error(`Método HTTP no soportado: ${method}`));
    }

    return request$.pipe(
      catchError((error) => this.handleError(error, endpoint, method, body))
    );
  }


  // Manejo de errores y refresco de token si es necesario
  private handleError(error: any, endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', body?: any): Observable<any> {
    console.error('Error en la petición:', error);

    if (error.status === 401) {
      return this.authService.refreshToken().pipe(
        switchMap((response) => {
          if (response?.accessToken) {
            return this.retryRequest(response.accessToken, endpoint, method, body);
          }
          return throwError(() => new Error('No se pudo refrescar el token'));
        })
      );
    }

    if (error.status === 403) {
      return throwError(() => new Error('Acceso denegado: No tienes permisos para esta acción.'));
    }

    return throwError(() => error);
  }


  // Reintentar la solicitud con el nuevo token
  private retryRequest<T>(newToken: string, endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', body?: any): Observable<T> {
    const headers = this.getHeaders(newToken);
    switch (method) {
      case 'GET':
        return this.http.get<T>(`${this.apiUrl}${endpoint}`, { headers });
      case 'POST':
        return this.http.post<T>(`${this.apiUrl}${endpoint}`, body, { headers });
      case 'PUT':
        return this.http.put<T>(`${this.apiUrl}${endpoint}`, body, { headers });
      case 'DELETE':
        return this.http.delete<T>(`${this.apiUrl}${endpoint}`, { headers });
      default:
        return throwError(() => new Error('Método HTTP no soportado en retryRequest'));
    }
  }

  //Obtener perfil
  getProfile(id: string): Observable<any> {
    return this.fetchWithToken(`/users/profile/${id}`, 'GET');
  }

  // Obtener lista de usuarios
  getUsers(): Observable<any> {
    return this.fetchWithToken('/users', 'GET');
  }

  // Obtener usuario por ID
  getUserById(id: string): Observable<any> {
    return this.fetchWithToken(`/users/${id}`, 'GET');
  }

  updateUser(id: string, data: users): Observable<users> {
    return this.fetchWithToken<users>(`/users/${id}`, 'PUT', data);
  }
  
  deleteUser(id:string){
    return this.fetchWithToken(`/users/${id}`, 'DELETE')
  }

  // Contar número de usuarios
  countUsers(): Observable<number> {
    return this.getUsers().pipe(map(users => users.length));
  }
}
