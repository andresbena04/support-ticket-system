import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AlertsService } from '../../../services/alerts.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent {

  loading: boolean = false;
  token: string | null = null;
  isResetMode = false; // Modo de actualización
  resetForm!: FormGroup;
  resetFormPassword!: FormGroup;
  isPasswordVisible: boolean = false

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private authService: AuthService,
    private alertService: AlertsService,
    private router: Router
  ) { }

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      this.token = params.get('token');
      this.isResetMode = !!this.token; // Si hay token, es para actualizar
    });
    this.initializeForm();
  }

  initializeForm(): void {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
    this.resetFormPassword = this.fb.group({
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validator: this.passwordsMatchValidator
    });
  }

  requestPasswordReset(): void {
    this.loading = true;
    this.authService.requestPasswordReset(this.resetForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.alertService.showSuccess('¡Listo! Te hemos enviado un correo con instrucciones para restablecer tu contraseña. ')
        this.resetForm.reset()
      },
      error: (err) => {
        this.loading = false;
        console.log(err);
        this.alertService.showError('Ocurrió un error al intentar enviar el correo. Por favor, intenta nuevamente.')
      }
    });
  }

  // Validador personalizado para comparar las contraseñas
  passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword?.setErrors({ noMatch: true });
      return { noMatch: true };
    }
    return null;
  }

  resetPassword(): void {
    if (!this.token) return; // Asegurarse de que el token esté presente

    // Validar si el formulario es válido y las contraseñas coinciden
    if (this.resetFormPassword.invalid) {
      this.alertService.showError('Las contraseñas no coinciden. Asegúrate de que ambas contraseñas sean iguales.')
      return; // Si el formulario es inválido o las contraseñas no coinciden, no continuar
    }

    this.loading = true;

    this.authService.resetPassword(this.token, this.resetFormPassword.value).subscribe({
      next: () => {
        this.loading = false;
        this.alertService.showSuccess('¡Éxito! Tu contraseña ha sido restablecida. Ya puedes acceder a tu cuenta con tus nuevas credenciales.')
        this.router.navigateByUrl('/login');
      },
      error: (err) => {
        this.loading = false;
        console.log(err);
        this.alertService.showError('No pudimos restablecer tu contraseña. Por favor, intenta nuevamente.')
      }
    });
  }
  togglePasswordVisibility(){
    this.isPasswordVisible = !this.isPasswordVisible
  }
}
