import { Component } from '@angular/core';
import { ThemeService } from '../../../../services/theme.service';
import { UsersService } from '../../../../services/users.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { TicketsService } from '../../../../services/tickets.service';
import { tickets } from '../../../../models/models';

@Component({
  selector: 'app-metrics',
  standalone: true,
  imports: [RouterLink, CommonModule, DatePipe],
  templateUrl: './metrics.component.html',
  styleUrl: './metrics.component.css'
})
export class MetricsComponent {

  userCount: number = 0;
  adminCount: number = 0;
  completedCount: number = 0
  pendingCount: number = 0
  users: any = [];
  tickets: any = [];
  isDarkMode: boolean = false;

  constructor(
    private userService: UsersService,
    private themeService: ThemeService,
    private ticketsService: TicketsService,
    private router: Router
  ) { }

  ngOnInit() {
    this.fetchUsers();
    this.fetchTickets()
    this.subscribeToDarkMode()
  }

  private subscribeToDarkMode(): void {
    this.themeService.darkMode$.subscribe((mode: any) => {
      this.isDarkMode = mode;
    });
  }

  // Funcion para obtener los usuarios
  private fetchUsers(): void {
    this.userService.getUsers().subscribe((users: any) => {
      this.users = this.sortUsersById(users);
      this.updateRoleCounts(users);
    });
  }
  // Funcion para ordenar los usuarios por id
  private sortUsersById(users: any[]): any[] {
    return users.sort((a, b) => a.id - b.id);
  }
  // Funcion para actualizar el conteo de roles
  private updateRoleCounts(users: any[]): void {
    this.userCount = users.filter((user: any) => user.role === 'USER').length;
    this.adminCount = users.filter((user: any) => user.role === 'ADMIN').length;
  }

  private fetchTickets(): void {
    this.ticketsService.getTickets().subscribe((tickets: tickets[]) => {
      this.tickets = this.sortTicketsById(tickets);
      this.updateTicketsCounts(tickets);
    });
  }
  // Función para ordenar los tickets por ID
  private sortTicketsById(tickets: any[]): any[] {
    return tickets.sort((a, b) => a.id - b.id);
  }
  // Funcion para visualizar un ticket
  viewTicket(id: string): void {
    this.router.navigate(['/tickets/view', id]);
  }
  

  // Funcion para actualizar el conteo de roles
  private updateTicketsCounts(tickets: tickets[]): void {
    this.pendingCount = tickets.filter((ticket: any) => ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS').length;
    this.completedCount = tickets.filter((ticket: any) => ticket.status === 'CLOSED').length;
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
