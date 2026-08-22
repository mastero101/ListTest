import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

import { environment } from '../../environments/environment';

@Component({
    selector: 'app-register-user',
    templateUrl: './register-user.component.html',
    styleUrls: ['./register-user.component.scss'],
    standalone: false
})
export class RegisterUserComponent implements OnInit {
  registrationForm: FormGroup = new FormGroup({});
  endpoint = environment.apiUrl;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    const id_usuario = uuidv4().slice(0, 6);

    this.registrationForm = this.formBuilder.group({
      nombre: ['', Validators.required],
      img: ['', Validators.required],
      id_usuario: [id_usuario, Validators.required],
      direccion: ['', Validators.required],
      telefono: ['', Validators.required],
      password: ['', Validators.required],
      correo: ['', Validators.required],
    });
  }

  onSubmit() {
    if (!this.registrationForm.valid) return;

    const formData = this.registrationForm.value;

    axios.post(this.endpoint + '/users/register', formData)
      .then(() => {
        this.snackBar.open('¡Usuario registrado!', 'Aceptar', { duration: 3000 });
        this.router.navigate(['/login-user']);
      })
      .catch(error => {
        const message = error.response?.data?.message || 'Error al registrar el usuario.';
        this.snackBar.open(message, 'Cerrar', { duration: 5000 });
      });
  }

}
