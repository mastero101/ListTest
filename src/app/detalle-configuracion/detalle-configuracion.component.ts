import { Component } from '@angular/core';
import axios from 'axios';

import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-detalle-configuracion',
  templateUrl: './detalle-configuracion.component.html',
  styleUrls: ['./detalle-configuracion.component.scss']
})

export class DetalleConfiguracionComponent {
  configData: any = {};
  Object = Object;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
    const configId = params['id'];
      if (configId) {
        this.recoverConfiguracion(configId);
      }
    });
  }

  recoverConfiguracion(configId: string) {
    this.configData = {};
    // Haz una solicitud al servidor para recuperar la configuración basada en el ID
    axios.get(`https://nodemysql12.duckdns.org:443/recuperar-configuracion/${configId}`)
      .then(response => {
        this.configData = response.data;
        console.log(this.configData);
      })
      .catch(error => {
        console.error('Error al recuperar configuración', error);
        // Manejar el error según sea necesario
      });
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
}
