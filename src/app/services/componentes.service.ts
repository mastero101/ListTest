import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class ComponentesService {
  endpoint = 'https://nodemysql12.duckdns.org:443/componentes';

  constructor() {}

  async obtenerComponentes() {
    try {
      const response = await axios.get(this.endpoint);
      return response.data;
    } catch (error) {
      console.error('Error al recuperar componentes', error);
      throw error; // Lanza el error para manejarlo en el componente
    }
  }
}
