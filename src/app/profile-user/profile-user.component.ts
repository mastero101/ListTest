import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ApiService } from '../api.service';

@Component({
  selector: 'app-profile-user',
  templateUrl: './profile-user.component.html',
  styleUrls: ['./profile-user.component.scss']
})
export class ProfileUserComponent implements OnInit{
  ordenes: any [] = [];
  nombre: any;
  id_usuario: any;
  telefono: any;
  direccion: any;
  img: any;

  constructor(private apiService: ApiService, private router: Router) { }

  ngOnInit() {
    this.getUsuarios();
  }

  async getUsuarios() {
    try {
      const idUsuario = localStorage.getItem('id_usuario');
  
      if (!idUsuario) {
        console.error('No se encontró el id_usuario en el almacenamiento local');
        return;
      }
  
      const users = await this.apiService.getUsuarios();
      
      if (!users || users.length === 0) {
        console.log(`No se encontraron datos de usuarios`);
        return;
      }
  
      // Buscar el conjunto de datos por id_usuario
      const usuario = users.find((users) => users.id_usuario === idUsuario);
  
      if (!usuario) {
        console.log(`No se encontró ningún usuario con id_usuario ${idUsuario}`);
        return;
      }
  
      this.nombre = usuario.nombre;
      this.img = usuario.img;
      this.id_usuario = usuario.id_usuario;
      this.direccion = usuario.direccion;
      this.telefono = usuario.telefono;
    } catch (error) {
      console.error('Error al obtener los datos del usuario:', error);
    }
  }

  logout() {
    // Eliminar el token JWT del almacenamiento local
    localStorage.removeItem('token');
    localStorage.removeItem('id_usuario');
    
    // Redirigir al usuario a la página de inicio de sesión
    this.router.navigate(['/login']);
  }
}
