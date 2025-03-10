import { Component } from '@angular/core';
import { ThemeService } from '../../../services/theme.service';
import { NavbarComponent } from '../../layout/navbar/navbar.component';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { ClientSideRowModelModule, ColDef, GridOptions, PaginationModule, provideGlobalGridOptions } from 'ag-grid-community';
import { Router, RouterLink } from '@angular/router';
import { TicketsService } from '../../../services/tickets.service';
import { ActionButtonComponent } from './action-button/action-button.component';

@Component({
  selector: 'app-admin-tickets',
  standalone: true,
  imports: [NavbarComponent, SidebarComponent, CommonModule, AgGridAngular],
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.css']  // Corrección aquí: 'styleUrls' en vez de 'styleUrl'
})
export class TicketsAdminComponent {
  // Inicialización de variables para la paginación y el manejo de tickets
  modules = [ClientSideRowModelModule, PaginationModule];
  gridOptions!: GridOptions;
  columnDefs!: ColDef[];
  isDarkMode: boolean = false;
  userID!: string;
  tickets: any[] = []; 
  countTickets: number = 0;

  constructor(
    private themeService: ThemeService,
    private ticketsService: TicketsService,
    private router: Router
  ) { }

  ngOnInit() {
    this.subscribeToDarkMode();  // Suscripción al tema oscuro
    this.getTickets();  // Obtener los tickets
    this.initializeGridOptions();  // Inicialización de las opciones de la grilla
    this.initializeColumnDefs();  // Inicialización de las columnas de la grilla
  }

  /**
   * Suscribe al cambio de tema (oscuro o claro).
   */
  private subscribeToDarkMode(): void {
    this.themeService.darkMode$.subscribe((mode: any) => {
      this.isDarkMode = mode;
    });
  }

  /**
   * Obtiene todos los tickets desde el servicio y los ordena.
   */
  getTickets(): void {
    this.ticketsService.getTickets().subscribe({
      next: (response) => {
        this.tickets = response.sort((a: any, b: any) => a.id - b.id);  
        this.countTickets = this.tickets.length
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

 


  /**
   * Inicializa las opciones de la grilla de ag-Grid.
   */
  private initializeGridOptions(): void {
    this.gridOptions = {
      rowModelType: 'clientSide',
      suppressCellFocus: true,
      pagination: true,
      paginationPageSize: 8,
      paginationPageSizeSelector: false,
      overlayNoRowsTemplate: `
        <div class="d-flex flex-column align-items-center justify-content-center text-muted p-4">
          <i class="bx bxs-folder-open display-3"></i>
          <span class="fs-5">No hay tickets registrados</span>
        </div>
      `,
    };
    provideGlobalGridOptions({
      theme: 'legacy'
    });
  }

  /**
   * Inicializa las columnas de la grilla de ag-Grid.
   */
  private initializeColumnDefs(): void {
    this.columnDefs = [
      {
        headerName: 'ID',
        suppressMovable: true,
        resizable: false,
        width: 80,
        field: 'id'
      },
      {
        headerName: 'Titulo',
        suppressMovable: true,
        resizable: false,
        width: 150,
        field: 'title'
      },
      {
        headerName: 'Descripción',
        suppressMovable: true,
        resizable: false,
        width: 200,
        field: 'description'
      },
      {
        headerName: 'Estado',
        suppressMovable: true,
        resizable: false,
        width: 100,
        field: 'status',
        cellRenderer: this.statusCellRenderer
      },
      {
        headerName: 'Prioridad',
        suppressMovable: true,
        resizable: false,
        width: 120,
        field: 'priority',
        cellRenderer: this.priorityCellRenderer
      },
      {
        headerName: 'Fecha de creación',
        suppressMovable: true,
        resizable: false,
        width: 180,
        valueGetter: (params) => params.data.createdAt ? new Date(params.data.createdAt) : null,
        valueFormatter: (params) =>
          params.value
            ? new Date(params.value).toLocaleDateString('es-ES', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })
            : ''
      },
      {
        headerName: 'Fecha de modificación',
        suppressMovable: true,
        resizable: false,
        valueGetter: (params) => params.data.updatedAt ? new Date(params.data.updatedAt) : null,
        valueFormatter: (params) =>
          params.value
            ? new Date(params.value).toLocaleDateString('es-ES', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })
            : ''
      },
      {
        headerName: "...",
        field: "action",
        cellRenderer: ActionButtonComponent,
        cellRendererParams: {
          onView: (id: string) => this.viewticket(id)
        },
        suppressMovable: true,
        width: 80,
        resizable: false
      }
    ];
  }
  viewticket(id: string) {
    this.router.navigate(['/admin/tickets/view', id]);
  }

  /**
   * Renderiza la prioridad de un ticket en formato de etiqueta.
   */
  private priorityCellRenderer(params: any) {
    const priority = params.value;
    let textPriority;
    let colorClass = 'badge bg-secondary';
    if (priority === 'LOW') colorClass = 'badge bg-primary', textPriority = 'Baja';
    else if (priority === 'MEDIUM') colorClass = 'badge bg-warning', textPriority = 'Media';
    else if (priority === 'HIGH') colorClass = 'badge bg-danger', textPriority = 'Alta';
    return `<span class="${colorClass}">${textPriority}</span>`;
  }

  /**
   * Renderiza el estado de un ticket en formato de etiqueta.
   */
  private statusCellRenderer(params: any) {
    const status = params.value;
    let textStatus;
    let colorClass = 'badge bg-secondary';
    if (status === 'OPEN') colorClass = 'badge bg-primary', textStatus = 'Abierto';
    else if (status === 'IN_PROGRESS') colorClass = 'badge bg-warning', textStatus = 'En progreso';
    else if (status === 'CLOSED') colorClass = 'badge bg-success', textStatus = 'Cerrado';
    return `<span class="${colorClass}">${textStatus}</span>`;
  }
}
