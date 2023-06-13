import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import axios from 'axios';

interface Registro {
  id: string;
  tipo: string;
  modelo: string;
  precio: number;
  url: string;
  tienda: string;
}

@Component({
  selector: 'app-editparts',
  templateUrl: './editparts.component.html',
  styleUrls: ['./editparts.component.scss']
})
export class EditpartsComponent {
  registroForm: FormGroup = new FormGroup({});
  modeloBusqueda: any;
  modelo: any;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.registroForm = this.formBuilder.group({
      id: ['', Validators.required],
      tipo: ['', Validators.required],
      modelo: ['', Validators.required],
      precio: ['', Validators.required],
      url: ['', Validators.required],
      tienda: ['', Validators.required],
    });
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

  guardar() { 
    const data = this.registroForm.value;
    
    // Realiza la solicitud POST utilizando Axios
    console.log(data);
    axios.put('https://nodemysql12.duckdns.org:443/', data)
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

  buscar() {
    axios.get(`https://nodemysql12.duckdns.org:443/modelo/${this.modelo}`)
      .then((response) => {
        // Verifica si se encontró el elemento
        if (response.data) {
          // Puedes asignar los datos recuperados al formulario de edición para prellenarlos
          this.registroForm.patchValue(response.data);
          console.log(response.data);
        } else {
          // Maneja el caso en el que no se encuentre el elemento
          alert('No se encontró el elemento');
        }
      })
      .catch((error) => {
        console.error('Error al buscar el elemento:', error);
        // Puedes mostrar un mensaje de error al usuario o realizar acciones adicionales según tus necesidades
      });
  }

}
