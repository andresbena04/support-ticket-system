import { Component } from '@angular/core';
import { SidebarComponent } from '../layout/sidebar/sidebar.component';
import { NavbarComponent } from '../layout/navbar/navbar.component';
import { ThemeService } from '../../services/theme.service';
import { UsersService } from '../../services/users.service';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TicketsService } from '../../services/tickets.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [SidebarComponent, NavbarComponent, DatePipe, RouterLink, CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {

  isDarkMode: boolean = false
  dataUsers: any = {};
  tickets: any[] = [];
  userID!: string
  ticketTotal: number = 0
  ticketInProgress: number = 0
  ticketResolved: number = 0
  constructor(
    private themeService: ThemeService,
    private usersService: UsersService,
    private ticketsService: TicketsService
  ) { }

  ngOnInit(): void {
    this.userID = sessionStorage.getItem('id') || ''
    this.subscribeToDarkMode()
    this.loadUser()
    this.getTicketsbyUser()
  }

  private subscribeToDarkMode(): void {
    this.themeService.darkMode$.subscribe((mode: any) => {
      this.isDarkMode = mode;
    });
    console.log(this.isDarkMode)
  }
  loadUser(): void {
    this.usersService.getProfile(this.userID).subscribe({
      next: (res) => {
        this.dataUsers = res
      }, error: (error) => {
        console.log(error)
      }
    })
  }
  getTicketsbyUser() {
    this.ticketsService.getTicketsbyUserId(this.userID).subscribe({
      next: (response) => {
        this.tickets = response;
        this.ticketTotal = this.tickets.length;

        // Contar tickets según su estado
        this.ticketInProgress = this.tickets.filter(ticket => ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS').length;
        this.ticketResolved = this.tickets.filter(ticket => ticket.status === 'CLOSED').length;
      },
      error: (err) => {
        console.error('Error en la petición:', err);
      }
    });
  }
}
