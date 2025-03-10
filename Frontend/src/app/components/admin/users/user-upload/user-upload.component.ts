import { Component, HostListener } from '@angular/core';
import { NavbarComponent } from '../../../layout/navbar/navbar.component';
import { SidebarComponent } from '../../../layout/sidebar/sidebar.component';
import { ThemeService } from '../../../../services/theme.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { AlertsService } from '../../../../services/alerts.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-upload',
  standalone: true,
  imports: [NavbarComponent, SidebarComponent, RouterLink, CommonModule],
  templateUrl: './user-upload.component.html',
  styleUrl: './user-upload.component.css'
})
export class UserUploadComponent {
  loading: boolean = false;
  isDarkMode: boolean = false;
  fileName: string = '';
  selectedFile: File | null = null; // Almacena el archivo seleccionado

  constructor(
    private themeService: ThemeService,
    private authService: AuthService,
    private alertService: AlertsService
  ) { }

  ngOnInit() {
    this.subscribeToDarkMode();
  }

  private subscribeToDarkMode(): void {
    this.themeService.darkMode$.subscribe((mode: any) => {
      this.isDarkMode = mode;
    });
  }

  @HostListener('window:beforeunload', ['$event'])
  preventReload(event: BeforeUnloadEvent) {
    if (this.loading) {
      event.preventDefault();
      event.returnValue = 'La subida está en proceso. ¿Seguro que quieres salir?';
    }
  }
  // Captura el archivo cuando se selecciona
  onFileSelected(event: any) {
    const file = event.target.files[0];
    this.storeFile(file);
  }

  // Captura el archivo cuando se arrastra y suelta
  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    this.storeFile(file);
  }

  // Almacena el archivo sin enviarlo aún
  private storeFile(file: File | undefined) {
    if (!file) return;
    this.selectedFile = file;
    this.fileName = `Archivo seleccionado: ${file.name}`;
  }

  // Se ejecuta cuando el usuario presiona "Registrar Usuarios"
  uploadFile() {
    this.loading = true;
    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.authService.importUsers(formData).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.selectedFile = null;
        this.fileName = '';
        this.alertService.showSuccess(`Se han importado ${response.count} usuarios correctamente`);
      },
      error: (error: any) => {
        console.log(error)
        this.loading = false;
        this.alertService.showError('Error al importar usuarios');
      }
    });
  }
}
