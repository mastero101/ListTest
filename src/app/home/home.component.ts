import { Component, OnInit } from '@angular/core';
import axios from 'axios';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  configuracionEntrada: any = null;
  configuracionBaja: any = null;
  configuracionMedia: any = null;
  configuracionAlta: any = null;
  configuracionTrabajo: any = null;
  cargando = true;

  constructor(private router: Router) {}

  getConfigId(config: any): string {
    return config?.configId || '';
  }

  async ngOnInit() {
    try {
      const configIds = ['618', '619', '620', '621', '622'];
      const [configEntrada, configBaja, configMedia, configAlta, configTrabajo] = await Promise.all([
        this.recuperarConfiguracion(configIds[0]),
        this.recuperarConfiguracion(configIds[1]),
        this.recuperarConfiguracion(configIds[2]),
        this.recuperarConfiguracion(configIds[3]),
        this.recuperarConfiguracion(configIds[4])
      ]);

      this.configuracionEntrada = { ...configEntrada, configId: configIds[0] };
      this.configuracionBaja = { ...configBaja, configId: configIds[1] };
      this.configuracionMedia = { ...configMedia, configId: configIds[2] };
      this.configuracionAlta = { ...configAlta, configId: configIds[3] };
      this.configuracionTrabajo = { ...configTrabajo, configId: configIds[4] };
    } catch (error) {
      console.error('Error al cargar configuraciones:', error);
    } finally {
      this.cargando = false;
    }
  }

  private async recuperarConfiguracion(configId: string) {
    const response = await axios.get(`https://nodemysql12.duckdns.org:443/recuperar-configuracion/${configId}`);
    return response.data;
  }

  calcularPrecioTotal(configData: any): number {
    let total = 0;
    for (const key in configData) {
      if (configData[key] && configData[key].precio) {
        total += configData[key].precio;
      }
    }
    return total;
  }

  calcularConsumoTotal(configData: any): number {
    let consumoTotal = 0;
    for (const key in configData) {
      if (configData[key] && configData[key].consumo) {
        consumoTotal += parseInt(configData[key].consumo);
      }
    }
    return consumoTotal;
  }

  cargarConfiguracion(configId: string) {
    this.router.navigate(['/configuracion', configId]);
  }
}
