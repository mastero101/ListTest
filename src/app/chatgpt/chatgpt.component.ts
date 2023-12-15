import { Component } from '@angular/core';
import { OpenAiService } from '../openai.service';
import * as configurations from './configurations.json'; // Importa el JSON de configuraciones

import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-chatgpt',
  templateUrl: './chatgpt.component.html',
  styleUrls: ['./chatgpt.component.scss']
})
export class ChatgptComponent {
  messageHistory: string[] = []; // Historial de mensajes
  newMessage: string = '';

  constructor(private openAiService: OpenAiService, private navbarComponent: NavbarComponent) {}

  ngOnInit(){
    this.navbarComponent.showToggleButton = true;
  }

  sendMessage() {
    if (this.newMessage.trim() !== '') {
      // Crea una copia del JSON y conviértelo en una cadena
      const jsonContext = JSON.stringify(configurations);

      // Combina el mensaje del usuario y el contexto JSON
      const combinedMessage = `${this.newMessage}\n\n${jsonContext}`;

      this.messageHistory.push('Tú: ' + this.newMessage);

      // Envía el mensaje combinado al modelo
      this.openAiService.sendPrompt([combinedMessage]).subscribe(response => {
        const aiResponse = response.choices[0].message.content;
        this.messageHistory.push('AI: ' + aiResponse);
      });

      this.newMessage = '';
    }
  }
  
  // Función para dividir el mensaje en líneas
  splitMessage(message: string, maxLength: number): string[] {
    const lines = [];
    for (let i = 0; i < message.length; i += maxLength) {
      lines.push(message.slice(i, i + maxLength));
    }
    return lines;
  }
}