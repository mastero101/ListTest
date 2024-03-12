import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'https://nodemysql12.duckdns.org:443';
  private baseUrl2 = 'http://localhost:3000';

  async getUsuarios() {
    const url = `${this.baseUrl}/usuarios`;
    const response = await axios.get<any[]>(url);
    return response.data;
  }
}
