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

@Component({
  selector: 'app-builds',
  templateUrl: './builds.component.html',
  styleUrls: ['./builds.component.scss']
})
export class BuildsComponent implements OnInit, OnDestroy{
  procesadores: { precio: number; modelo: string; tienda: string; consumo: string;  socket: string}[] = [];
  motherboard: { precio: number; modelo: string; tienda: string; url: string; consumo: number;  socket: string; rams: any; img: any;}[] = [];
  ram: { precio: number; modelo: string; tienda: string; url: string; consumo: number; socket: any; rams: any; img: any;}[] = [];
  almacenamiento: { precio: number; modelo: string; tienda: string; url: string; consumo: number; img: any;}[] = [];
  disipador: { precio: number; modelo: string; tienda: string; url: string; consumo: number; img: any;}[] = [];
  fuentedepoder: { precio: number; modelo: string; tienda: string; url: string; consumo: number; potencia: number; img: any;}[] = [];
  grafica: { precio: number; modelo: string; tienda: string; url: string; consumo: number; img: any;}[] = [];
  gabinetes: { precio: number; modelo: string; tienda: string; url: string; consumo: number; img: any;}[] = [];
  motherboardFiltradas: { precio: number; modelo: string; tienda: string; url: string; consumo: number; socket: string; rams: any;}[] = [];
  ramFiltradas: { precio: number; modelo: string; tienda: string; url: string; consumo: number; socket: any; rams: any; }[] = [];
  precioSeleccionado: number = 0;
  precioSeleccionado2: number = 0;
  precioSeleccionado3: number = 0;
  precioSeleccionado4: number = 0;
  precioSeleccionado5: number = 0;
  precioSeleccionado6: number = 0;
  precioSeleccionado7: number = 0;
  precioSeleccionado8: number = 0;
  consumoSeleccionado: number = 0;
  consumoSeleccionado2: number = 0;
  consumoSeleccionado3: number = 0;
  consumoSeleccionado4: number = 0;
  consumoSeleccionado5: number = 0;
  consumoSeleccionado6: number = 0;
  consumoSeleccionado7: number = 0;
  consumoSeleccionado8: number = 0; 
  modeloSeleccionado: any;
  modeloSeleccionado2: any;
  modeloSeleccionado3: any;
  modeloSeleccionado4: any;
  modeloSeleccionado5: any;
  modeloSeleccionado6: any;
  modeloSeleccionado7: any;
  modeloSeleccionado8: any;
  tiendaSeleccionada: any;
  tiendaSeleccionada2: any;
  tiendaSeleccionada3: any;
  tiendaSeleccionada4: any;
  tiendaSeleccionada5: any;
  tiendaSeleccionada6: any;
  tiendaSeleccionada7: any;
  tiendaSeleccionada8: any;
  potenciaSeleccionada: any;
  urlSeleccionada: any;
  urlSeleccionada2: any;
  urlSeleccionada3: any;
  urlSeleccionada4: any;
  urlSeleccionada5: any;
  urlSeleccionada6: any;
  urlSeleccionada7: any;
  urlSeleccionada8: any;
  imgSeleccionada: any;
  imgSeleccionada2: any;
  imgSeleccionada3: any;
  imgSeleccionada4: any;
  imgSeleccionada5: any;
  imgSeleccionada6: any;
  imgSeleccionada7: any;
  imgSeleccionada8: any;
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
  
  selectedProcesador: any = null;
  procesadorFilterCtrl = new FormControl('');
  filteredProcesadores: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  protected _onDestroy = new Subject<void>();

  selectedGrafica: any = null;
  graficaFilterCtrl = new FormControl('');
  filteredGraficas: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  compartido: boolean = false;

  constructor(private route: ActivatedRoute, private clipboard: Clipboard, private navbarComponent: NavbarComponent) {}

