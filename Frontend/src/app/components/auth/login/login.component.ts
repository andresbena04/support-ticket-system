import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AlertsService } from '../../../services/alerts.service';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  isDarkMode: boolean = false;
  formLogin!: FormGroup;
  formDataLogin: any = {}
  loading: boolean = false;
  isPasswordVisible: boolean = false

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private alertService: AlertsService,
    private themeService: ThemeService
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.subscribeToDarkMode()
  }
  private initializeForm(): void {
    this.formLogin = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }
  signIn(): void {
    this.loading = true;
    this.formDataLogin = this.formLogin.value;

    this.authService.getToken(this.formDataLogin).subscribe(
      (response) => {
        this.loading = false;
        this.storeUserData(response);
        // Redirige al dashboard dependiendo del rol del usuario
        this.redirectBasedOnRole(response.user.role);
      },
      (error) => {
        this.loading = false;
        this.alertService.invalidLogin(error.error.message);
      }
    );
  }
  private subscribeToDarkMode(): void {
    this.themeService.darkMode$.subscribe((mode: any) => {
      this.isDarkMode = mode;
    });
  }
  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode
  }

  /** Almacena los datos del usuario en sessionStorage */
  private storeUserData(response: any): void {
    if (response.user.isSuperUser) {
      sessionStorage.setItem('isSuperUser', response.user.isSuperUser);
    }
    sessionStorage.setItem('access_token', response.accessToken);
    sessionStorage.setItem('refresh_token', response.refreshToken);
    sessionStorage.setItem('email', response.user.email);
    sessionStorage.setItem('role', response.user.role);
    sessionStorage.setItem('id', response.user.id);
  }

  /** Redirige al dashboard según el rol del usuario */
  private redirectBasedOnRole(role: string): void {
    if (role === 'ADMIN') {
      this.router.navigateByUrl('/admin/dashboard');
    } else {
      this.router.navigateByUrl('/dashboard');
    }
  }

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible
  }
}