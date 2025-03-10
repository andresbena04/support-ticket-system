import { Component } from '@angular/core';
import { SidebarComponent } from '../layout/sidebar/sidebar.component';
import { NavbarComponent } from '../layout/navbar/navbar.component';
import { ThemeService } from '../../services/theme.service';
import { comments, history, tickets } from '../../models/models';
import { TicketsService } from '../../services/tickets.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import Swal from 'sweetalert2';
import { AlertsService } from '../../services/alerts.service';
import { AuthService } from '../../services/auth/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-ticket-view',
  standalone: true,
  imports: [SidebarComponent, NavbarComponent, DatePipe, CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './ticket-view.component.html',
  styleUrl: './ticket-view.component.css'
})
export class TicketViewComponent {

  loading: boolean = false;
  isDarkMode: boolean = false;
  ticket!: tickets;
  history: history[] = [];
  ticketID!: string;
  UserRole!: string;
  redirectUrl: string = '';
  userID!: string
  formComment!: FormGroup
  dataComment!: comments
  commentsTicket: comments[] = []

  constructor(
    private themeService: ThemeService,
    private ticketsService: TicketsService,
    private alertService: AlertsService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.userID = sessionStorage.getItem('id') || '';
    this.UserRole = sessionStorage.getItem('role') || '';
    this.subscribeToDarkMode();
    this.handleRouteParams()
    this.getTickets()
    this.getHistoryTicket()
    this.getCommentsbyTicketId()
    this.setRedirectUrl()
    this.initializeForm()
  }

  // Método para manejar los parámetros de la ruta
  private handleRouteParams(): void {
    this.route.paramMap.subscribe(params => {
      this.ticketID = params.get('id') ?? '';
    });
  }
  // Método para suscribirse al cambio de tema (oscuro o claro)
  private subscribeToDarkMode(): void {
    this.themeService.darkMode$.subscribe((mode: any) => {
      this.isDarkMode = mode;
    });
  }
  private setRedirectUrl(): void {
    if (this.authService.hasRole(['ADMIN'])) {
      this.redirectUrl = '/admin/tickets';
    } else {
      this.redirectUrl = '/tickets';
    }
  }
  private initializeForm(): void {
    this.formComment = this.fb.group({
      content: ['', Validators.required]
    });
  }

  // Método para obtener un ticket por su ID
  getTickets() {
    this.ticketsService.getTicketById(this.ticketID).subscribe({
      next: (res) => {
        this.ticket = res
      }, error: (err) => {
        console.error('Error en la petición:', err);
      }
    })
  }
  // Método para obtener el historial de un ticket
  getHistoryTicket(): void {
    this.ticketsService.getHistoryTickets(this.ticketID).subscribe({
      next: (res) => {
        this.history = res
      }, error: (err) => {
        console.error('Error en la petición:', err);
      }
    })
  }
  // Método para redirigir a la página de edición de un ticket
  editTicket(id: number): void {
    const basePath = this.authService.hasRole(['ADMIN']) ? 'admin/tickets/edit' : 'tickets/edit';
    this.router.navigate([basePath, id]);
  }

