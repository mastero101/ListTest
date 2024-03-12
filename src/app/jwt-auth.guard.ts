import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JwtAuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      const token = localStorage.getItem('token');

      if (token) {
        // Si el token no ha expirado, permitir el acceso a la ruta
        return true;
      } else {
        // Si no hay token, redirigir al usuario a la página de inicio de sesión
        this.router.navigate(['/login']);
        return false;
      }
  }
  
}
