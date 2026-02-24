import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import axios from 'axios';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
    selector: 'app-editparts',
    templateUrl: './editparts.component.html',
    styleUrls: ['./editparts.component.scss'],
    standalone: false
})
export class EditpartsComponent implements OnInit {
  items: any[] = [];
  filteredItemsAutocomplete: Observable<any[]>;
  searchControl = new FormControl<any>('');

  registroForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private navbarComponent: NavbarComponent,
    private snackBar: MatSnackBar
  ) {
    this.registroForm = this.formBuilder.group({
      id: [{ value: '', disabled: true }, Validators.required],
      tipo: ['', Validators.required],
      modelo: ['', [Validators.required, Validators.minLength(3)]],
      precio: ['', [Validators.required, Validators.min(0)]],
      url: ['', Validators.required],
      img: ['', Validators.required],
      tienda: ['', Validators.required],
      consumo: ['', [Validators.required, Validators.min(0)]],
    });

    this.filteredItemsAutocomplete = this.searchControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const val = value as any;
        const filterValue = (typeof val === 'string' ? val : val?.modelo || '').toLowerCase();

        // Si el buscador se vacía, ocultamos el formulario de edición para "reiniciar"
        if (!filterValue) {
          this.registroForm.reset();
        }

        return this.items.filter(item =>
          item.modelo.toLowerCase().includes(filterValue) ||
          item.tipo.toLowerCase().includes(filterValue)
        );
      })
    );
  }

  ngOnInit() {
    this.recoverProcesadores();
    this.navbarComponent.showToggleButton = true;
  }

  displayFn(item: any): string {
    return item && item.modelo ? item.modelo : '';
  }

  recoverProcesadores() {
    axios.get('https://nodemysql12.duckdns.org:443/components')
      .then((response) => {
        this.items = response.data;
        // Trigger initial filter
        const currentVal = this.searchControl.value;
        this.searchControl.setValue(currentVal);
      })
      .catch((error) => console.log(error));
  }

  onItemSelected(event: any) {
    const selectedItem = event.option.value;
    this.fillForm(selectedItem);
  }

  fillForm(selectedItem: any) {
    if (!selectedItem) return;
    this.registroForm.patchValue({
      id: selectedItem.id,
      tipo: selectedItem.tipo,
      modelo: selectedItem.modelo,
      precio: selectedItem.precio,
      tienda: selectedItem.tienda,
      url: selectedItem.url,
      img: selectedItem.img,
      consumo: selectedItem.consumo,
    });

    if (window.innerWidth < 768) {
      setTimeout(() => {
        document.querySelector('.edit-card')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }

  onSubmit() {
    if (this.registroForm.invalid) {
      this.snackBar.open('Formulario inválido', 'Cerrar', { duration: 3000 });
      return;
    }
    const data = this.registroForm.getRawValue();
    this.guardar(data);
  }

  guardar(data: any) {
    axios.put(`https://nodemysql12.duckdns.org:443/components/${data.id}`, data)
      .then(() => {
        this.snackBar.open('¡Componente actualizado!', 'Aceptar', { duration: 3000 });
        this.recoverProcesadores();
      })
      .catch((error) => {
        console.error('Error:', error);
        this.snackBar.open('Error al actualizar', 'Cerrar', { duration: 5000 });
      });
  }

  buscarManualmente() {
    const value = this.searchControl.value;
    if (!value) return;

    if (typeof value === 'string') {
      axios.get(`https://nodemysql12.duckdns.org:443/components/modelo/${value}`)
        .then((response) => {
          if (response.data && response.data[0]) {
            this.fillForm(response.data[0]);
            this.snackBar.open('Componente encontrado', 'OK', { duration: 2000 });
          } else {
            this.snackBar.open('No se encontró el modelo', 'Cerrar', { duration: 3000 });
          }
        })
        .catch((error) => {
          console.error('Error:', error);
          this.snackBar.open('Error en la búsqueda', 'Cerrar', { duration: 3000 });
        });
    }
  }

  confirmarEliminacion() {
    const modelo = this.registroForm.get('modelo')?.value;
    if (confirm(`¿Estás seguro de que deseas eliminar: ${modelo}?`)) {
      this.delete();
    }
  }

  delete() {
    const id = this.registroForm.get('id')?.value;
    axios.delete(`https://nodemysql12.duckdns.org:443/components/${id}`)
      .then(() => {
        this.snackBar.open('Componente eliminado', 'Aceptar', { duration: 3000 });
        this.resetForm();
        this.recoverProcesadores();
      })
      .catch((error) => {
        console.error('Error:', error);
        this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 5000 });
      });
  }

  resetForm() {
    this.registroForm.reset();
    this.searchControl.setValue('');
  }
}
