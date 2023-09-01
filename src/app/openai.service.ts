import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OpenAiService {
  private apiUrl = 'https://api.openai.com/v1/chat/completions';
  private apiKey: string | null = null; // Store the API key here

  constructor(private http: HttpClient) {
    this.fetchApiKey(); // Fetch the API key when the service is created
  }

  private async fetchApiKey(): Promise<void> {
    try {
      const response = await this.http.get<any[]>('https://masteros.cloud/apikey').toPromise();
      if (Array.isArray(response)) {
        const user = response.find(item => item.id === 2);

        if (user) {
          this.apiKey = user.username; // Store the API key
        }
      }
    } catch (error) {
      console.error('Error fetching API key:', error);
    }
  }

  sendPrompt(messages: string[]): Observable<any> {
    if (!this.apiKey) {
      console.error('API key not found');
      return new Observable();
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    });

    // Convert your messages into OpenAI API format
    const openAiMessages = messages.map(message => ({ role: 'user', content: message }));

    const data = {
      messages: openAiMessages,
      model: 'gpt-3.5-turbo', // specify the model name here
      max_tokens: 200 // Ajusta este valor según tus necesidades
    };

    return this.http.post(this.apiUrl, data, { headers });
  }
}
