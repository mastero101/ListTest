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
  consumo: string;
}

@Component({
  selector: 'app-editparts',
  templateUrl: './editparts.component.html',
  styleUrls: ['./editparts.component.scss']
})
export class EditpartsComponent {
  items: { precio: number; tipo: string; modelo: string; tienda: string; url: string; consumo: string }[] = [];
  registroForm: FormGroup = new FormGroup({});
  modeloBusqueda: any;
  modelo: any;
  elementoid: any;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.registroForm = this.formBuilder.group({
      id: ['', Validators.required],
      tipo: ['', Validators.required],
      modelo: ['', Validators.required],
      precio: ['', Validators.required],
      url: ['', Validators.required],
      tienda: ['', Validators.required],
      consumo: ['', Validators.required],
    });
    this.recoverProcesadores();
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

  onSelectionChange(selectedItem: any) {
    this.registroForm.patchValue({
        id: selectedItem.id,
        tipo: selectedItem.tipo,
        modelo: selectedItem.modelo,
        precio: selectedItem.precio,
        tienda: selectedItem.tienda,
        url: selectedItem.url,
        consumo: selectedItem.consumo,
    });
  }

  guardar() { 
    const data = this.registroForm.value;
    
    // Realiza la solicitud POST utilizando Axios
    console.log(data);
    axios.put(`https://nodemysql12.duckdns.org:443/${data.id}`, data)
      .then((response) => {
        // Maneja la respuesta exitosa de la inserción en la base de datos
        console.log('Datos guardados exitosamente:', response.data);
        alert('Articulo Actualizado')
      })
      .catch((error) => {
        // Maneja el error en caso de que la inserción falle
        console.error('Error al guardar los datos:', error);
        // Puedes mostrar un mensaje de error al usuario o realizar acciones adicionales según tus necesidades
      });
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

  confirmarEliminacion() {
    const confirmacion = window.confirm('¿Estás seguro de que deseas eliminar?');
    if (confirmacion) {
      // El usuario ha confirmado, ejecuta la función de eliminación
      this.delete();
    } else {
      // El usuario ha cancelado la eliminación
      alert('El usuario ha cancelado la eliminación')
    }
  }

  delete() {
    const data = this.registroForm.value;
    
    // Realiza la solicitud Delete utilizando Axios
    console.log(data);
    axios.delete(`https://nodemysql12.duckdns.org:443/${data.id}`, data)
      .then((response) => {
        // Maneja la respuesta exitosa de la inserción en la base de datos
        console.log('Datos eliminados exitosamente:', response.data);
        alert('Articulo Eliminado')
      })
      .catch((error) => {
        // Maneja el error en caso de que la inserción falle
        console.error('Error al eliminar los datos:', error);
        // Puedes mostrar un mensaje de error al usuario o realizar acciones adicionales según tus necesidades
      });
  }

  recoverProcesadores() {
    axios
      .get('https://nodemysql12.duckdns.org:443/')
      .then((response) => {
        this.items = response.data.map(
          (item: {id: number; tipo: any; modelo: any; precio: number; tienda: any; url: any; consumo: any;}) => ({
            id: item.id,
            tipo: item.tipo,
            modelo: item.modelo,
            precio: item.precio,
            tienda: item.tienda,
            url: item.url,
            consumo: item.consumo,
          })
        );
      })
      .catch((error) => {
        console.log(error);
      });
  }

}
