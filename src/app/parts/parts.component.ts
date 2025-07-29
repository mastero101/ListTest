import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import axios from 'axios';

import { NavbarComponent } from '../navbar/navbar.component';

interface Registro {
  tipo: string;
  modelo: string;
  precio: number;
  url: string;
  img: string;
  tienda: string;
  consumo: string;
  socket: string;
  rams: string;
  potencia: string;
}

@Component({
  selector: 'app-parts',
  templateUrl: './parts.component.html',
  styleUrls: ['./parts.component.scss']
})

export class PartsComponent {
  registroForm: FormGroup = new FormGroup({});
  idInit: number = 0;;
  idInit2: any;
  componenteControl = new FormControl();
  tuFormulario: FormGroup = this.formBuilder.group({
    tipo: [''],
    socket: ['']
  });
  mostrarSocket: boolean = false;
  mostrarRam: boolean = false;
  mostrarPotencia: boolean = false;

  constructor(private formBuilder: FormBuilder, private navbarComponent: NavbarComponent) { }

  ngOnInit() {
    this.registroForm = this.formBuilder.group({
      tipo: ['', Validators.required],
      modelo: ['', Validators.required],
      precio: ['', Validators.required],
      url: ['',],
      img: ['', Validators.required],
      tienda: ['', Validators.required],
      consumo: ['', Validators.required],
      socket: [''],
      rams: [''],
      potencia: [''],
    });
    this.recoverid();
    this.navbarComponent.showToggleButton = true;
  }

  onSubmit() {
    if (this.registroForm.invalid) {
      return;
    }
    
    const registro: Registro = this.registroForm.value;
    
    // Guardar datos en el localStorage
    localStorage.setItem('registro', JSON.stringify(registro));
    this.guardar();
  }

  guardar() { 
    const data = this.registroForm.value;
    
    // Realiza la solicitud POST utilizando Axios
    axios.post('https://nodemysql12.duckdns.org:443/components/', data)
      .then((response) => {
        // Maneja la respuesta exitosa de la inserción en la base de datos
        console.log('Datos guardados exitosamente:', response.data);
      })
      .catch((error) => {
        // Maneja el error en caso de que la inserción falle
        console.error('Error al guardar los datos:', error);
        // Puedes mostrar un mensaje de error al usuario o realizar acciones adicionales según tus necesidades
      });
    alert("Registrado");
  }

  recoverid(){
    axios
      .get(`https://nodemysql12.duckdns.org:443/components/`)
      .then(response => {
        this.idInit = response.data[response.data.length - 1].id;
        this.idInit = this.idInit+1;
        this.idInit2 = ("ID: " + this.idInit);
        console.log(response);
      })
      .catch(error => {
        console.log(error);
      });
  }

  onComponenteChange(event: any) {
    const selectedComponente = event.value;
    this.mostrarSocket = selectedComponente === 'procesador' || selectedComponente === 'motherboard';
    this.mostrarRam = selectedComponente === 'motherboard' || selectedComponente === 'ram';
    this.mostrarPotencia = selectedComponente === 'psu';
  }

}
