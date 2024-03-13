import { Component, ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../auth.service';

import { Router } from '@angular/router';

import { ApiService } from '../api.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent{
  opened = false;
  darkTheme = false;
  showToggleButton = true;
  isAuthenticated = false;

  constructor(private changeDetector: ChangeDetectorRef, private router: Router, private authService: AuthService) {
    // Suscribirse al cambio en el estado de autenticación
    this.authService.isAuthenticated.subscribe(isAuthenticated => {
      this.isAuthenticated = isAuthenticated;
    });
  }

  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }

  toggleSidebar() {
    this.opened = !this.opened;
  }

  toggleTheme() {
    this.darkTheme = !this.darkTheme;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

}
