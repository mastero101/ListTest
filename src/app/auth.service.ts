import { Injectable } from '@angular/core';
import axios from 'axios';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth_Url = 'https://nodemysql12.duckdns.org:443';
  private auth_Url2 = 'http://localhost:3000'; // Cambia esta URL con la URL backend

  // BehaviorSubject para emitir el estado de autenticación
  private isAuthenticatedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isAuthenticated: Observable<boolean> = this.isAuthenticatedSubject.asObservable();

  constructor() {}

  login(usuario: string, contrasena: string) {
    const formData = { id_usuario: usuario, password: contrasena };
    return axios.post(`${this.auth_Url}/users/auth`, formData)
        .then(response => {
            if (response.data.message === 'Login successful') {
                localStorage.setItem('token', response.data.token); // Almacena el token en el almacenamiento local
                this.isAuthenticatedSubject.next(true); // Actualiza el estado de autenticación a true
                return response;
            } else {
                throw new Error('Authentication error');
            }
        });
  }

  logout() {
    // Limpiar el token del almacenamiento local u otras tareas relacionadas con el cierre de sesión
    localStorage.removeItem('token');
    localStorage.removeItem('id_usuario');
    this.isAuthenticatedSubject.next(false); // Actualiza el estado de autenticación a false al cerrar la sesión
  }

  // Método para verificar si el usuario está autenticado
  checkAuthentication() {
    return this.isAuthenticatedSubject.value;
  }
}
