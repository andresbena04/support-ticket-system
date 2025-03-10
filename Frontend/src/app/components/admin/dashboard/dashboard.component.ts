import { Component } from '@angular/core';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { NavbarComponent } from '../../layout/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { MetricsComponent } from './metrics/metrics.component';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [SidebarComponent, CommonModule, NavbarComponent, MetricsComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardAdminComponent {

  isDarkMode: boolean = false;
  
  constructor(
    private themeService: ThemeService
  ) { }
  ngOnInit() { 
   this.subscribeToDarkMode()
  }

  private subscribeToDarkMode(): void {
    this.themeService.darkMode$.subscribe((mode: any) => {
      this.isDarkMode = mode;
    });
  }
}
