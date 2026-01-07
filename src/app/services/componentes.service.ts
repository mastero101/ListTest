import { Injectable } from '@angular/core';
import axios from 'axios';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ComponentesService {
  endpoint = 'https://nodemysql12.duckdns.org:443/components';

  private _isLoading = new BehaviorSubject<boolean>(false);
  isLoading$ = this._isLoading.asObservable();

  constructor() { }

  async obtenerComponentes() {
    this._isLoading.next(true);
    try {
      const response = await axios.get(this.endpoint);
      await new Promise(resolve => setTimeout(resolve, 800));
      return response.data;
    } catch (error) {
      console.error('Error al recuperar componentes', error);
      throw error;
    } finally {
      this._isLoading.next(false);
    }
  }
}