  // Método para cerrar un ticket y agregar un registro al historial
  /* resolveTicket(id: number): void {
    Swal.fire({
      title: "¿Estás seguro de cerrar este ticket?",
      showCancelButton: true,
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        const data = {
          status: 'CLOSED',
          updatedAt: new Date(),
        };
        this.ticketsService.updateTicket(this.ticketID, data).subscribe({
          next: () => {
            const historyEntry = {
              ticketId: parseInt(this.ticketID),
              userId: parseInt(this.userID),
              action: 'Ticket cerrado',
              createdAt: new Date()
            };
            this.ticketsService.addHistoryTicket(historyEntry).subscribe({
              next: () => {
                this.alertService.showSuccess('Ticket cerrado correctamente');
                this.getTickets();
                this.getHistoryTicket()
              }, error: (err) => {
                this.alertService.showError('Error al cerrar el ticket');
              }
            })
          },
          error: () => {
            this.alertService.showError('Error al cerrar el ticket');
          }
        });
      }
    });
  } */
 // Método para actualizar el estado de un ticket y agregar un registro al historial
updateTicketStatus(id: number): void {
  Swal.fire({
    title: "Selecciona el estado del ticket",
    input: "select",
    inputOptions: {
      IN_PROGRESS: "En proceso",
      CLOSED: "Resuelto"
    },
    inputPlaceholder: "Selecciona una opción",
    showCancelButton: true,
    confirmButtonText: "Confirmar",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      const data = {
        status: result.value,
        updatedAt: new Date(),
      };
      this.ticketsService.updateTicket(this.ticketID, data).subscribe({
        next: () => {
          const historyEntry = {
            ticketId: parseInt(this.ticketID),
            userId: parseInt(this.userID),
            action: result.value === 'CLOSED' ? 'Ticket cerrado' : 'Ticket en proceso',
            createdAt: new Date()
          };
          this.ticketsService.addHistoryTicket(historyEntry).subscribe({
            next: () => {
              this.alertService.showSuccess(`Ticket actualizado a ${result.value === 'CLOSED' ? 'Resuelto' : 'En proceso'}`);
              this.getTickets();
              this.getHistoryTicket();
            }, 
            error: () => {
              this.alertService.showError('Error al actualizar el historial del ticket');
            }
          });
        },
        error: () => {
          this.alertService.showError('Error al actualizar el estado del ticket');
        }
      });
    }
  });
}

  deleteTicket(id: number): void {
    let superUser = sessionStorage.getItem('isSuperUser')
    if (superUser) {
      Swal.fire({
        title: "¿Estás seguro de eliminar este ticket?",
        showCancelButton: true,
        confirmButtonText: "Confirmar",
        cancelButtonText: "Cancelar",
      }).then((result) => {
        if (result.isConfirmed) {
          this.ticketsService.deleteTicket(String(id)).subscribe({
            next: () => {
              this.alertService.showSuccess('Ticket eliminado correctamente');
              this.router.navigate(['/admin/tickets']);
            },
            error: () => {
              this.alertService.showError('Error al eliminar el ticket');
            }
          });
        }
      });
    } else {
      this.alertService.showError('No tienes permisos para realizar esta acción');
    }
  }

  getCommentsbyTicketId(): void {
    this.ticketsService.getCommentsbyTicket(this.ticketID).subscribe({
      next: (res) => {
        const today = new Date().toISOString().split('T')[0]; // Obtener la fecha de hoy en formato YYYY-MM-DD
        let lastDate = '';
  
        this.commentsTicket = res.map((comment:any, index:number) => {
          const commentDate = new Date(comment.createdAt).toISOString().split('T')[0];
          const isNewDay = commentDate !== lastDate; // Verifica si cambia de día respecto al anterior comentario
          lastDate = commentDate; // Actualiza el último día procesado
  
          return {
            ...comment,
            isToday: commentDate === today, // Marcar si es hoy
            isNewDay: isNewDay || index === 0 // Marcar si es un nuevo día o el primer mensaje
          };
        });
  
        console.log(this.commentsTicket);
      },
      error: (err) => {
        console.error('Error en la petición:', err);
      }
    });
  }
  
  addComments(): void {
    this.loading = true
    this.dataComment = this.formComment.value
    this.dataComment = {
      ...this.dataComment,
      ticketId: parseInt(this.ticketID),
      userId: parseInt(this.userID),
      createdAt: new Date()
    }
    this.ticketsService.addComment(this.dataComment).subscribe({
      next: () => {
        this.formComment.reset()
        this.getCommentsbyTicketId()
        setTimeout(() => this.scrollToBottom(), 100);
        this.loading = false
      }, error: (error) => {
        console.log(error)
        this.alertService.showError('Error al agregar el comentario')
        this.loading = false
      }
    })
  }
  scrollToBottom(): void {

    setTimeout(() => {
      const commentContainer = document.getElementById('commentsContainer');
      if (commentContainer) {
        commentContainer.scrollTop = commentContainer.scrollHeight;
      }
    }, 100);
  }

  get priorityBadge() {
    const priorities: Record<string, { class: string, text: string }> = {
      LOW: { class: 'bg-primary', text: 'Baja' },
      MEDIUM: { class: 'bg-warning', text: 'Media' },
      HIGH: { class: 'bg-danger', text: 'Alta' }
    };

    // Verifica que priority no sea undefined antes de acceder al objeto
    return this.ticket?.priority && priorities[this.ticket.priority]
      ? priorities[this.ticket.priority]
      : { class: 'bg-secondary', text: 'Desconocido' };
  }
  get statusBadge() {
    const statuses: Record<string, { class: string, text: string }> = {
      OPEN: { class: 'bg-primary', text: 'Abierto' },
      IN_PROGRESS: { class: 'bg-warning', text: 'En progreso' },
      CLOSED: { class: 'bg-success', text: 'Cerrado' }
    };

    // Verifica que status no sea undefined antes de acceder al objeto
    return this.ticket?.status && statuses[this.ticket.status]
      ? statuses[this.ticket.status]
      : { class: 'bg-secondary', text: 'Desconocido' };
  }

}