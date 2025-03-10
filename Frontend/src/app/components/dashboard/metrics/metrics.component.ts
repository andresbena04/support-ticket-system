import { Component } from '@angular/core';
import { ThemeService } from '../../../services/theme.service';
import { CommonModule } from '@angular/common';
import { TicketsService } from '../../../services/tickets.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-metrics',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './metrics.component.html',
  styleUrl: './metrics.component.css'
})
export class MetricsComponent {

  isDarkMode: boolean = false;
  tickets: any[] = [];
  ticketTotal: number = 0;
  ticketPending: number = 0;
  ticketSolved: number = 0;
  userID!: string
  constructor(
    private themeService:ThemeService,
    private ticketsService:TicketsService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.subscribeToDarkMode()
    this.userID = sessionStorage.getItem('id') || '';
    this.getTicketsbyUser()
  }
  private subscribeToDarkMode(): void {
    this.themeService.darkMode$.subscribe((mode: any) => {
      this.isDarkMode = mode;
    });
  }
  getTicketsbyUser() {
    this.ticketsService.getTicketsbyUserId(this.userID).subscribe({
      next: (response) => {
        this.tickets = response;
        this.ticketTotal = this.tickets.length;
        
        // Contar tickets según su estado
        this.ticketPending = this.tickets.filter(ticket => ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS').length;
        this.ticketSolved = this.tickets.filter(ticket => ticket.status === 'CLOSED').length;
      },
      error: (err) => {
        console.error('Error en la petición:', err);
      }
    });
  }
   // Funcion para visualizar un ticket
   viewTicket(id: string): void {
    this.router.navigate(['/tickets/view', id]);
  }
  private statusMap: { [key: string]: { class: string, text: string } } = {
    'OPEN': { class: 'text-bg-primary', text: 'Abierto' },
    'IN_PROGRESS': { class: 'text-bg-warning', text: 'En progreso' },
    'CLOSED': { class: 'text-bg-success', text: 'Cerrado' }
  };

  private priorityMap: { [key: string]: { class: string, text: string } } = {
    'LOW': { class: 'text-bg-primary', text: 'Baja' },
    'MEDIUM': { class: 'text-bg-warning', text: 'Media' },
    'HIGH': { class: 'text-bg-danger', text: 'Alta' }
  };

  getStatusClass(status: string): string {
    return this.statusMap[status]?.class || 'text-bg-secondary'; // Clase por defecto
  }

  getStatusText(status: string): string {
    return this.statusMap[status]?.text || 'Desconocido'; // Texto por defecto
  }

  getPriorityClass(priority: string): string {
    return this.priorityMap[priority]?.class || 'text-bg-secondary'; // Clase por defecto
  }

  getPriorityText(priority: string): string {
    return this.priorityMap[priority]?.text || 'Desconocido'; // Texto por defecto
  }
  
}
