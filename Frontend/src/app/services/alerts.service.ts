import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertsService {

  constructor(
    private router: Router
  ) { }

  showSuccess(message: string = 'Operación realizada con éxito.') {
    Swal.fire({
      title: 'Éxito',
      text: message,
      icon: 'success',
      toast: true,
      position: 'bottom-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      customClass: {
        popup: 'colored-toast',
        icon: 'colored-toast-success'
      }
    });
  }

  showError(message: string = 'Hubo un problema en la operación.') {
    Swal.fire({
      title: 'Error',
      text: message,
      icon: 'error',
      toast: true,
      position: 'bottom-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      customClass: {
        popup: 'colored-toast',
        icon: 'colored-toast-error'
      }
    });
  }
  invalidLogin(message:string) {
    const Toast = Swal.mixin({
      toast: true,
      position: 'bottom-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    })
    Toast.fire({
      icon: 'error',
      title: message
    })
    return Toast
  }
  showConfirmation(): Promise<boolean> {
    return Swal.fire({
      title: "Estás seguro?",
      text: "¡No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      cancelButtonText: "Cancelar",
      confirmButtonText: "Sí, estoy seguro",
      customClass: {
        cancelButton: 'order-1',
        confirmButton: 'order-2',
      },
    }).then((result) => {
      return result.isConfirmed;
    });
  }
  showSessionExpiredAlert(message: string = 'Tu sesión ha caducado. Por favor, inicia sesión nuevamente.') {
    Swal.fire({
      title: 'Sesión Expirada',
      text: message,
      iconHtml: '<i class="bx bx-time bx-tada" style="color: #ff4d4d; font-size: 3rem;"></i>',
      showConfirmButton: true,
      confirmButtonText: 'Iniciar sesión',
      confirmButtonColor: '#3085d6',
      allowOutsideClick: false,
      allowEscapeKey: false
    }).then(() => {
      this.router.navigate(['/login']);  
    });
  }
  showNoPermissionAlert() {
    Swal.fire({
      title: 'Acceso Denegado',
      text: 'No tienes permiso para acceder a este recurso.',
      iconHtml: '<i class="bx bx-lock bx-tada" style="color: #ff4d4d; font-size: 3rem;"></i>',
      showConfirmButton: true,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#d33',
      allowOutsideClick: false,
      allowEscapeKey: false
    });
  }
}
