import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ThemeService } from '../../../services/theme.service';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {

  isCollapsed: boolean = true;
  isDarkMode: boolean = false;
  redirectUrl: string = '';
  redirectUrlTickets: string = '';
  constructor(
    private themeService: ThemeService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.subscribeToDarkMode()
    this.setRedirectUrl()
  }

  private subscribeToDarkMode(): void {
    this.themeService.darkMode$.subscribe((mode: any) => {
      this.isDarkMode = mode;
    });
  }
  private setRedirectUrl(): void {
    if (this.authService.hasRole(['ADMIN'])) {
      this.redirectUrl = '/admin/dashboard';
      this.redirectUrlTickets = '/admin/tickets';
    } else {
      this.redirectUrl = '/dashboard';
      this.redirectUrlTickets = '/tickets';
    }
  }
  isActive(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(route.replace(':id', ''));
  }
  
  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }
  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
  
  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
}
