import { Component } from '@angular/core';
import { NavbarComponent } from '../layout/navbar/navbar.component';
import { SidebarComponent } from '../layout/sidebar/sidebar.component';
import { ThemeService } from '../../services/theme.service';
import { MetricsComponent } from './metrics/metrics.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NavbarComponent, SidebarComponent, MetricsComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

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
