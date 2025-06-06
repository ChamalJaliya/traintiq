import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Required for *ngIf, *ngFor
import { RouterModule } from '@angular/router'; // For routerLink and router-outlet

// Angular Material Imports for the toolbar
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root', // Selector remains app-root
  templateUrl: './app.html', // Corrected template URL
  styleUrl: './app.scss',    // Corrected style URL
  standalone: true, // This component is standalone
  imports: [
    CommonModule,
    RouterModule, // Import RouterModule for routing functionality
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class App { // Class name is App
  title = 'traintiq';
  currentYear: number = new Date().getFullYear(); // Added for the footer
}
