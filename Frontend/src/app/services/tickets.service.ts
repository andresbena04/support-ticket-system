import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth/auth.service';
import { environment } from '../environments/environment.prod';
import { comments, tickets } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class TicketsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Configurar encabezados con token
  private getHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  // Método genérico para hacer solicitudes con token
  private fetchWithToken<T>(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE', 
    body?: any
  ): Observable<T> {
    const token = this.authService.getAccessToken();
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

    return request$.pipe(catchError((error) => this.handleError(error, endpoint, method, body)));
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

  // Reintentar la solicitud con un nuevo token
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

  // Métodos específicos para Tickets
  getTicketsbyUserId(id: string): Observable<any> {
    return this.fetchWithToken(`/tickets/user/${id}`, 'GET');
  }

  getTickets(): Observable<any> {
    return this.fetchWithToken('/tickets', 'GET');
  }

  getTicketById(id: string): Observable<any> {
    return this.fetchWithToken(`/tickets/${id}`, 'GET');
  }

  createTicket(ticket: tickets): Observable<any> {
    return this.fetchWithToken('/tickets', 'POST', ticket);
  }

  updateTicket(id: string, data: Partial<tickets>): Observable<tickets> {
    return this.fetchWithToken(`/tickets/${id}`, 'PUT', data);
  }
  deleteTicket(id: string): Observable<any> {
    return this.fetchWithToken(`/tickets/${id}`, 'DELETE');
  }
  getHistoryTickets(id: string): Observable<any> {
    return this.fetchWithToken(`/history/${id}`, 'GET');
  }
  addHistoryTicket(history: any): Observable<any> {
    return this.fetchWithToken('/history', 'POST', history);
  }
  addComment(comments: comments): Observable<any> {
    return this.fetchWithToken('/comments', 'POST', comments)
  }
  getCommentsbyTicket(id: string): Observable<any> {
    return this.fetchWithToken(`/comments/${id}`, 'GET');
  }
}
