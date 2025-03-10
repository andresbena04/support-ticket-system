import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavbarComponent } from '../../layout/navbar/navbar.component';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ThemeService } from '../../../services/theme.service';
import { TicketsService } from '../../../services/tickets.service';
import { AlertsService } from '../../../services/alerts.service';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-ticket-form',
  standalone: true,
  imports: [NavbarComponent, SidebarComponent, ReactiveFormsModule, RouterLink],
  templateUrl: './ticket-form.component.html',
  styleUrl: './ticket-form.component.css'
})
export class TicketFormComponent {

  isDarkMode: boolean = false;
  loading: boolean = false;
  ticketsForm!: FormGroup;
  dataTickets: any = {};
  originalTicketData: any = {};
  isEditMode = false;
  userID!: string;
  ticketID!: string;
  textButton = 'Crear ticket';
  redirectUrl: string = '';

  constructor(
    private fb: FormBuilder,
    private themeService: ThemeService,
    private ticketsService: TicketsService,
    private alertsService: AlertsService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.subscribeToDarkMode();
    this.userID = sessionStorage.getItem('id') || '';
    this.handleRouteParams();
    this.setRedirectUrl()

  }

  private subscribeToDarkMode(): void {
    this.themeService.darkMode$.subscribe((mode: any) => {
      this.isDarkMode = mode;
    });
  }

  // Método para manejar los parámetros de la ruta
  private handleRouteParams(): void {
    this.route.paramMap.subscribe(params => {
      this.ticketID = params.get('id') ?? '';
      this.isEditMode = !!this.ticketID;
      if (this.isEditMode) {
        this.loadTicketData(this.ticketID);
        this.textButton = 'Actualizar ticket';
      }
    });
  }
  private setRedirectUrl(): void {
    if (this.authService.hasRole(['ADMIN'])) {
      this.redirectUrl = '/admin/tickets';
    } else {
      this.redirectUrl = '/tickets';
    }
  }

  // Inicializar formulario
  private initializeForm(): void {
    this.ticketsForm = this.fb.group({
      title: ['', Validators.required],
      priority: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.ticketsForm.invalid) return;
    this.loading = true;
    this.dataTickets = this.ticketsForm.value;
    this.dataTickets.userId = parseInt(this.userID);

    // Realizar petición de creación o actualización
    const request$ = this.isEditMode
      ? this.ticketsService.updateTicket(this.ticketID, this.dataTickets)
      : this.ticketsService.createTicket(this.dataTickets);

    // Suscribirse a la petición
    request$.subscribe({
      next: (response) => {
        let historyMessage = this.isEditMode ? this.generateUpdateMessage(response) : 'Ticket creado';

        const historyEntry = {
          ticketId: response.id,
          userId: this.dataTickets.userId,
          action: historyMessage,
          createdAt: new Date()
        };

        this.ticketsService.addHistoryTicket(historyEntry).subscribe({
          next: () => {
            this.alertsService.showSuccess()
            const basePath = this.authService.hasRole(['ADMIN']) ? 'admin/tickets' : 'tickets';
            this.router.navigate([basePath]);
            this.loading = false;
          },
          error: (err) => {
            this.loading = false;
            console.error('Error al actualizar historial:', err);
          }
        });

        this.ticketsForm.reset();
      },
      error: (err) => {
        this.alertsService.showError();
        console.error(this.isEditMode ? 'Error al actualizar ticket' : 'Error al crear ticket', err);
        this.loading = false;
      }
    });
  }
  // Cargar datos del ticket en el formulario
  loadTicketData(id: string): void {
    this.ticketsService.getTicketById(id).subscribe({
      next: (response) => {
        this.originalTicketData = { ...response };
        this.ticketsForm.patchValue({
          title: response.title,
          priority: response.priority,
          description: response.description
        });
      },
      error: (err) => {
        console.error('Error al cargar datos del ticket:', err);
      }
    });
  }
  // Generar mensaje de actualización 
  private generateUpdateMessage(updatedData: any): string {
    let changes: string[] = [];
    if (this.originalTicketData.title !== updatedData.title) {
      changes.push(`Título cambiado de '${this.originalTicketData.title}' a '${updatedData.title}'`);
    }
    if (this.originalTicketData.priority !== updatedData.priority) {
      const oldPriority = this.translatePriority(this.originalTicketData.priority);
      const newPriority = this.translatePriority(updatedData.priority);
      changes.push(`Prioridad cambiada de '${oldPriority}' a '${newPriority}'`);
    }
    if (this.originalTicketData.description !== updatedData.description) {
      changes.push(`Descripción actualizada`);
    }
    return changes.length > 0 ? changes.join(', ') : 'Sin cambios detectados';
  }

  // Método para traducir los valores de prioridad
  private translatePriority(priority: string): string {
    const priorityMap: { [key: string]: string } = {
      'LOW': 'Baja',
      'MEDIUM': 'Media',
      'HIGH': 'Alta'
    };
    return priorityMap[priority] || priority; // Si no encuentra la clave, devuelve el original
  }

}
