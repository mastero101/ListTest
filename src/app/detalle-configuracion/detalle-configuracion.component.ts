import { Component } from '@angular/core';
import axios from 'axios';

import { ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-detalle-configuracion',
  templateUrl: './detalle-configuracion.component.html',
  styleUrls: ['./detalle-configuracion.component.scss']
})

export class DetalleConfiguracionComponent {
  configData: any = {};
  Object = Object;
  fechaHora: any;

  constructor(private route: ActivatedRoute, private navbarComponent: NavbarComponent) {}

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
}
