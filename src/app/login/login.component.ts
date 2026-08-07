import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthService } from '../auth.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    standalone: false
})
export class LoginComponent implements OnInit {
  usuario: string = '';
  contrasena: string = '';
  hidePassword: boolean = true;

  constructor(private router: Router, private authService: AuthService, private snackBar: MatSnackBar) { }

  ngOnInit() {
  }

  onSubmit() {
    this.authService.login(this.usuario, this.contrasena)
      .then((response) => {

        if (response.data.message === 'Login exitoso') {
          console.log("Inicio Exitoso");
          this.snackBar.open('¡Inicio de sesión exitoso!', 'Cerrar', {
            duration: 3000
          });
          localStorage.setItem('id_usuario', this.usuario);
          this.router.navigate(['/profile']);
        } else {
          console.log('Error de autenticación:', response.data.message);
          this.snackBar.open('Usuario y/o contraseña incorrectos.', 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      })
      .catch((error) => {
        console.log('Error de autenticación:', error);
        this.snackBar.open('Error de inicio de sesión, usuario o contraseña incorrectos.', 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      });
  }

}
