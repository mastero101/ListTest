import { Injectable } from '@angular/core';
import axios from 'axios';

import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;
  private baseUrl2 = 'http://localhost:3000';

  async getUsuarios() {
    const url = `${this.baseUrl}/users/`;
    const response = await axios.get<any[]>(url);
    return response.data;
  }
}
