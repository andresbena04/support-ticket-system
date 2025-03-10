import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { NavbarComponent } from '../../../layout/navbar/navbar.component';
import { SidebarComponent } from '../../../layout/sidebar/sidebar.component';

import { ThemeService } from '../../../../services/theme.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { UsersService } from '../../../../services/users.service';
import { AlertsService } from '../../../../services/alerts.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-users-form',
  standalone: true,
  imports: [NavbarComponent, SidebarComponent, RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './usersForm.component.html',
  styleUrl: './usersForm.component.css'
})
export class UsersFormComponent {

  isActive: boolean = false
  isDarkMode: boolean = false;
  loading: boolean = false;
  usersForm!: FormGroup;
  dataUsers: any = {};
  isEditMode = false;
  userID!: string;
  textButton = 'Crear usuario';

  constructor(
    private themeService: ThemeService,
    private authService: AuthService,
    private userService: UsersService,
    private alertService: AlertsService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router:Router
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.subscribeToDarkMode();
    this.handleRouteParams();
  }

  toggleSwitch(event: Event): void {
    this.isActive = (event.target as HTMLInputElement).checked;
  }
  private subscribeToDarkMode(): void {
    this.themeService.darkMode$.subscribe((mode: any) => {
      this.isDarkMode = mode;
    });
  }

  // Método para manejar los parámetros de la ruta
  private handleRouteParams(): void {
    this.route.paramMap.subscribe(params => {
      this.userID = params.get('id') ?? '';
      this.isEditMode = !!this.userID; // Si hay un ID, estamos en modo edición
      if (this.isEditMode) {
        this.loadUserData(this.userID);
        this.textButton = 'Actualizar usuario';
      }
    });
  }

  // Inicializa el formulario de usuario
  private initializeForm(): void {
    this.usersForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]], 
      status: ['']
    });
  }

  // Método para crear o actualizar un usuario 
  onSubmit(): void {
    if (this.usersForm.invalid) return;

    this.loading = true;
    const data = {
      firstName: this.usersForm.get('firstName')?.value,
      lastName: this.usersForm.get('lastName')?.value,
      email: this.usersForm.get('email')?.value,
      role: this.usersForm.get('role')?.value,
      status: this.usersForm.get('status')?.value ? 'ACTIVE' : 'INACTIVE',
      ...(this.isEditMode && { updatedAt: new Date() })
    };
    console.log(data)
    // Si estamos en modo edición, actualizamos el usuario, si no, creamos uno nuevo
    const request$ = this.isEditMode
      ? this.userService.updateUser(this.userID, data)
      : this.authService.createNewUser(data);

    // Suscripción al observable
    request$.subscribe({
      next: () => {
        this.loading = false;
        this.alertService.showSuccess();
        if (!this.isEditMode) this.usersForm.reset();
        this.router.navigate(['/admin/users']);
      },
      error: (error) => {
        this.loading = false;
        this.alertService.showError(error.message);
      }
    });
  }

    private loadUserData(id: string): void {
      this.userService.getUserById(id).subscribe({
        next: (user) => {
          this.isActive = user.status === 'ACTIVE'
          this.usersForm.setValue({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            status: this.isActive
          });
        },
        error: (err) => {
          console.error(err);
        }
      });
    }
}
