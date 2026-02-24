import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
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
    styleUrls: ['./parts.component.scss'],
    standalone: false
})

export class PartsComponent implements OnInit {
  registroForm: FormGroup;
  idInit: number = 0;
  idInit2: string = '';

  mostrarSocket: boolean = false;
  mostrarRam: boolean = false;
  mostrarPotencia: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private navbarComponent: NavbarComponent,
    private snackBar: MatSnackBar
  ) {
    this.registroForm = this.formBuilder.group({
      tipo: ['', Validators.required],
      modelo: ['', Validators.required],
      precio: ['', [Validators.required, Validators.min(0)]],
      url: ['', [Validators.pattern('https?://.+')]],
      img: ['', Validators.required],
      tienda: ['', Validators.required],
      consumo: ['', [Validators.required, Validators.min(0)]],
      socket: [''],
      rams: [''],
      potencia: ['', [Validators.min(0)]],
    });
  }

  ngOnInit() {
    this.recoverid();
    this.navbarComponent.showToggleButton = true;
  }

  onSubmit() {
    if (this.registroForm.invalid) {
      this.snackBar.open('Por favor, completa correctamente todos los campos requeridos.', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const registro: Registro = this.registroForm.value;

    // Guardar datos en el localStorage (opcional)
    localStorage.setItem('registro', JSON.stringify(registro));
    this.guardar();
  }

  guardar() {
    const data = this.registroForm.value;

    axios.post('https://nodemysql12.duckdns.org:443/components/', data)
      .then((response) => {
        console.log('Datos guardados exitosamente:', response.data);
        this.snackBar.open('¡Componente registrado exitosamente!', 'Excelente', {
          duration: 3000
        });
        this.resetForm();
        this.recoverid(); // Refresh ID
      })
      .catch((error) => {
        console.error('Error al guardar los datos:', error);
        this.snackBar.open('Error al registrar el componente. Intenta de nuevo.', 'Cerrar', {
          duration: 5000
        });
      });
  }

  recoverid() {
    axios
      .get(`https://nodemysql12.duckdns.org:443/components/`)
      .then(response => {
        if (response.data && response.data.length > 0) {
          this.idInit = response.data[response.data.length - 1].id + 1;
        } else {
          this.idInit = 1;
        }
        this.idInit2 = "ID: " + this.idInit;
      })
      .catch(error => {
        console.error('Error al recuperar ID:', error);
      });
  }

  onComponenteChange(event: any) {
    const selectedComponente = event.value;
    this.updateVisibleFields(selectedComponente);
  }

  updateVisibleFields(tipo: string) {
    this.mostrarSocket = tipo === 'procesador' || tipo === 'motherboard';
    this.mostrarRam = tipo === 'motherboard' || tipo === 'ram';
    this.mostrarPotencia = tipo === 'psu';

    // Clear fields that are no longer visible
    if (!this.mostrarSocket) this.registroForm.patchValue({ socket: '' });
    if (!this.mostrarRam) this.registroForm.patchValue({ rams: '' });
    if (!this.mostrarPotencia) this.registroForm.patchValue({ potencia: '' });
  }

  resetForm() {
    this.registroForm.reset();
    this.mostrarSocket = false;
    this.mostrarRam = false;
    this.mostrarPotencia = false;
  }
}
