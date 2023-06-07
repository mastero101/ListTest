import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import axios from 'axios';

interface Registro {
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  fecha_nacimiento: string;
  escolaridad: string;
  genero: string;
  correo_electronico: string;
  estado: string;
  municipio: string;
  colonia: string;
  calle: string;
  codigo_postal: string;
  numero_exterior: string;
  numero_interior: string;
  tel_celular: string;
  tel_fijo: string;
  victima: string;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})

export class RegisterComponent implements OnInit{
  registroForm: FormGroup = new FormGroup({});
  folio: number = 0;
  maxFolio: string = '';

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.registroForm = this.formBuilder.group({
      nombre: ['', Validators.required],
      apellido_paterno: ['', Validators.required],
      apellido_materno: ['', Validators.required],
      fecha_nacimiento: ['', Validators.required],
      genero: ['', Validators.required],
      escolaridad: ['', Validators.required],
      correo_electronico: ['', [Validators.required, Validators.email]],
      estado: ['', Validators.required],
      municipio: ['', Validators.required],
      colonia: ['', Validators.required],
      calle: ['', Validators.required],
      codigo_postal: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
      no_exterior: ['', Validators.required],
      no_interior: [],
      tel_celular: ['', [Validators.required, Validators.pattern(/^\d{10}$|^\d{12}$/)]],
      tel_fijo: [],
      es_victima: ['', Validators.required],
    });

    // Recuperar datos del localStorage al cargar la página
    const savedRegistro = localStorage.getItem('registro');
    if (savedRegistro) {
      this.registroForm.setValue(JSON.parse(savedRegistro));
      console.log(this.registroForm.value);
    }

    this.obtenerFolio();
  }

  onSubmit() {
    if (this.registroForm.invalid) {
      return;
    }
    
    const registro: Registro = this.registroForm.value;
    console.log(registro);
    
    // Guardar datos en el localStorage
    localStorage.setItem('registro', JSON.stringify(registro));
    this.guardar();
  }

  obtenerFolio() {
    axios.get('https://nodemysql12.duckdns.org:3001/folio')
      .then(response => {
        this.maxFolio = response.data.maxFolio;
        const ultimoNumero = Number(this.maxFolio);
        const nuevoNumero = ultimoNumero + 1;
        this.folio = nuevoNumero;
        console.log('Ultimo Folio:', this.maxFolio);
        console.log('Nuevo folio:', this.folio);
      })
      .catch(error => {
        console.error('Error al obtener el último folio', error);
      });
  }

  guardar() {
    const fechaNacimiento = new Date(this.registroForm.value.fecha_nacimiento);
    const fechaNacimientoFormatted = fechaNacimiento.toISOString().split('T')[0];
    
    const data = this.registroForm.value;
      data.id_denunciante = 1;
      data.folio = this.folio;
      data.fecha_nacimiento = fechaNacimientoFormatted;
    
    // Realiza la solicitud POST utilizando Axios
    console.log(data);
    axios.post('https://nodemysql12.duckdns.org:3001/victimas', data)
      .then((response) => {
        // Maneja la respuesta exitosa de la inserción en la base de datos
        console.log('Datos guardados exitosamente:', response.data);
      })
      .catch((error) => {
        // Maneja el error en caso de que la inserción falle
        console.error('Error al guardar los datos:', error);
        // Puedes mostrar un mensaje de error al usuario o realizar acciones adicionales según tus necesidades
      });

  }

  clear(){
    localStorage.removeItem('registro');
    console.log("Clear LocalStorage");
  }
}


