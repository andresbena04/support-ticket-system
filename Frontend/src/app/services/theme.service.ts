import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private darkMode = new BehaviorSubject<boolean>(this.getSavedTheme());
  darkMode$ = this.darkMode.asObservable();

  toggleDarkMode() {
    const newMode = !this.darkMode.value;
    this.darkMode.next(newMode);
    localStorage.setItem('darkMode', String(newMode));
    document.body.classList.toggle('dark-mode', newMode);
  }

  private getSavedTheme(): boolean {
    return localStorage.getItem('darkMode') === 'true';
  }
}
