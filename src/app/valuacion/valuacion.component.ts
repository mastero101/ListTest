import { Component, OnInit, OnDestroy } from '@angular/core';
import { ComponentesService } from '../services/componentes.service';
import { Componente } from '../interfaces/componente.interface';
import { MatSliderChange } from '@angular/material/slider';
import { MatSelect } from '@angular/material/select';
import jsPDF from 'jspdf'; // Importa jsPDF
import autoTable from 'jspdf-autotable'; // Importa el complemento para tablas

@Component({
  selector: 'app-valuacion',
  templateUrl: './valuacion.component.html',
  styleUrls: ['./valuacion.component.scss']
})
export class ValuacionComponent implements OnInit, OnDestroy {
  isLoading: boolean = false;
  private loadingSub!: any; // Usamos any para evitar problemas de tipos si no está Subscription importado correctamente
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

  constructor(private componentesService: ComponentesService) { }

  ngOnInit(): void {
    this.loadingSub = this.componentesService.isLoading$.subscribe(state => {
      this.isLoading = state;
    });
    this.recuperarComponentes();
  }

  ngOnDestroy(): void {
    if (this.loadingSub) {
      this.loadingSub.unsubscribe();
    }
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
    const mapping: { [key: string]: string } = {
      'procesador': 'Procesador',
      'motherboard': 'Placa Base',
      'ram': 'Memoria RAM',
      'almacenamiento': 'Almacenamiento',
      'disipador': 'Refrigeración',
      'psu': 'Fuente de Poder',
      'gpu': 'Tarjeta Gráfica',
      'gabinete': 'Gabinete'
    };
    return mapping[categoria.toLowerCase()] || (categoria.charAt(0).toUpperCase() + categoria.slice(1));
  }

  onSearchInput(tipo: string, value: string, selectField: MatSelect) {
    if (tipo === 'procesador') {
      this.searchTermProcesador = value;
      this.filtrarProcesadores();
    } else if (tipo === 'gpu') {
      this.searchTermGPU = value;
      this.filtrarGPUs();
    }
  }

  onSelectOpened(tipo: string, selectField: MatSelect) {
    if (tipo === 'procesador' || tipo === 'gpu') {
      // Usamos un pequeño timeout para asegurar que el panel esté renderizado
      setTimeout(() => {
        const panel = document.querySelector('.dropdown-with-search');
        if (panel) {
          const input = panel.querySelector('input') as HTMLInputElement;
          if (input) input.focus();
        }
      }, 0);
    }
  }

  filtrarProcesadores() {
    this.componentesFiltradosProcesador = this.componentes.filter(componente =>
      componente.tipo === 'procesador' &&
      componente.modelo.toLowerCase().includes(this.searchTermProcesador.toLowerCase())
    );
  }

  filtrarGPUs() {
    this.componentesFiltradosGPU = this.componentes.filter(componente =>
      componente.tipo === 'gpu' &&
      componente.modelo.toLowerCase().includes(this.searchTermGPU.toLowerCase())
    );
  }

  exportarPDF() {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Colores del tema
    const primaryColor: [number, number, number] = [92, 61, 153]; // #5c3d99
    const accentColor: [number, number, number] = [139, 92, 246]; // #8b5cf6
    const darkGray: [number, number, number] = [51, 51, 51];
    const lightGray: [number, number, number] = [245, 245, 245];

    // ============ ENCABEZADO ============
    // Fondo del encabezado
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 45, 'F');

    // Título principal
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte de Valuación', pageWidth / 2, 20, { align: 'center' });

    // Subtítulo
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('PC de Segunda Mano', pageWidth / 2, 30, { align: 'center' });

    // Fecha de generación
    const fecha = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.setFontSize(9);
    doc.text(`Generado: ${fecha}`, pageWidth / 2, 38, { align: 'center' });

    // ============ INFORMACIÓN DE DEPRECIACIÓN ============
    let yPos = 55;

    // Cuadro de información
    doc.setFillColor(...lightGray);
    doc.roundedRect(15, yPos, pageWidth - 30, 25, 3, 3, 'F');

    doc.setTextColor(...darkGray);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Tiempo de Uso:', 20, yPos + 8);
    doc.setFont('helvetica', 'normal');
    doc.text(`${this.anoSeleccionado} ${this.anoSeleccionado === 1 ? 'año' : 'años'}`, 50, yPos + 8);

    doc.setFont('helvetica', 'bold');
    doc.text('Depreciación Aplicada:', 20, yPos + 16);
    doc.setFont('helvetica', 'normal');
    const depreciacionTexto = this.anoSeleccionado === 0
      ? 'Sin depreciación'
      : this.anoSeleccionado === 1
        ? '30% (primer año)'
        : `30% primer año + ${(this.anoSeleccionado - 1) * 10}% años siguientes`;
    doc.text(depreciacionTexto, 70, yPos + 16);

    // ============ VALOR TOTAL DESTACADO ============
    yPos += 35;

    // Cuadro con gradiente simulado
    doc.setFillColor(...primaryColor);
    doc.roundedRect(15, yPos, pageWidth - 30, 30, 5, 5, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('VALOR ESTIMADO TOTAL', pageWidth / 2, yPos + 10, { align: 'center' });

    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    const valorFormateado = new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(this.valorTotal);
    doc.text(valorFormateado, pageWidth / 2, yPos + 22, { align: 'center' });

    // ============ TABLA DE COMPONENTES ============
    yPos += 40;

    const componentesArray = Object.entries(this.componentesSeleccionados).map(([tipo, componente]) => [
      this.formatCategoria(tipo),
      componente.modelo,
      new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(componente.precio),
      new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
        this.calcularDepreciacion(componente.precio, this.anoSeleccionado)
      )
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Categoría', 'Componente', 'Precio Original', 'Precio Valuado']],
      body: componentesArray,
      theme: 'striped',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: darkGray
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250]
      },
      columnStyles: {
        0: { cellWidth: 35, fontStyle: 'bold', textColor: primaryColor },
        1: { cellWidth: 70 },
        2: { cellWidth: 35, halign: 'right' },
        3: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
      },
      margin: { left: 15, right: 15 },
      didDrawPage: (data) => {
        // Pie de página
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.setFont('helvetica', 'italic');
        doc.text(
          'Este reporte es una estimación basada en precios de mercado y depreciación estándar.',
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }
    });

    // ============ RESUMEN FINAL ============
    const finalY = (doc as any).lastAutoTable.finalY + 10;

    if (finalY < pageHeight - 40) {
      // Línea separadora
      doc.setDrawColor(...accentColor);
      doc.setLineWidth(0.5);
      doc.line(15, finalY, pageWidth - 15, finalY);

      // Total final destacado
      doc.setFillColor(...lightGray);
      doc.roundedRect(pageWidth - 90, finalY + 5, 75, 15, 3, 3, 'F');

      doc.setTextColor(...darkGray);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('TOTAL:', pageWidth - 85, finalY + 13);

      doc.setTextColor(...primaryColor);
      doc.setFontSize(12);
      doc.text(valorFormateado, pageWidth - 20, finalY + 13, { align: 'right' });
    }

    // Guardar el PDF con nombre descriptivo
    const nombreArchivo = `valuacion_pc_${this.anoSeleccionado}años_${new Date().getTime()}.pdf`;
    doc.save(nombreArchivo);
  }

}