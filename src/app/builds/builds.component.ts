import { Component, OnInit, OnDestroy } from '@angular/core';
import axios from 'axios';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'

import { ActivatedRoute } from '@angular/router';
import { Clipboard } from '@angular/cdk/clipboard';
import { NavbarComponent } from '../navbar/navbar.component';
import { FormControl } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

type SlotKey =
  | 'procesador'
  | 'placaMadre'
  | 'ram'
  | 'almacenamiento'
  | 'enfriamiento'
  | 'fuente'
  | 'grafica'
  | 'gabinete';

interface SelectedComponent {
  modelo: string;
  precio: number;
  tienda: string;
  consumo: number;
  url: string;
  img: string;
  socket?: string;
  rams?: string;
  potencia?: number;
}

interface ComponentSlot {
  key: SlotKey;
  label: string;
  selected: SelectedComponent | null;
}

@Component({
    selector: 'app-builds',
    templateUrl: './builds.component.html',
    styleUrls: ['./builds.component.scss'],
    standalone: false
})
export class BuildsComponent implements OnInit, OnDestroy {
  isLoading: boolean = false;
  procesadores: { precio: number; modelo: string; tienda: string; consumo: string; socket: string }[] = [];
  motherboard: { precio: number; modelo: string; tienda: string; url: string; consumo: number; socket: string; rams: any; img: any; }[] = [];
  ram: { precio: number; modelo: string; tienda: string; url: string; consumo: number; socket: any; rams: any; img: any; }[] = [];
  almacenamiento: { precio: number; modelo: string; tienda: string; url: string; consumo: number; img: any; }[] = [];
  disipador: { precio: number; modelo: string; tienda: string; url: string; consumo: number; img: any; }[] = [];
  fuentedepoder: { precio: number; modelo: string; tienda: string; url: string; consumo: number; potencia: number; img: any; }[] = [];
  grafica: { precio: number; modelo: string; tienda: string; url: string; consumo: number; img: any; }[] = [];
  gabinetes: { precio: number; modelo: string; tienda: string; url: string; consumo: number; img: any; }[] = [];
  motherboardFiltradas: { precio: number; modelo: string; tienda: string; url: string; consumo: number; socket: string; rams: any; }[] = [];
  ramFiltradas: { precio: number; modelo: string; tienda: string; url: string; consumo: number; socket: any; rams: any; }[] = [];

  slots: Record<SlotKey, ComponentSlot> = {
    procesador: { key: 'procesador', label: 'Procesador', selected: null },
    placaMadre: { key: 'placaMadre', label: 'Placa Madre', selected: null },
    ram: { key: 'ram', label: 'Ram', selected: null },
    almacenamiento: { key: 'almacenamiento', label: 'Almacenamiento', selected: null },
    enfriamiento: { key: 'enfriamiento', label: 'Enfriamiento', selected: null },
    fuente: { key: 'fuente', label: 'Fuente', selected: null },
    grafica: { key: 'grafica', label: 'Gráfica', selected: null },
    gabinete: { key: 'gabinete', label: 'Gabinete', selected: null },
  };

  sumaPrecios: number = 0;
  sumaConsumo: number = 0;
  modelo: any;
  precio: any;
  tienda: any;
  id: any;
  id2: any;
  elementoRecuperado: any;
  idRecuperado: any[] = [];
  idInit: number = 0;
  idInit2: any;
  elementoRecuperado2: any;
  mostrarAdvertencia: boolean = false;
  selectedImage: string | null = null;
  zoom: number = 1;
  minZoom: number = 0.5;
  maxZoom: number = 3;
  zoomStep: number = 0.1;
  panX: number = 0;
  panY: number = 0;
  isPanning: boolean = false;
  lastX: number = 0;
  lastY: number = 0;
  enlaceCompartir: string = '';
  mostrarCard: boolean = false;
  todasLasTiendasSeleccionadas: boolean = true;
  endpoint: any;
  endpoint2: any;
  searchText: string = '';

