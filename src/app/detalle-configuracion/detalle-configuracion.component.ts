import { Component } from '@angular/core';
import axios from 'axios';
import jsPDF from 'jspdf';
import { ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-detalle-configuracion',
  templateUrl: './detalle-configuracion.component.html',
  styleUrls: ['./detalle-configuracion.component.scss']
})

export class DetalleConfiguracionComponent {
  configData: any = {};
  Object = Object;
  fechaHora: any;
  modalVisible = false;
  componenteSeleccionado: any = null;

  constructor(private route: ActivatedRoute, private navbarComponent: NavbarComponent, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
    const configId = params['id'];
      if (configId) {
        this.recoverConfiguracion(configId);
      }
    });
    this.navbarComponent.showToggleButton = false;
  }

  recoverConfiguracion(configId: string) {
    this.configData = {};
    // Haz una solicitud al servidor para recuperar la configuración basada en el ID
    axios.get(`https://nodemysql12.duckdns.org:443/recuperar-configuracion/${configId}`)
      .then(response => {
        this.configData = response.data.configData;
        this.fechaHora = response.data.fechaHora;
        this.sortConfigData();  // Llama a la función para ordenar los datos
        console.log(this.configData);
        console.log(this.fechaHora);
      })
      .catch(error => {
        console.error('Error al recuperar configuración', error);
      });
  }

  sortConfigData() {
    const order = [
      'procesador',
      'placaMadre',
      'ram',
      'almacenamiento',
      'fuente',
      'grafica',
      'enfriamiento',
      'gabinete'
    ];
  
    // Añade un tipo de índice a this.configData
    const configDataWithIndex: { [key: string]: any } = this.configData;
  
    // Ordena las claves según el orden especificado
    const sortedKeys = Object.keys(configDataWithIndex).sort((a, b) => {
      return order.indexOf(a) - order.indexOf(b);
    });
  
    // Crea un nuevo objeto con las claves ordenadas
    const sortedConfigData = sortedKeys.reduce((acc, key) => {
      acc[key] = configDataWithIndex[key];
      return acc;
    }, {} as { [key: string]: any });
  
    // Reemplaza el objeto original con el objeto ordenado
    this.configData = sortedConfigData;
  }

  formatFechaHora(fechaHora: string): string {
    const fecha = new Date(fechaHora);
    const formatoFecha = `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear().toString().slice(-2)}`;
    const formatoHora = `${fecha.getHours()}:${(fecha.getMinutes() < 10 ? '0' : '') + fecha.getMinutes()}`;

    return `${formatoFecha} ${formatoHora}`;
  }
  
  getTotalPrecio(): number {
    let total = 0;
    if (this.configData) {
      for (const key of Object.keys(this.configData)) {
        total += this.configData[key].precio || 0;
      }
    }
    return total;
  }

  getTotalConsumo(): number {
    let totalConsumo = 0;
    if (this.configData) {
      for (const key of Object.keys(this.configData)) {
        totalConsumo += parseInt(this.configData[key].consumo) || 0;
      }
    }
    return totalConsumo;
  }

  getRoundedTotalPrecio(): number {
    return Math.round(this.getTotalPrecio() / 1000);
  }

  compartirConfiguracion(): void {
    const currentUrl = window.location.href;
    
    navigator.clipboard.writeText(currentUrl).then(() => {
      alert('¡Enlace copiado al portapapeles!');
    }).catch(err => {
      console.error('Error al copiar el enlace:', err);
    });
  }

  async exportarPDF(): Promise<void> {
    // Crear el PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    // Agregar título centrado
    pdf.setFontSize(24);
    pdf.text('Detalle de Configuración', pageWidth/2, 20, { align: 'center' });
    
    // Calcular totales
    const precioTotal = this.getTotalPrecio();
    const consumoTotal = this.getTotalConsumo();
    
    // Agregar información general con formato
    pdf.setFontSize(12);
    pdf.text(`Fecha: ${this.formatFechaHora(this.fechaHora)}`, 20, 40);
    pdf.text(`Precio Total: $${precioTotal.toLocaleString('es-CL')}`, 20, 50);
    pdf.text(`Consumo Total: ${consumoTotal}W`, 20, 60);

    // Crear tabla de componentes
    const headers = ['Componente', 'Precio', 'Tienda', 'Consumo'];
    const data = Object.keys(this.configData).map(key => [
      this.configData[key].modelo,
      `$${this.configData[key].precio.toLocaleString('es-CL')}`,
      this.configData[key].tienda,
      `${this.configData[key].consumo}W`
    ]);

    // Agregar fila de totales al final de la tabla
    data.push([
      'TOTAL',
      `$${precioTotal.toLocaleString('es-CL')}`,
      '',
      `${consumoTotal}W`
    ]);

    // Configurar estilos de tabla
    pdf.setFontSize(10);
    (pdf as any).autoTable({
      head: [headers],
      body: data,
      startY: 70,
      theme: 'grid',
      styles: { 
        fontSize: 10,
        cellPadding: 5
      },
      headStyles: { 
        fillColor: [30, 144, 255],
        textColor: 255,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 80 }, // Componente
        1: { cellWidth: 30 }, // Precio
        2: { cellWidth: 40 }, // Tienda
        3: { cellWidth: 30 }  // Consumo
      },
      // Estilo especial para la última fila (totales)
      didParseCell: function(data: any) {
        if (data.row.index === data.table.body.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [240, 240, 240];
        }
      },
      margin: { top: 70 }
    });

    // Agregar marca de agua o nota al final
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    const timestamp = new Date().toLocaleString();
    pdf.text(
      `Generado en cotizador.cloud el ${timestamp}`,
      20,
      pdf.internal.pageSize.getHeight() - 10
    );

    // Guardar PDF
    pdf.save(`configuracion-${Date.now()}.pdf`);
  }

  imprimir(): void {
    window.print();
  }

  verDetalles(key: string): void {
    this.componenteSeleccionado = this.configData[key];
    this.modalVisible = true;
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.componenteSeleccionado = null;
  }

  onImageError(event: any): void {
    event.target.parentElement.classList.add('error');
    event.target.style.display = 'none';
    event.target.parentElement.innerHTML = 'Imagen no disponible';
  }
}