  ngOnInit(): void {
    this.endpoint2 = 'http://localhost:3000';
    this.endpoint = 'https://nodemysql12.duckdns.org:443';
    
    this.recoverid();
    this.recoverProcesadores();
    this.recovertMotherboard();
    this.recoverRam();
    this.recoverAlmacenamiento();
    this.recoverDisipador();
    this.recoverFuente();
    this.recoverGrafica();
    this.recoverGabinetes();
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
    axios
      .get(this.endpoint+'/components/')
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
    axios
      .get(this.endpoint+'/components/tipo/procesador')
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

  setPrecioSeleccionado(procesador: any) {
    this.selectedProcesador = procesador;
    if (procesador) {
      this.precioSeleccionado = procesador.precio;
      this.modeloSeleccionado = procesador.modelo;
      this.tiendaSeleccionada = procesador.tienda;
      this.consumoSeleccionado = procesador.consumo;
      this.urlSeleccionada = procesador.url;
      this.imgSeleccionada = procesador.img;
      
      this.motherboardFiltradas = this.motherboard.filter(
        motherboard => motherboard.socket === procesador.socket
      );
    } else {
      this.precioSeleccionado = 0;
    }
    
    this.sumatoriaPrecios();
    this.sumatoriaConsumo();
  }  

  recovertMotherboard() {
    axios
      .get(this.endpoint+'/components/tipo/motherboard')
      .then((response) => {
        this.motherboard = response.data.map(
          (item: { modelo: any; precio: number; tienda: any; url: any; consumo: number; socket: any; rams: any; img: any;}) => ({
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
        this.precioSeleccionado2 = 0;
      })
      .catch((error) => {
        console.log(error);
      });
  }

  setPrecioSeleccionado2(modelo: any) {
    const motherboardSeleccionada = this.motherboard.find(
      (item) => item.modelo === modelo
    );
    if (motherboardSeleccionada) {
      this.precioSeleccionado2 = motherboardSeleccionada.precio;
      this.modeloSeleccionado2 = motherboardSeleccionada.modelo;
      this.tiendaSeleccionada2 = motherboardSeleccionada.tienda;
      this.consumoSeleccionado2 = motherboardSeleccionada.consumo;
      this.urlSeleccionada2 = motherboardSeleccionada.url;
      this.imgSeleccionada2 = motherboardSeleccionada.img;

      // Filtrar placas madre según el socket del procesador
      this.ramFiltradas = this.ram.filter(ram => ram.rams === motherboardSeleccionada.rams);
    }
    this.sumatoriaPrecios();
    this.sumatoriaConsumo();
  }

  recoverRam() {
    axios
      .get(this.endpoint+'/components/tipo/ram')
      .then((response) => {
        this.ram = response.data.map(
          (item: { modelo: any; precio: number; tienda: any; url: any ;consumo: number; socket: any; rams: any; img: any; }) => ({
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
        this.precioSeleccionado3 = 0;
      })
      .catch((error) => {
        console.log(error);
      });
  }

  setPrecioSeleccionado3(modelo: string) {
    const ramSeleccionada = this.ram.find((item) => item.modelo === modelo);
    if (ramSeleccionada) {
      this.precioSeleccionado3 = ramSeleccionada.precio;
      this.modeloSeleccionado3 = ramSeleccionada.modelo;
      this.tiendaSeleccionada3 = ramSeleccionada.tienda;
      this.consumoSeleccionado3 = ramSeleccionada.consumo;
      this.urlSeleccionada3 = ramSeleccionada.url;
      this.imgSeleccionada3 = ramSeleccionada.img;
    }
    this.sumatoriaPrecios();
    this.sumatoriaConsumo();
  }

  recoverAlmacenamiento() {
    axios
      .get(this.endpoint+'/components/tipo/almacenamiento')
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
        this.precioSeleccionado4 = 0;
      })
      .catch((error) => {
        console.log(error);
      });
  }

  setPrecioSeleccionado4(modelo: string) {
    const almacenamientoSeleccionado = this.almacenamiento.find(
      (item) => item.modelo === modelo
    );
    if (almacenamientoSeleccionado) {
      this.precioSeleccionado4 = almacenamientoSeleccionado.precio;
      this.modeloSeleccionado4 = almacenamientoSeleccionado.modelo;
      this.tiendaSeleccionada4 = almacenamientoSeleccionado.tienda;
      this.consumoSeleccionado4 = almacenamientoSeleccionado.consumo;
      this.urlSeleccionada4 = almacenamientoSeleccionado.url;
      this.imgSeleccionada4 = almacenamientoSeleccionado.img;
    }
    this.sumatoriaPrecios();
    this.sumatoriaConsumo();
  }

  recoverDisipador() {
    axios
      .get(this.endpoint+'/components/tipo/disipador')
      .then((response) => {
        this.disipador = response.data.map(
          (item: { modelo: any; precio: number; tienda: any; url: any; consumo: number; img: any;}) => ({
            modelo: item.modelo,
            precio: item.precio,
            tienda: item.tienda,
            url: item.url,
            img: item.img,
            consumo: item.consumo,
          })
        );
        this.precioSeleccionado5 = 0;
      })
      .catch((error) => {
        console.log(error);
      });
  }

  setPrecioSeleccionado5(modelo: string) {
    const disipadorSeleccionado = this.disipador.find(
      (item) => item.modelo === modelo
    );
    if (disipadorSeleccionado) {
      this.precioSeleccionado5 = disipadorSeleccionado.precio;
      this.modeloSeleccionado5 = disipadorSeleccionado.modelo;
      this.tiendaSeleccionada5 = disipadorSeleccionado.tienda;
      this.consumoSeleccionado5 = disipadorSeleccionado.consumo;
      this.urlSeleccionada5 = disipadorSeleccionado.url;
      this.imgSeleccionada5 = disipadorSeleccionado.img;
    }
    this.sumatoriaPrecios();
    this.sumatoriaConsumo();
  }

  recoverFuente() {
    axios
      .get(this.endpoint+'/components/tipo/psu')
      .then((response) => {
        this.fuentedepoder = response.data.map(
          (item: { modelo: any; precio: number; tienda: any; url: any; consumo: number; potencia: number; img: any;}) => ({
            modelo: item.modelo,
            precio: item.precio,
            tienda: item.tienda,
            url: item.url,
            img: item.img,
            consumo: item.consumo,
            potencia: item.potencia,
          })
        );
        this.precioSeleccionado6 = 0;
      })
      .catch((error) => {
        console.log(error);
      });
  }

  setPrecioSeleccionado6(modelo: string) {
    const fuenteSeleccionado = this.fuentedepoder.find(
      (item) => item.modelo === modelo
    );
    if (fuenteSeleccionado) {
      this.precioSeleccionado6 = fuenteSeleccionado.precio;
      this.modeloSeleccionado6 =  fuenteSeleccionado.modelo;
      this.tiendaSeleccionada6 = fuenteSeleccionado.tienda;
      this.consumoSeleccionado6 = fuenteSeleccionado.consumo;
      this.potenciaSeleccionada = fuenteSeleccionado.potencia;
      this.urlSeleccionada6 = fuenteSeleccionado.url;
      this.imgSeleccionada6 = fuenteSeleccionado.img;
    }
    console.log(this.potenciaSeleccionada);
    this.sumatoriaPrecios();
    this.sumatoriaConsumo();
  }

  recoverGrafica() {
    axios
      .get(this.endpoint+'/components/tipo/gpu')
      .then((response) => {
        this.grafica = response.data.map(
          (item: { modelo: any; precio: number; tienda: any; url: any; consumo: number; img: any;}) => ({
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
        this.precioSeleccionado7 = 0;
      })
      .catch((error) => {
        console.log(error);
      });
  }

  setPrecioSeleccionado7(grafica: any) {
    this.selectedGrafica = grafica;
    if (grafica) {
      this.precioSeleccionado7 = grafica.precio;
      this.modeloSeleccionado7 = grafica.modelo;
      this.tiendaSeleccionada7 = grafica.tienda;
      this.consumoSeleccionado7 = grafica.consumo;
      this.urlSeleccionada7 = grafica.url;
      this.imgSeleccionada7 = grafica.img;
    } else {
      this.precioSeleccionado7 = 0;
    }
    
    this.sumatoriaPrecios();
    this.sumatoriaConsumo();
  }

  recoverGabinetes() {
    axios
      .get(this.endpoint+'/components/tipo/gabinete')
      .then((response) => {
        this.gabinetes = response.data.map((item: { modelo: any; precio: number; tienda: any; url: any; consumo: number; img: any;}) => ({
          modelo: item.modelo,
          precio: item.precio,
          tienda: item.tienda,
          url: item.url,
          img: item.img,
          consumo: item.consumo,
        }));
        this.precioSeleccionado8 = 0;
      })
      .catch((error) => {
        console.log(error);
      });
  }

  setPrecioSeleccionado8(modelo: string) {
    const gabineteSeleccionado = this.gabinetes.find(
      (item) => item.modelo === modelo,
    );
    if (gabineteSeleccionado) {
      this.precioSeleccionado8 = gabineteSeleccionado.precio;
      this.modeloSeleccionado8 = gabineteSeleccionado.modelo;
      this.tiendaSeleccionada8 = gabineteSeleccionado.tienda;
      this.consumoSeleccionado8 = gabineteSeleccionado.consumo;
      this.urlSeleccionada8 = gabineteSeleccionado.url;
      this.imgSeleccionada8 = gabineteSeleccionado.img;
    }
    this.sumatoriaPrecios();
    this.sumatoriaConsumo();
  }

  sumatoriaPrecios() {
    this.sumaPrecios =
      this.precioSeleccionado +
      this.precioSeleccionado2 +
      this.precioSeleccionado3 +
      this.precioSeleccionado4 +
      this.precioSeleccionado5 +
      this.precioSeleccionado6 +
      this.precioSeleccionado7 +
      this.precioSeleccionado8;
    console.log('$ ' + this.sumaPrecios);
  }

  sumatoriaConsumo() {
    this.sumaConsumo =
      parseInt(this.consumoSeleccionado.toString()) +
      parseInt(this.consumoSeleccionado2.toString()) +
      parseInt(this.consumoSeleccionado3.toString()) +
      parseInt(this.consumoSeleccionado4.toString()) +
      parseInt(this.consumoSeleccionado5.toString()) +
      parseInt(this.consumoSeleccionado6.toString()) +
      parseInt(this.consumoSeleccionado7.toString()) +
      parseInt(this.consumoSeleccionado8.toString());
    console.log(this.sumaConsumo + ' W');
    this.mostrarAdvertencia = this.potenciaSeleccionada*0.81 <= this.sumaConsumo;
  }

  exportToText() {
    if (this.todasLasTiendasSeleccionadas) {
      const text = `Procesador: ${this.modeloSeleccionado}, $${this.precioSeleccionado}, ${this.tiendaSeleccionada}`;
      const text2 = `Placa Madre: ${this.modeloSeleccionado2}, $${this.precioSeleccionado2}, ${this.tiendaSeleccionada2}`;
      const text3 = `Ram: ${this.modeloSeleccionado3}, $${this.precioSeleccionado3}, ${this.tiendaSeleccionada3}`;
      const text4 = `Almacenamiento: ${this.modeloSeleccionado4}, $${this.precioSeleccionado4}, ${this.tiendaSeleccionada4}`;
      const text5 = `Enfriamiento: ${this.modeloSeleccionado5}, $${this.precioSeleccionado5}, ${this.tiendaSeleccionada5}`;
      const text6 = `Fuente: ${this.modeloSeleccionado6}, $${this.precioSeleccionado6}, ${this.tiendaSeleccionada6}`;
      const text7 = `Grafica: ${this.modeloSeleccionado7}, $${this.precioSeleccionado7}, ${this.tiendaSeleccionada7}`;
      const text8 = `Gabinete: ${this.modeloSeleccionado8}, $${this.precioSeleccionado8}, ${this.tiendaSeleccionada8}`;
      const text9 = `--------------------------------------------------------------------`;
      const text10 = `Total: $${this.sumaPrecios}`
      const text11 = `Consumo: ${this.sumaConsumo} W`
      const allText = [text, text2, text3, text4, text5, text6, text7, text8,text9, text10, text11].join('\n\n');
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(allText));
      element.setAttribute('download', ('Cotizacion' + ' ' + (this.sumaPrecios / 1000).toFixed(0) + 'K' + '.txt'));
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
    else {
      const text = `Procesador: ${this.modeloSeleccionado}, $${this.precioSeleccionado}`;
      const text2 = `Placa Madre: ${this.modeloSeleccionado2}, $${this.precioSeleccionado2}`;
      const text3 = `Ram: ${this.modeloSeleccionado3}, $${this.precioSeleccionado3}`;
      const text4 = `Almacenamiento: ${this.modeloSeleccionado4}, $${this.precioSeleccionado4}`;
      const text5 = `Enfriamiento: ${this.modeloSeleccionado5}, $${this.precioSeleccionado5}`;
      const text6 = `Fuente: ${this.modeloSeleccionado6}, $${this.precioSeleccionado6}`;
      const text7 = `Grafica: ${this.modeloSeleccionado7}, $${this.precioSeleccionado7}`;
      const text8 = `Gabinete: ${this.modeloSeleccionado8}, $${this.precioSeleccionado8}`;
      const text9 = `--------------------------------------------------------------------`;
      const text10 = `Total: $${this.sumaPrecios}`
      const text11 = `Consumo: ${this.sumaConsumo} W`
      const allText = [text, text2, text3, text4, text5, text6, text7, text8,text9, text10, text11].join('\n\n');
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(allText));
      element.setAttribute('download', ('Cotizacion' + ' ' + (this.sumaPrecios / 1000).toFixed(0) + 'K' + '.txt'));
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  }

  downloadPDF(){
    const doc = new jsPDF()

    autoTable(doc, {
      head: [['','Componente', 'Precio', 'Tienda', 'Consumo']],
      body: [
        ['Procesador ', this.modeloSeleccionado, "$" + formatNumber(this.precioSeleccionado), this.tiendaSeleccionada, this.consumoSeleccionado + " W"],
        ['Placa Madre ', this.modeloSeleccionado2, "$" + formatNumber(this.precioSeleccionado2), this.tiendaSeleccionada2, this.consumoSeleccionado2 + " W"],
        ['Ram ', this.modeloSeleccionado3, "$" + formatNumber(this.precioSeleccionado3), this.tiendaSeleccionada3, this.consumoSeleccionado3 + " W"],
        ['Almacenamiento ', this.modeloSeleccionado4, "$" + formatNumber(this.precioSeleccionado4), this.tiendaSeleccionada4, this.consumoSeleccionado4 + " W"],
        ['Enfriamiento ', this.modeloSeleccionado5, "$" + formatNumber(this.precioSeleccionado5), this.tiendaSeleccionada5, this.consumoSeleccionado5 + " W"],
        ['Fuente ', this.modeloSeleccionado6, "$" + formatNumber(this.precioSeleccionado6), this.tiendaSeleccionada6, '', '' ],
        ['Gráfica ', this.modeloSeleccionado7, "$" + formatNumber(this.precioSeleccionado7), this.tiendaSeleccionada7, this.consumoSeleccionado7 + " W"],
        ['Gabinete ', this.modeloSeleccionado8, "$" + formatNumber(this.precioSeleccionado8), this.tiendaSeleccionada8, this.consumoSeleccionado8 + " W"],
        ['', 'Total: ', "$" + formatNumber(this.sumaPrecios)],
        ['', '', '', 'Consumo -', this.sumaConsumo + ' W']
      ],
    });

    // Formatear el número con separador de miles
    function formatNumber(number: number) {
      return number.toLocaleString('en-US', { minimumFractionDigits: 0 });
    }
    
    doc.setFontSize(15);
    doc.setTextColor(200, 200, 200); 
    doc.text('Mastero - PCMRM 2023', 65,105);

    doc.save('Cotizacion' + ' ' + (this.sumaPrecios / 1000).toFixed(0) + 'K' + '.pdf');
  }

  downloadCSV() {
    const formatNumber = (number: number) => {
      return '$ ' + new Intl.NumberFormat('en-US').format(number);
    };

    const tableData = [
      ['', 'Componente', 'Precio', 'Tienda', 'Consumo'],
      ['Procesador', this.modeloSeleccionado, formatNumber(this.precioSeleccionado), this.tiendaSeleccionada, this.consumoSeleccionado + " W"],
      ['Placa Madre', this.modeloSeleccionado2, formatNumber(this.precioSeleccionado2), this.tiendaSeleccionada2, this.consumoSeleccionado2 + " W"],
      ['Ram', this.modeloSeleccionado3, formatNumber(this.precioSeleccionado3), this.tiendaSeleccionada3, this.consumoSeleccionado3 + " W"],
      ['Almacenamiento', this.modeloSeleccionado4, formatNumber(this.precioSeleccionado4), this.tiendaSeleccionada4, this.consumoSeleccionado4 + " W"],
      ['Enfriamiento', this.modeloSeleccionado5, formatNumber(this.precioSeleccionado5), this.tiendaSeleccionada5, this.consumoSeleccionado5 + " W"],
      ['Fuente', this.modeloSeleccionado6, formatNumber(this.precioSeleccionado6), this.tiendaSeleccionada6, ''],
      ['Grafica', this.modeloSeleccionado7, formatNumber(this.precioSeleccionado7), this.tiendaSeleccionada7, this.consumoSeleccionado7 + " W"],
      ['Gabinete', this.modeloSeleccionado8, formatNumber(this.precioSeleccionado8), this.tiendaSeleccionada8, this.consumoSeleccionado8 + " W"],
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
    const config = {
      procesador: {
        modelo: this.modeloSeleccionado,
        precio: this.precioSeleccionado,
        tienda: this.tiendaSeleccionada,
        consumo: this.consumoSeleccionado,
        url: this.urlSeleccionada,
        img: this.imgSeleccionada,
      },
      placaMadre: {
        modelo: this.modeloSeleccionado2,
        precio: this.precioSeleccionado2,
        tienda: this.tiendaSeleccionada2,
        consumo: this.consumoSeleccionado2,
        url: this.urlSeleccionada2,
        img: this.imgSeleccionada2,
      },
      ram: {
        modelo: this.modeloSeleccionado3,
        precio: this.precioSeleccionado3,
        tienda: this.tiendaSeleccionada3,
        consumo: this.consumoSeleccionado3,
        url: this.urlSeleccionada3,
        img: this.imgSeleccionada3,
      },
      almacenamiento: {
        modelo: this.modeloSeleccionado4,
        precio: this.precioSeleccionado4,
        tienda: this.tiendaSeleccionada4,
        consumo: this.consumoSeleccionado4,
        url: this.urlSeleccionada4,
        img: this.imgSeleccionada4,
      },
      enfriamiento: {
        modelo: this.modeloSeleccionado5,
        precio: this.precioSeleccionado5,
        tienda: this.tiendaSeleccionada5,
        consumo: this.consumoSeleccionado5,
        url: this.urlSeleccionada5,
        img: this.imgSeleccionada5,
      },
      fuente: {
        modelo: this.modeloSeleccionado6,
        precio: this.precioSeleccionado6,
        tienda: this.tiendaSeleccionada6,
        consumo: this.consumoSeleccionado6,
        potencia: this.potenciaSeleccionada,
        url: this.urlSeleccionada6,
        img: this.imgSeleccionada6,
      },
      grafica: {
        modelo: this.modeloSeleccionado7,
        precio: this.precioSeleccionado7,
        tienda: this.tiendaSeleccionada7,
        consumo: this.consumoSeleccionado7,
        url: this.urlSeleccionada7,
        img: this.imgSeleccionada7,
      },
      gabinete: {
        modelo: this.modeloSeleccionado8,
        precio: this.precioSeleccionado8,
        tienda: this.tiendaSeleccionada8,
        consumo: this.consumoSeleccionado8,
        url: this.urlSeleccionada8,
        img: this.imgSeleccionada8,
      }
    };
    console.log(JSON.stringify(config));
    return config;
  }

  compartirConfiguracion() {
    if (!this.compartido) {
      this.compartido = true;
      const jsonConfig = this.buildJSON();

      axios.post(this.endpoint+'/configuraciones/', jsonConfig)
        .then(response => {
          console.log('Configuración compartida con éxito');

          if (response.data.url) {
            this.enlaceCompartir = response.data.url;
          } else {
            console.error('La respuesta del servidor no incluye la URL esperada.');
          }

        })
        .catch(error => {
          console.error('Error al compartir configuración', error);

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
      this.setPrecioSeleccionado(procesadorEncontrado);
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
