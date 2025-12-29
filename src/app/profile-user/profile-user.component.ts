import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ApiService } from '../api.service';
import { AuthService } from '../auth.service';
import { ChangePhotoDialogComponent } from './change-photo-dialog/change-photo-dialog.component';

@Component({
  selector: 'app-profile-user',
  templateUrl: './profile-user.component.html',
  styleUrls: ['./profile-user.component.scss']
})
export class ProfileUserComponent implements OnInit {
  profileForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    telefono: ['', [Validators.pattern('^[0-9+\-\s()]*$')]],
    direccion: ['']
  });

  isEditMode = false;
  configuraciones: any[] = [];
  nombre: string = '';
  id_usuario: string = '';
  telefono: string = '';
  direccion: string = '';
  img: string = 'assets/default-avatar.png';
  isLoading = true;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private authService: AuthService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.loadUserData();
  }

  private initForm() {
    // El formulario ya se inicializa en la declaración de la propiedad
  }

  async loadUserData() {
    try {
      this.isLoading = true;
      const idUsuario = localStorage.getItem('id_usuario');

      if (!idUsuario) {
        console.error('No se encontró el id_usuario en el almacenamiento local');
        this.router.navigate(['/login']);
        return;
      }

      const users = await this.apiService.getUsuarios();

      if (!users || users.length === 0) {
        console.log('No se encontraron datos de usuarios');
        return;
      }

      const usuario = users.find(u => u.id_usuario === idUsuario);

      if (!usuario) {
        console.log(`No se encontró ningún usuario con id_usuario ${idUsuario}`);
        return;
      }

      this.nombre = usuario.nombre;
      this.img = usuario.img;
      this.id_usuario = usuario.id_usuario;
      this.direccion = usuario.direccion;
      this.telefono = usuario.telefono;

      // Cargar las configuraciones del usuario
      await this.loadUserConfiguraciones();

      // Actualizar el formulario con los datos del usuario
      this.profileForm.patchValue({
        nombre: this.nombre,
        telefono: this.telefono,
        direccion: this.direccion
      });
    } catch (error) {
      console.error('Error al cargar los datos del usuario:', error);
      this.snackBar.open('Error al cargar los datos del perfil', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.isLoading = false;
    }
  }

  async loadUserConfiguraciones() {
    try {
      // Simulación de carga de configuraciones guardadas
      await this.simulateApiCall(() => {
        // Datos de ejemplo de configuraciones guardadas
        this.configuraciones = [
          { id_config: '618', nombre: 'PC Gaming Entrada', fecha: new Date(), precio: 1250 },
          { id_config: '620', nombre: 'Workstation Pro', fecha: new Date(Date.now() - 86400000), precio: 2400 },
          { id_config: '622', nombre: 'Build Ultra 4K', fecha: new Date(Date.now() - 172800000), precio: 3500 }
        ];
      });
    } catch (error) {
      console.error('Error al cargar las configuraciones:', error);
      this.configuraciones = [];
    }
  }

  // Función auxiliar para simular llamadas a la API
  private async simulateApiCall(callback: () => void): Promise<void> {
    this.isLoading = true;
    try {
      // Simular retraso de red
      await new Promise(resolve => setTimeout(resolve, 800));
      callback();
    } catch (error) {
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode) {
      this.profileForm.patchValue({
        nombre: this.nombre,
        telefono: this.telefono,
        direccion: this.direccion
      });
    }
  }

  cancelEdit() {
    this.isEditMode = false;
  }

  async saveProfile() {
    if (this.profileForm.invalid) {
      return;
    }

    try {
      const formData = this.profileForm.value;

      // Actualizar los datos locales
      this.nombre = formData.nombre;
      this.telefono = formData.telefono;
      this.direccion = formData.direccion;

      // Actualizar el perfil del usuario (simulación)
      await this.simulateApiCall(() => {
        // En una aplicación real, esto se haría con una llamada HTTP
        // await this.apiService.actualizarUsuario(this.id_usuario, formData).toPromise();
        console.log('Perfil actualizado:', formData);
      });

      this.isEditMode = false;

      this.snackBar.open('Perfil actualizado correctamente', 'Cerrar', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    } catch (error) {
      console.error('Error al guardar los cambios:', error);
      this.snackBar.open('Error al guardar los cambios', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }

  openEditPhotoDialog() {
    const dialogRef = this.dialog.open(ChangePhotoDialogComponent, {
      width: '400px',
      data: { currentPhoto: this.img }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.img = result.photoUrl;
        // Aquí iría la lógica para guardar la nueva foto en el servidor
        this.snackBar.open('Foto de perfil actualizada', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
