import { Component } from '@angular/core';
import { ThemeService } from '../../../services/theme.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  isDarkMode: boolean = false;
  email !: string
  redirectUrl: string = '';


  constructor(
    private themeService: ThemeService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.subscribeToDarkMode();
    this.setEmail();
    this.setRedirectUrl();
  }
  
  private subscribeToDarkMode(): void {
    this.themeService.darkMode$.subscribe((mode: any) => {
      this.isDarkMode = mode;
    });
  }
  
  private setEmail(): void {
    this.email = sessionStorage.getItem('email') || '';
  }
  
  private setRedirectUrl(): void {
    if (this.authService.hasRole(['ADMIN'])) {
      this.redirectUrl = '/admin/dashboard';
    } else {
      this.redirectUrl = '/dashboard';
    }
  }
  
  logout(): void {
    this.authService.logout();
  }
}
