import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-register-user',
  templateUrl: './register-user.component.html',
  styleUrls: ['./register-user.component.scss']
})
export class RegisterUserComponent implements OnInit {
  registrationForm: FormGroup = new FormGroup({});
  endpoint = 'https://nodemysql12.duckdns.org:443'
  endpoint2 = 'http://localhost:3000'

  constructor(private formBuilder: FormBuilder, private router: Router) { }

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
    if (this.registrationForm.valid) {
      const formData = this.registrationForm.value;
      const idUsuario = this.registrationForm.value.id_usuario;
      const password = this.registrationForm.value.password;
      const telefono = this.registrationForm.value.telefono;
      const correo = this.registrationForm.value.correo;

       // Realiza la solicitud HTTP con Axios
       axios.post(this.endpoint + '/users/register', formData)
       .then(response => {
         console.log(response.data);
       })
       .catch(error => {
         console.error('Error al registrar el usuario:', error.response.data.message);
       });

      alert("Usuario Registrado")
      // Envio de SMS de confirmacion
      this.sendSMS(idUsuario , password, telefono);

      // Envio de Email de confirmacion
      this.sendEmail(idUsuario, password, telefono, correo);

      // Limpiar el formulario
      window.location.reload()

      // Redirigir a la página de inicio de sesión
      this.router.navigate(['/login-user']);
    }
  }

  sendSMS(idUsuario: string, password: string, telefono: string) {
    const data = new URLSearchParams();
    data.append('id_usuario', idUsuario);
    data.append('password', password);
    data.append('telefono', telefono);
    
    return axios.post(this.endpoint + '/sms', data.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  }

  sendEmail(idUsuario: string, password: string, telefono: string, correo: string) {
    const emailData = {
      id_usuario: idUsuario,
      password: password,
      telefono: telefono,
      correo: correo,
    };

    // Realizar la solicitud HTTP para enviar el correo electrónico
    axios.post(this.endpoint + '/send_email', emailData)
      .then(response => {
        console.log('Correo electrónico enviado:', response.data);
      })
      .catch(error => {
        console.error('Error al enviar el correo electrónico:', error);
      });
  }

}
