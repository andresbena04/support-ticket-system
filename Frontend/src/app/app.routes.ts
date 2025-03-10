import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { DashboardAdminComponent } from './components/admin/dashboard/dashboard.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { authGuard } from './helpers/auth.guard';
import { UsersComponent } from './components/admin/users/users.component';
import { roleGuard } from './helpers/role.guard';
import { UsersFormComponent } from './components/admin/users/UserForm/usersForm.component';
import { UnauthorizedComponent } from './components/pages/unauthorized/unauthorized.component';
import { superUserGuard } from './helpers/superuser.guard';
import { TicketsAdminComponent } from './components/admin/tickets/tickets.component';
import { TicketFormComponent } from './components/form/ticket-form/ticket-form.component';
import { ResetPasswordComponent } from './components/pages/reset-password/reset-password.component';
import { TicketViewComponent } from './components/ticket-view/ticket-view.component';
import { ticketStatusGuard } from './helpers/ticket-status.guard';
import { TicketsComponent } from './components/tickets/tickets.component';
import { UserUploadComponent } from './components/admin/users/user-upload/user-upload.component';
import { ChangePasswordComponent } from './components/pages/change-password/change-password.component';
import { ProfileComponent } from './components/profile/profile.component';

export const routes: Routes = [
    //Routes Authentication
    { path: 'login', component: LoginComponent },
    //Routes rol ADMIN
    { path: 'admin/dashboard', component: DashboardAdminComponent, canActivate: [authGuard, roleGuard], data: { roles: ['ADMIN'] } },
    { path: 'admin/users', component: UsersComponent, canActivate: [authGuard, roleGuard], data: { roles: ['ADMIN'] } },
    { path: 'admin/users/new', component: UsersFormComponent, canActivate: [authGuard, roleGuard, superUserGuard], data: { roles: ['ADMIN'] } },
    { path: 'admin/users/upload', component: UserUploadComponent, canActivate: [authGuard, roleGuard, superUserGuard], data: { roles: ['ADMIN'] } },
    { path: 'admin/users/edit/:id', component: UsersFormComponent, canActivate: [authGuard, roleGuard, superUserGuard], data: { roles: ['ADMIN'] } },
    { path: 'admin/tickets', component: TicketsAdminComponent, canActivate: [authGuard, roleGuard], data: { roles: ['ADMIN'] } },
    { path: 'admin/tickets/view/:id', component: TicketViewComponent, canActivate: [authGuard, roleGuard], data: { roles: ['ADMIN'] } },
    { path: 'admin/tickets/edit/:id', component: TicketFormComponent, canActivate: [authGuard, roleGuard, ticketStatusGuard], data: { roles: ['ADMIN'] } },
    //Routes rol USER
    { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard, roleGuard], data: { roles: ['USER'] } },
    { path: 'tickets', component: TicketsComponent, canActivate: [authGuard, roleGuard], data: { roles: ['USER'] } },
    { path: 'tickets/new', component: TicketFormComponent, canActivate: [authGuard] },
    { path: 'tickets/view/:id', component: TicketViewComponent, canActivate: [authGuard] },
    { path: 'tickets/edit/:id', component: TicketFormComponent, canActivate: [authGuard, roleGuard, ticketStatusGuard], data: { roles: ['USER'] } },
    { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
    //Routes Password
    { path: 'change-password', component: ChangePasswordComponent, canActivate: [authGuard] },
    { path: 'reset-password', component: ResetPasswordComponent }, // Para solicitar el enlace
    { path: 'reset-password/:token', component: ResetPasswordComponent },// Para actualizar la contraseña
    // Routes pages
    { path: 'unauthorized', component: UnauthorizedComponent, canActivate: [authGuard] },
    //{ path: '', redirectTo: 'dashboard', pathMatch: 'full', canActivate: [authGuard] },
    { path: '**', component: DashboardComponent, canActivate: [authGuard] }
];
