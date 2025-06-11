import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ChatBotComponent } from './shared/components/chat-bot/chat-bot.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ChatBotComponent],
  template: `
    <router-outlet></router-outlet>
    <app-chat-bot></app-chat-bot>
  `
})
export class AppComponent {
  title = 'traintiq';
} 