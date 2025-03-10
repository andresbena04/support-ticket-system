import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './unauthorized.component.html',
  styleUrl: './unauthorized.component.css'
})
export class UnauthorizedComponent {
  redirectUrl: string = '';

  constructor(
    private authService: AuthService
  ) { }

  ngOnInit(): void {

    if (this.authService.hasRole(['ADMIN'])) {
      this.redirectUrl = '/admin/dashboard'; // Si es admin, redirige a dashboard de admin
    } else if (this.authService.hasRole(['USER'])) {
      this.redirectUrl = '/dashboard'; 
    } else {
      this.redirectUrl = '/login';
    }
  }
}
