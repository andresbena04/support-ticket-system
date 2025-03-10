import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AlertsService } from '../../../services/alerts.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent {

  changePasswordForm!: FormGroup;
  loading = false;
  redirectUrl!: string
  showPassword: any = { current: false, new: false, confirm: false };

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private alertsService: AlertsService
  ) { }

  ngOnInit(): void {
    this.initializeForm()
    this.setRedirectUrl()
  }

  private setRedirectUrl(): void {
    if (this.authService.hasRole(['ADMIN'])) {
      this.redirectUrl = '/admin/dashboard';
    } else {
      this.redirectUrl = '/dashboard';
    }
  }
  initializeForm(): void {
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: [this.passwordsMatch, this.passwordsLength] });
  }
  // Validación personalizada para verificar si las contraseñas coinciden
  passwordsMatch(form: FormGroup): ValidationErrors | null {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  // Validación personalizada para verificar la longitud mínima de la nueva contraseña
  passwordsLength(form: FormGroup): ValidationErrors | null {
    const newPassword = form.get('newPassword')?.value;

    return newPassword && newPassword.length >= 6 ? null : { minLengthError: true };
  }
  // Cambiar visibilidad de contraseña
  togglePassword(field: string) {
    this.showPassword[field] = !this.showPassword[field];
  }
  changePassword(): void {
    if (this.changePasswordForm.invalid) return;

    this.loading = true;
    const { currentPassword, newPassword } = this.changePasswordForm.value;

    this.authService.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.alertsService.showSuccess('Contraseña cambiada correctamente')
        this.changePasswordForm.reset();
        this.loading = false
        this.router.navigateByUrl(this.redirectUrl)
      },
      error: (err) => {
        console.log(err)
        this.alertsService.showError(`Hubo un problema: ${err.error.message || err.error.error}`)
        this.loading = false
      },
      complete: () => this.loading = false
    });
  }
}