  procesadorFilterCtrl = new FormControl('');
  filteredProcesadores: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  protected _onDestroy = new Subject<void>();

  graficaFilterCtrl = new FormControl('');
  filteredGraficas: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  compartido: boolean = false;

  constructor(private route: ActivatedRoute, private clipboard: Clipboard, private navbarComponent: NavbarComponent, private snackBar: MatSnackBar) { }

  private get slotList(): ComponentSlot[] {
    return Object.values(this.slots);
  }

  async ngOnInit(): Promise<void> {
    this.isLoading = true;
    this.endpoint2 = 'http://localhost:3000';
    this.endpoint = 'https://nodemysql12.duckdns.org:443';

    try {
      await Promise.all([
        this.recoverid(),
        this.recoverProcesadores(),
        this.recovertMotherboard(),
        this.recoverRam(),
        this.recoverAlmacenamiento(),
        this.recoverDisipador(),
        this.recoverFuente(),
        this.recoverGrafica(),
        this.recoverGabinetes()
      ]);
    } catch (error) {
      console.error('Error loading data', error);
    } finally {
      this.isLoading = false;
    }

    this.navbarComponent.showToggleButton = true;

    // Inicializar la lista filtrada
    this.filteredProcesadores.next(this.procesadores.slice());

    // Escuchar cambios en el filtro
    this.procesadorFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterProcesadores();
      });

    // Inicializar la lista filtrada de gráficas
    this.filteredGraficas.next(this.grafica.slice());

    // Escuchar cambios en el filtro de gráficas
    this.graficaFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterGraficas();
      });
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  private filterProcesadores() {
    if (!this.procesadores) {
      return;
    }

    // obtener el valor de búsqueda
    let search = this.procesadorFilterCtrl.value;

    // Si no hay término de búsqueda, mostrar todos los procesadores
    if (!search) {
      this.filteredProcesadores.next(this.procesadores.slice());
      return;
    }

    const searchStr = search.toString().toLowerCase();

    // filtrar los procesadores
    this.filteredProcesadores.next(
      this.procesadores.filter(procesador =>
        procesador.modelo.toLowerCase().includes(searchStr))
    );
  }

  recoverid() {
    return axios
      .get(this.endpoint + '/components/')
      .then((response) => {
        this.idRecuperado = response.data;
        this.idInit = response.data[response.data.length - 1].id;
        this.idInit = this.idInit + 1;
        this.idInit2 = 'ID: ' + this.idInit;
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  recoverProcesadores() {
    return axios
      .get(this.endpoint + '/components/tipo/procesador')
      .then((response) => {
        this.procesadores = response.data.map(
          (item: { modelo: any; precio: number; tienda: any; url: any; consumo: number; socket: any; img: any; }) => ({
            modelo: item.modelo,
            precio: item.precio,
            tienda: item.tienda,
            url: item.url,
            consumo: item.consumo,
            socket: item.socket,
            img: item.img,
          })
        );
        // Inicializar la lista filtrada con todos los procesadores después de obtenerlos
        this.filteredProcesadores.next(this.procesadores);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  recovertMotherboard() {
    return axios
      .get(this.endpoint + '/components/tipo/motherboard')
      .then((response) => {
        this.motherboard = response.data.map(
          (item: { modelo: any; precio: number; tienda: any; url: any; consumo: number; socket: any; rams: any; img: any; }) => ({
            modelo: item.modelo,
            precio: item.precio,
            tienda: item.tienda,
            url: item.url,
            consumo: item.consumo,
            socket: item.socket,
            rams: item.rams,
            img: item.img,
          })
        );
      })
      .catch((error) => {
        console.log(error);
      });
  }

  recoverRam() {
    return axios
      .get(this.endpoint + '/components/tipo/ram')
      .then((response) => {
        this.ram = response.data.map(
          (item: { modelo: any; precio: number; tienda: any; url: any; consumo: number; socket: any; rams: any; img: any; }) => ({
            modelo: item.modelo,
            precio: item.precio,
            tienda: item.tienda,
            url: item.url,
            img: item.img,
            consumo: item.consumo,
            socket: item.socket,
            rams: item.rams,
          })
        );
      })
      .catch((error) => {
        console.log(error);
      });
  }

  recoverAlmacenamiento() {
    return axios
      .get(this.endpoint + '/components/tipo/almacenamiento')
      .then((response) => {
        this.almacenamiento = response.data.map(
          (item: { modelo: any; precio: number; tienda: any; url: any; consumo: number; img: any; }) => ({
            modelo: item.modelo,
            precio: item.precio,
            tienda: item.tienda,
            url: item.url,
            img: item.img,
            consumo: item.consumo,
          })
        );
      })
      .catch((error) => {
        console.log(error);
      });
  }

  recoverDisipador() {
    return axios
      .get(this.endpoint + '/components/tipo/disipador')
      .then((response) => {
        this.disipador = response.data.map(
          (item: { modelo: any; precio: number; tienda: any; url: any; consumo: number; img: any; }) => ({
            modelo: item.modelo,
            precio: item.precio,
            tienda: item.tienda,
            url: item.url,
            img: item.img,
            consumo: item.consumo,
          })
        );
      })
      .catch((error) => {
        console.log(error);
      });
  }

  recoverFuente() {
    return axios
      .get(this.endpoint + '/components/tipo/psu')
      .then((response) => {
        this.fuentedepoder = response.data.map(
          (item: { modelo: any; precio: number; tienda: any; url: any; consumo: number; potencia: number; img: any; }) => ({
            modelo: item.modelo,
            precio: item.precio,
            tienda: item.tienda,
            url: item.url,
            img: item.img,
            consumo: item.consumo,
            potencia: item.potencia,
          })
        );
      })
      .catch((error) => {
        console.log(error);
      });
  }

  recoverGrafica() {
    return axios
      .get(this.endpoint + '/components/tipo/gpu')
      .then((response) => {
        this.grafica = response.data.map(
          (item: { modelo: any; precio: number; tienda: any; url: any; consumo: number; img: any; }) => ({
            modelo: item.modelo,
            precio: item.precio,
            tienda: item.tienda,
            url: item.url,
            img: item.img,
            consumo: item.consumo,
          })
        );
        // Inicializar la lista filtrada DESPUÉS de obtener los datos
        this.filteredGraficas.next(this.grafica.slice());
      })
      .catch((error) => {
        console.log(error);
      });
  }

  recoverGabinetes() {
    return axios
      .get(this.endpoint + '/components/tipo/gabinete')
      .then((response) => {
        this.gabinetes = response.data.map((item: { modelo: any; precio: number; tienda: any; url: any; consumo: number; img: any; }) => ({
          modelo: item.modelo,
          precio: item.precio,
          tienda: item.tienda,
          url: item.url,
          img: item.img,
          consumo: item.consumo,
        }));
      })
      .catch((error) => {
        console.log(error);
      });
  }

  /**
   * Selecciona (o deselecciona, si value es null/undefined) el componente de un slot.
   * `value` es el objeto completo para procesador/grafica (autocomplete) o el `modelo`
   * (string) para el resto de slots, que se resuelven contra su catálogo crudo.
   */
  selectComponent(key: SlotKey, value: any) {
    let item: SelectedComponent | null = null;

    switch (key) {
      case 'procesador':
      case 'grafica':
        item = value ?? null;
        break;
      case 'placaMadre':
        item = this.motherboard.find((m) => m.modelo === value) ?? null;
        break;
      case 'ram':
        item = this.ram.find((r) => r.modelo === value) ?? null;
        break;
      case 'almacenamiento':
        item = this.almacenamiento.find((a) => a.modelo === value) ?? null;
        break;
      case 'enfriamiento':
        item = this.disipador.find((d) => d.modelo === value) ?? null;
        break;
      case 'fuente':
        item = this.fuentedepoder.find((f) => f.modelo === value) ?? null;
        break;
      case 'gabinete':
        item = this.gabinetes.find((g) => g.modelo === value) ?? null;
        break;
    }

    this.slots[key].selected = item;

    if (key === 'procesador') {
      this.motherboardFiltradas = item
        ? this.motherboard.filter((m) => m.socket === item!.socket)
        : [];
    }

    if (key === 'placaMadre') {
      this.ramFiltradas = item
        ? this.ram.filter((r) => r.rams === item!.rams)
        : [];
    }

    this.sumatoriaPrecios();
    this.sumatoriaConsumo();
  }

  sumatoriaPrecios() {
    this.sumaPrecios = this.slotList.reduce((sum, slot) => sum + (slot.selected?.precio || 0), 0);
    console.log('$ ' + this.sumaPrecios);
  }

  sumatoriaConsumo() {
    this.sumaConsumo = this.slotList.reduce(
      (sum, slot) => sum + (parseInt(String(slot.selected?.consumo ?? 0)) || 0),
      0
    );
    console.log(this.sumaConsumo + ' W');

    const potencia = this.slots.fuente.selected?.potencia;
    this.mostrarAdvertencia = potencia != null && potencia * 0.81 <= this.sumaConsumo;
  }

  exportToText() {
    const lines = this.slotList.map((slot) => {
      const s = slot.selected;
      const modelo = s?.modelo ?? '';
      const precio = s?.precio ?? 0;
      const tienda = s?.tienda ?? '';
      return this.todasLasTiendasSeleccionadas
        ? `${slot.label}: ${modelo}, $${precio}, ${tienda}`
        : `${slot.label}: ${modelo}, $${precio}`;
    });

    lines.push('--------------------------------------------------------------------');
    lines.push(`Total: $${this.sumaPrecios}`);
    lines.push(`Consumo: ${this.sumaConsumo} W`);

    const allText = lines.join('\n\n');
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(allText));
    element.setAttribute('download', ('Cotizacion' + ' ' + (this.sumaPrecios / 1000).toFixed(0) + 'K' + '.txt'));
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  downloadPDF() {
    const doc = new jsPDF()

    // Formatear el número con separador de miles
    const formatNumber = (number: number) => (number ?? 0).toLocaleString('en-US', { minimumFractionDigits: 0 });

    const body = this.slotList.map((slot) => [
      slot.label + ' ',
      slot.selected?.modelo ?? '',
      '$' + formatNumber(slot.selected?.precio ?? 0),
      slot.selected?.tienda ?? '',
      (slot.selected?.consumo ?? 0) + ' W',
    ]);

    body.push(['', 'Total: ', '$' + formatNumber(this.sumaPrecios)]);
    body.push(['', '', '', 'Consumo -', this.sumaConsumo + ' W']);

    autoTable(doc, {
      head: [['', 'Componente', 'Precio', 'Tienda', 'Consumo']],
      body,
    });

    doc.setFontSize(15);
    doc.setTextColor(200, 200, 200);
    doc.text('Mastero - PCMRM 2023', 65, 105);

    doc.save('Cotizacion' + ' ' + (this.sumaPrecios / 1000).toFixed(0) + 'K' + '.pdf');
  }

  downloadCSV() {
    const formatNumber = (number: number) => {
      return '$ ' + new Intl.NumberFormat('en-US').format(number ?? 0);
    };

    const tableData: (string | number)[][] = [
      ['', 'Componente', 'Precio', 'Tienda', 'Consumo'],
      ...this.slotList.map((slot) => [
        slot.label,
        slot.selected?.modelo ?? '',
        formatNumber(slot.selected?.precio ?? 0),
        slot.selected?.tienda ?? '',
        (slot.selected?.consumo ?? 0) + ' W',
      ]),
      ['', 'Total:', formatNumber(this.sumaPrecios)],
      ['', '', '', 'Consumo -', this.sumaConsumo + ' W'],
    ];

    // Convierte los datos en formato CSV
    const csvData = tableData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    // Crea un enlace de descarga para el archivo CSV
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'Cotizacion' + ' ' + (this.sumaPrecios / 1000).toFixed(0) + 'K' + '.csv'
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  }

  openImage(imageUrl: string) {
    this.selectedImage = imageUrl;
    this.resetZoom();
  }

  closeImage() {
    this.selectedImage = null;
    this.resetZoom();
  }

  buildJSON(): any {
    const config: any = {};

    for (const slot of this.slotList) {
      const s = slot.selected;
      const entry: any = {
        modelo: s?.modelo,
        precio: s?.precio ?? 0,
        tienda: s?.tienda,
        consumo: s?.consumo ?? 0,
        url: s?.url,
        img: s?.img,
      };

      if (slot.key === 'fuente') {
        entry.potencia = s?.potencia;
      }

      config[slot.key] = entry;
    }

    console.log(JSON.stringify(config));
    return config;
  }

  compartirConfiguracion() {
    if (!this.compartido) {
      this.compartido = true;
      const jsonConfig = this.buildJSON();

      axios.post(this.endpoint + '/configuraciones/', jsonConfig)
        .then(response => {
          console.log('Configuración compartida con éxito');

          if (response.data.url) {
            this.enlaceCompartir = response.data.url;

            // Auto copiar al portapapeles
            this.clipboard.copy(this.enlaceCompartir);

            // Mostrar aviso de éxito
            this.snackBar.open('¡Enlace generado y copiado al portapapeles!', 'Cerrar', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
            });

            // Desplazar al fondo
            setTimeout(() => {
              window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
              });
            }, 100);

          } else {
            console.error('La respuesta del servidor no incluye la URL esperada.');
            this.compartido = false;
          }
        })
        .catch(error => {
          console.error('Error al compartir configuración', error);
          this.compartido = false;
        });
      this.mostrarCard = true;
    }
  }

  // Método para copiar al portapapeles
  copiarAlPortapapeles() {
    this.clipboard.copy(this.enlaceCompartir);
  }

  zoomIn() {
    if (this.zoom < this.maxZoom) {
      this.zoom += this.zoomStep;
    }
  }

  zoomOut() {
    if (this.zoom > this.minZoom) {
      this.zoom -= this.zoomStep;
    }
  }

  resetZoom() {
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
  }

  onMouseWheel(event: WheelEvent) {
    event.preventDefault();
    const delta = event.deltaY * -0.01;
    const newZoom = this.zoom + delta;

    if (newZoom >= this.minZoom && newZoom <= this.maxZoom) {
      this.zoom = newZoom;
    }
  }

  startPan(event: MouseEvent) {
    this.isPanning = true;
    this.lastX = event.clientX;
    this.lastY = event.clientY;
  }

  pan(event: MouseEvent) {
    if (!this.isPanning) return;

    const deltaX = event.clientX - this.lastX;
    const deltaY = event.clientY - this.lastY;

    this.panX += deltaX;
    this.panY += deltaY;

    this.lastX = event.clientX;
    this.lastY = event.clientY;
  }

  endPan() {
    this.isPanning = false;
  }

  // Método para buscar procesador
  buscarProcesador() {
    if (!this.searchText.trim()) return;

    const searchTerm = this.searchText.toLowerCase();
    const procesadorEncontrado = this.procesadores.find(procesador =>
      procesador.modelo.toLowerCase().includes(searchTerm)
    );

    if (procesadorEncontrado) {
      this.selectComponent('procesador', procesadorEncontrado);
    } else {
      alert('No se encontró el procesador');
    }
  }

  private filterGraficas() {
    if (!this.grafica) {
      return;
    }

    let search = this.graficaFilterCtrl.value;
    if (!search) {
      this.filteredGraficas.next(this.grafica.slice());
      return;
    }

    const searchStr = search.toString().toLowerCase();

    this.filteredGraficas.next(
      this.grafica.filter(grafica =>
        grafica.modelo.toLowerCase().includes(searchStr))
    );
  }

}
