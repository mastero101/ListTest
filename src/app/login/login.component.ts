import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  usuario: string = '';
  contrasena: string = '';

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit() {
  }
  
  onSubmit() {
    this.authService.login(this.usuario, this.contrasena)
    .then((response) => {
      
      if (response.data.message === 'Login successful') {
        console.log("Inicio Exitoso");
        alert("Login Successful")
        localStorage.setItem('id_usuario', this.usuario);
        this.router.navigate(['/profile']);
      } else {
        console.log('Error de autenticación:', response.data.message);
      }
    })
    .catch((error) => {
      console.log('Error de autenticación:', error);
      alert("Error de Inicio de Sesion, usuario o contraseña incorrectos");
    });
  }

}
