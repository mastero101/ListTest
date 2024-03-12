import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth_Url2 = 'https://masteros.cloud';
  private auth_Url = 'http://localhost:3000'; // Cambia esta URL con la URL real de tu backend

  constructor() { }

  login(usuario: string, contrasena: string) {
    const formData = { id_usuario: usuario, password: contrasena };
    return axios.post(`${this.auth_Url}/auth`, formData)
        .then(response => {
            if (response.data.message === 'Login successful') {
                localStorage.setItem('token', response.data.token); // Almacena el token en el almacenamiento local
                return response;
            } else {
                throw new Error('Authentication error');
            }
        });
}
}
