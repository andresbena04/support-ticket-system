import { Component } from '@angular/core';
import { NavbarComponent } from '../../layout/navbar/navbar.component';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { ThemeService } from '../../../services/theme.service';
import { ClientSideRowModelModule, ColDef, GridOptions, Module, ModuleRegistry, PaginationModule, provideGlobalGridOptions, RowSelectionOptions } from 'ag-grid-community';
import { UsersService } from '../../../services/users.service';
import { AgGridAngular } from 'ag-grid-angular';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ActionButtonComponent } from './action-button/action-button.component';
import { AlertsService } from '../../../services/alerts.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [NavbarComponent, SidebarComponent, AgGridAngular, RouterLink, CommonModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent {

  isDarkMode: boolean = false; // Variable para manejar el modo oscuro
  users: any[] = []; // Lista de todos los usuarios
  countUser: number = 0; // Contador de usuarios registrados

  columnDefs!: ColDef[]; // Definición de las columnas de AG Grid
  gridOptions!: GridOptions; // Opciones de configuración de AG Grid
  modules: Module[] = [ClientSideRowModelModule, PaginationModule]; // Módulos de AG Grid

  constructor(
    private themeService: ThemeService,
    private userService: UsersService,
    private alertService: AlertsService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadUsers();
    this.subscribeToDarkMode();
    this.initializeGridOptions();
    this.initializeColumnDefs();
  }

  /**
   * Inicializa las opciones de la tabla AG Grid
   */
  private initializeGridOptions(): void {
    this.gridOptions = {
      suppressCellFocus: true,
      pagination: true,
      paginationPageSize: 8,
      paginationPageSizeSelector: false,
      localeText: {
        // for filter panel
        page: 'Pagina',
        more: 'Mas',
        to: 'a',
        of: 'de',
        next: 'Siguente',
        last: 'Último',
        first: 'Primero',
        previous: 'Anteror',
        loadingOoo: 'Cargando...'
      }

    };
    provideGlobalGridOptions({
      theme: "legacy"
    });
  }

  /**
   * Define las columnas de la tabla AG Grid.
   */
  private initializeColumnDefs(): void {
    this.columnDefs = [
      { headerName: "ID", field: "id", width: 100, suppressMovable: true, resizable: false },
      {
        headerName: "Nombre",
        field: "fullName",
        valueGetter: (params) => `${params.data.firstName} ${params.data.lastName}`,
        suppressMovable: true,
        resizable: false
      },
      { headerName: "Correo", field: "email", width: 260, suppressMovable: true, resizable: false },
      { headerName: "Rol", field: "role", suppressMovable: true, width: 120, resizable: false },
      { headerName: "Estado", field: "status", width: 120, suppressMovable: true, resizable: false,
        cellRenderer: (params: any) => {
          const isActive = params.value === "ACTIVE"; // Verifica el estado
          return `
            <span class="d-flex align-items-center">
              <i class=" fs-5 bx ${isActive ? 'bx-check-circle text-success' : 'bx-x-circle text-secundary'} me-1"></i>
              ${isActive ? 'Activo' : 'Inactivo'}
            </span>
          `;
        }
       },
      {
        headerName: "Fecha de creación",
        field: "createdAt",
        suppressMovable: true,
        width: 200,
        resizable: false,
        valueFormatter: params => params.value ? new Date(params.value).toLocaleDateString('es-ES') : ''
      },
      {
        headerName: "Acción",
        field: "action",
        cellRenderer: ActionButtonComponent,
        cellRendererParams: (params: any) => {
          const loggedUserId = parseInt(sessionStorage.getItem('id') || '0', 10); // Convierte el ID a número
          const isCurrentUser = params.data.id === loggedUserId; // Compara con el usuario de la fila

          return {
            hideActions: isCurrentUser, // Enviar si debe ocultar los botones
            onEdit: (id: string) => this.editUser(id),
            onDelete: (id: string) => this.deleteUser(id),
          };
        },
        suppressMovable: true,
        width: 100,
        resizable: false
      }

    ];
  }

  /**
   * Carga la lista de usuarios desde el servicio y calcula la paginación.
   */
  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: response => {
        this.users = response.sort((a: any, b: any) => a.id - b.id); // Ordenar usuarios por ID
         this.countUser = this.users.length; // Contar usuarios
      },
      error: error => {
        console.error(error);
      }
    });
  }


  /**
   * Redirige a la página de edición del usuario.
   * @param id ID del usuario
   */
  editUser(id: string): void {
    this.router.navigate(['/admin/users/edit', id]);
  }

  /**
   * Elimina un usuario tras una confirmación.
   * @param id ID del usuario
   */
  deleteUser(id: string): void {
    this.alertService.showConfirmation().then((confirmed) => {
      if (confirmed) {
        this.userService.deleteUser(id).subscribe({
          next: () => {
            this.alertService.showSuccess();
            this.loadUsers(); // Recargar la lista de usuarios tras eliminar
          },
          error: error => {
            console.error(error);
            this.alertService.showError();
          }
        });
      }
    });
  }

  /**
   * Suscribirse al tema oscuro para cambiar la apariencia del componente.
   */
  private subscribeToDarkMode(): void {
    this.themeService.darkMode$.subscribe((mode: any) => {
      this.isDarkMode = mode;
    });
  }
}
