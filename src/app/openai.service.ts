import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OpenAiService {
  private apiKey = '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';
  private apiUrl = 'https://api.openai.com/v1/chat/completions';

  constructor(private http: HttpClient) {}

  sendPrompt(messages: string[]): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    });

    // Convert your messages into OpenAI API format
    const openAiMessages = messages.map(message => ({ role: 'user', content: message }));

    const data = {
      messages: openAiMessages,
      model: 'gpt-3.5-turbo', // specify the model name here
      max_tokens: 150 // Ajusta este valor según tus necesidades
    };

    return this.http.post(this.apiUrl, data, { headers });
  }
}
