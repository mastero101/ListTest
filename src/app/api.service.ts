import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl2 = 'https://masteros.cloud';
  private baseUrl = 'http://localhost:3000';

  async getUsuarios() {
    const url = `${this.baseUrl}/usuarios`;
    const response = await axios.get<any[]>(url);
    return response.data;
  }
}
