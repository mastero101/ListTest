import { Component, OnInit } from '@angular/core';
import axios from 'axios';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'

@Component({
  selector: 'app-builds',
  templateUrl: './builds.component.html',
  styleUrls: ['./builds.component.scss']
})
export class BuildsComponent implements OnInit{
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
  
  constructor() {}

  ngOnInit(): void {
    this.recoverid();
    this.recoverProcesadores();
    this.recovertMotherboard();
    this.recoverRam();
    this.recoverAlmacenamiento();
    this.recoverDisipador();
    this.recoverFuente();
    this.recoverGrafica();
    this.recoverGabinetes();
  }

  recoverid() {
    axios
      .get(`https://nodemysql12.duckdns.org:443/`)
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
      .get('https://nodemysql12.duckdns.org:443/procesadores')
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
      })
      .catch((error) => {
        console.log(error);
      });
  }

  setPrecioSeleccionado(procesadorSeleccionado: any) {
    if (procesadorSeleccionado) {
      this.precioSeleccionado = procesadorSeleccionado.precio;
      this.modeloSeleccionado = procesadorSeleccionado.modelo;
      this.tiendaSeleccionada = procesadorSeleccionado.tienda;
      this.consumoSeleccionado = procesadorSeleccionado.consumo;
      this.urlSeleccionada = procesadorSeleccionado.url;
      this.imgSeleccionada = procesadorSeleccionado.img;
      
      // Filtrar placas madre según el socket del procesador
      this.motherboardFiltradas = this.motherboard.filter(motherboard => motherboard.socket === procesadorSeleccionado.socket);
      
      // Reiniciar el valor seleccionado de la placa madre
      this.precioSeleccionado2 = 0;
    } else {
      this.precioSeleccionado = 0;
    }
    
    this.sumatoriaPrecios();
    this.sumatoriaConsumo();
  }  

  recovertMotherboard() {
    axios
      .get('https://nodemysql12.duckdns.org:443/motherboards')
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
      .get('https://nodemysql12.duckdns.org:443/rams')
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
      .get('https://nodemysql12.duckdns.org:443/almacenamientos')
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
      .get('https://nodemysql12.duckdns.org:443/disipadores')
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
      .get('https://nodemysql12.duckdns.org:443/fuentes')
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
      .get('https://nodemysql12.duckdns.org:443/graficas')
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
        this.precioSeleccionado7 = 0;
      })
      .catch((error) => {
        console.log(error);
      });
  }

  setPrecioSeleccionado7(modelo: string) {
    const graficaSeleccionado = this.grafica.find(
      (item) => item.modelo === modelo
    );
    if (graficaSeleccionado) {
      this.precioSeleccionado7 = graficaSeleccionado.precio;
      this.modeloSeleccionado7 = graficaSeleccionado.modelo;
      this.tiendaSeleccionada7 = graficaSeleccionado.tienda;
      this.consumoSeleccionado7 = graficaSeleccionado.consumo;
      this.urlSeleccionada7 = graficaSeleccionado.url;
      this.imgSeleccionada7 = graficaSeleccionado.img;
    }
    this.sumatoriaPrecios();
    this.sumatoriaConsumo();
  }

  recoverGabinetes() {
    axios
      .get('https://nodemysql12.duckdns.org:443/gabinetes')
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
    element.setAttribute('download', 'armado.txt');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  downloadPDF(){
    const doc = new jsPDF()

    autoTable(doc, {
      head: [['','Componente', 'Precio', 'Tienda', 'Consumo']],
      body: [
        ['Procesador ', this.modeloSeleccionado, "$" + this.precioSeleccionado, this.tiendaSeleccionada, this.consumoSeleccionado + " W"],
        ['Placa Madre ', this.modeloSeleccionado2, "$" + this.precioSeleccionado2, this.tiendaSeleccionada2, this.consumoSeleccionado2 + " W"],
        ['Ram ', this.modeloSeleccionado3, "$" + this.precioSeleccionado3, this.tiendaSeleccionada3, this.consumoSeleccionado3 + " W"],
        ['Almacenamiento ', this.modeloSeleccionado4, "$" + this.precioSeleccionado4, this.tiendaSeleccionada4, this.consumoSeleccionado4 + " W"],
        ['Enfriamiento ', this.modeloSeleccionado5, "$" + this.precioSeleccionado5, this.tiendaSeleccionada5, this.consumoSeleccionado5 + " W"],
        ['Fuente ', this.modeloSeleccionado6, "$" + this.precioSeleccionado6, this.tiendaSeleccionada6, '', '' ],
        ['Gráfica ', this.modeloSeleccionado7, "$" + this.precioSeleccionado7, this.tiendaSeleccionada7, this.consumoSeleccionado7 + " W"],
        ['Gabinete ', this.modeloSeleccionado8, "$" + this.precioSeleccionado8, this.tiendaSeleccionada8, this.consumoSeleccionado8 + " W"],
        ['', 'Total: ', "$" + this.sumaPrecios],
        ['', '', '', 'Consumo -', this.sumaConsumo + ' W']
      ],
    })

    doc.save('Cotizacion' + ' ' + (this.sumaPrecios / 1000).toFixed(0) + 'K' + '.pdf');
  }

  openImage(imageUrl: string) {
    this.selectedImage = imageUrl;
  }
  
  closeImage() {
    this.selectedImage = null;
  }
}
