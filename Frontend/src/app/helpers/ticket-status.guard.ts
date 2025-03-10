import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TicketsService } from '../services/tickets.service';
import { catchError, map, of } from 'rxjs';

export const ticketStatusGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const ticketsService = inject(TicketsService);
  const ticketId = route.params['id']; // ID del ticket desde la URL
  const currentUser = parseInt(sessionStorage.getItem('id') || '');
  const roleUser = sessionStorage.getItem('role') || '';

  // Definir la ruta de redirección según el rol
  const redirectPath = roleUser === 'ADMIN' ? '/admin/dashboard' : '/dashboard';

  return ticketsService.getTicketById(ticketId).pipe(
    map(ticket => {
      if (!ticket) {
        router.navigate([redirectPath]);
        return false;
      }

      // Verifica si el ticket está cerrado
      if (ticket.status === 'CLOSED') {
        router.navigate([redirectPath]);
        return false;
      }
      // Permite solo si el usuario actual es el creador del ticket
      if (ticket.userId !== currentUser) {
        router.navigate([redirectPath]);
        return false;
      }

      return true;
    }),
    catchError(() => {
      router.navigate([redirectPath]);
      return of(false);
    })
  );
};
