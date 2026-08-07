import { Component, ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';

import { NavigationEnd, Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { ApiService } from '../api.service';

const MOBILE_BREAKPOINT = '(max-width: 960px)';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss'],
    standalone: false
})
export class NavbarComponent implements OnInit, OnDestroy {
  opened = false;
  darkTheme = false;
  showToggleButton = true;
  isAuthenticated = false;
  isMobile = false;

  private readonly _onDestroy = new Subject<void>();

  constructor(
    private changeDetector: ChangeDetectorRef,
    private router: Router,
    private authService: AuthService,
    private breakpointObserver: BreakpointObserver
  ) {
    // Suscribirse al cambio en el estado de autenticación
    this.authService.isAuthenticated.subscribe(isAuthenticated => {
      this.isAuthenticated = isAuthenticated;
    });
  }

  ngOnInit(): void {
    this.breakpointObserver
      .observe([MOBILE_BREAKPOINT])
      .pipe(takeUntil(this._onDestroy))
      .subscribe(result => {
        this.isMobile = result.matches;
      });

    // En mobile el sidenav se abre como overlay (mode="over"), así que se cierra
    // automáticamente al navegar a otra ruta en vez de quedar empujando el contenido.
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntil(this._onDestroy)
      )
      .subscribe(() => {
        if (this.isMobile) {
          this.opened = false;
        }
      });
  }

  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
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
