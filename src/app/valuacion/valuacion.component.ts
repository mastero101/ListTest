import { Component, OnInit } from '@angular/core';
import { ComponentesService } from '../services/componentes.service';
import { Componente } from '../interfaces/componente.interface';
import { MatSliderChange } from '@angular/material/slider';
import jsPDF from 'jspdf'; // Importa jsPDF
import autoTable from 'jspdf-autotable'; // Importa el complemento para tablas

@Component({
  selector: 'app-valuacion',
  templateUrl: './valuacion.component.html',
  styleUrls: ['./valuacion.component.scss']
})
export class ValuacionComponent implements OnInit {
  componentes: Componente[] = [];
  categorias: string[] = [];
  componentesSeleccionados: { [key: string]: Componente } = {};
  anoSeleccionado: number = 1;
  valorTotal: number = 0;
  searchTermProcesador: string = ''; // Término de búsqueda para procesadores
  searchTermGPU: string = ''; // Término de búsqueda para GPUs
  componentesFiltradosProcesador: Componente[] = []; // Componentes de procesador filtrados
  componentesFiltradosGPU: Componente[] = []; // Componentes de GPU filtrados

  // Define el orden deseado de los tipos de componentes
  ordenCategorias: string[] = [
    'procesador',
    'motherboard',
    'ram',
    'almacenamiento',
    'disipador',
    'psu',
    'gpu',
    'gabinete'
  ];

  // Almacena el socket del procesador seleccionado
  socketProcesador: string = '';
  // Almacena el tipo de RAM de la motherboard seleccionada
  tipoRamMotherboard: string = '';

  constructor(private componentesService: ComponentesService) {}

  ngOnInit(): void {
    this.recuperarComponentes();
  }

  async recuperarComponentes() {
    try {
      this.componentes = await this.componentesService.obtenerComponentes();
      this.componentesFiltradosProcesador = this.componentes.filter(c => c.tipo === 'procesador');
      this.componentesFiltradosGPU = this.componentes.filter(c => c.tipo === 'gpu');
      this.extraerCategorias();
      this.calcularValorTotal();
    } catch (error) {
      console.error('Error al recuperar componentes', error);
    }
  }

  extraerCategorias() {
    const categoriasSet = new Set(this.componentes.map(componente => componente.tipo));
    this.categorias = Array.from(categoriasSet);
  }

  seleccionarComponente(tipo: string, componente: Componente) {
    this.componentesSeleccionados[tipo] = componente;

    // Actualiza el socket del procesador seleccionado
    if (tipo === 'procesador') {
      this.socketProcesador = componente.socket ?? '';
      this.tipoRamMotherboard = ''; // Reinicia el tipo de RAM al seleccionar un nuevo procesador
    }

    // Actualiza el tipo de RAM de la motherboard seleccionada
    if (tipo === 'motherboard') {
      this.tipoRamMotherboard = componente.rams ?? '';
    }

    this.calcularValorTotal();
  }

  obtenerComponentesPorTipo(tipo: string) {
    let componentesFiltrados = this.componentes.filter(c => c.tipo === tipo);

    if (tipo === 'motherboard' && this.socketProcesador) {
      return componentesFiltrados.filter(c => c.socket === this.socketProcesador);
    }
    if (tipo === 'ram' && this.tipoRamMotherboard) {
      return componentesFiltrados.filter(c => c.rams === this.tipoRamMotherboard);
    }
    return componentesFiltrados;
  }

  calcularValorTotal() {
    this.valorTotal = Object.values(this.componentesSeleccionados).reduce((total, componente) => {
      const depreciacion = this.calcularDepreciacion(componente.precio, this.anoSeleccionado);
      return total + depreciacion;
    }, 0);
  }

  calcularDepreciacion(precio: number, años: number): number {
    let depreciacion = precio;
    if (años > 0) {
      depreciacion *= (1 - 0.3);
      for (let i = 1; i < años; i++) {
        depreciacion *= (1 - 0.1);
      }
    }
    return depreciacion;
  }

  calcularTotal(): number {
    return Object.values(this.componentesSeleccionados).reduce((total, componente) => {
      return total + this.calcularDepreciacion(componente.precio, this.anoSeleccionado);
    }, 0);
  }

  onYearChange(year: number) {
    this.anoSeleccionado = year;
    this.calcularValorTotal();
  }

  formatCategoria(categoria: string): string {
    return categoria.charAt(0).toUpperCase() + categoria.slice(1); // Capitaliza la primera letra
  }

  filtrarProcesadores() {
    // Filtra los procesadores según el término de búsqueda
    this.componentesFiltradosProcesador = this.componentes.filter(componente => 
      componente.tipo === 'procesador' && 
      componente.modelo.toLowerCase().includes(this.searchTermProcesador.toLowerCase())
    );
  }

  filtrarGPUs() {
    // Filtra los componentes de GPU según el término de búsqueda
    this.componentesFiltradosGPU = this.componentes.filter(componente => 
      componente.tipo === 'gpu' && 
      componente.modelo.toLowerCase().includes(this.searchTermGPU.toLowerCase())
    );
  }

  exportarPDF() {
    const doc = new jsPDF();

    // Agregar título
    doc.setFontSize(18);
    doc.text('Valuación de Armados de Segunda Mano', 10, 10);

    // Agregar valor total
    doc.setFontSize(12);
    doc.text(`Valor Total: ${this.valorTotal.toFixed(2)}`, 10, 20);

    // Agregar tabla de componentes seleccionados
    const columnas = [
      'Componente', // Encabezado de la columna
      'Precio',     // Encabezado de la columna
      'Precio Depreciado' // Encabezado de la columna
    ];

    const filas = Object.values(this.componentesSeleccionados).map(componente => [
      componente.modelo,
      componente.precio.toFixed(2), // Formato de precio
      this.calcularDepreciacion(componente.precio, this.anoSeleccionado).toFixed(2) // Formato de precio depreciado
    ]);

    // Agregar una fila para el total
    const totalRow = [
      'Total', // Componente
      '',      // Precio (vacío)
      this.calcularTotal().toFixed(2) // Precio depreciado
    ];

    filas.push(totalRow); // Agregar la fila del total a las filas

    const autoTableConfig = {
      head: [columnas],
      body: filas,
      startY: 30,
      theme: 'grid' as 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 3,
        overflow: 'linebreak' as 'linebreak',
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 40 },
        2: { cellWidth: 50 },
      },
      margin: { top: 40 },
    };

    // Generar la tabla
    autoTable(doc, autoTableConfig);

    // Guardar el PDF
    doc.save('valuacion.pdf');
  }

}