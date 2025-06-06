import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatListModule,
    MatSlideToggleModule
  ],
  template: `
    <div class="page-container">
      <mat-card class="settings-card">
        <mat-card-header>
          <mat-card-title>Settings</mat-card-title>
          <mat-card-subtitle>Configure your profile generation preferences</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <mat-list>
            <mat-list-item>
              <mat-icon matListItemIcon>notifications</mat-icon>
              <div matListItemTitle>Email Notifications</div>
              <div matListItemLine>Receive notifications when profile generation is complete</div>
              <mat-slide-toggle matListItemMeta></mat-slide-toggle>
            </mat-list-item>
            <mat-divider></mat-divider>
            <mat-list-item>
              <mat-icon matListItemIcon>history</mat-icon>
              <div matListItemTitle>Auto-save History</div>
              <div matListItemLine>Automatically save generated profiles to history</div>
              <mat-slide-toggle matListItemMeta checked></mat-slide-toggle>
            </mat-list-item>
            <mat-divider></mat-divider>
            <mat-list-item>
              <mat-icon matListItemIcon>dark_mode</mat-icon>
              <div matListItemTitle>Dark Mode</div>
              <div matListItemLine>Switch between light and dark theme</div>
              <mat-slide-toggle matListItemMeta></mat-slide-toggle>
            </mat-list-item>
          </mat-list>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
    }

    .settings-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);

      mat-card-content {
        padding: 16px 0;
      }
    }

    mat-list-item {
      height: 72px !important;
      
      .mat-icon {
        color: #3f51b5;
      }

      [matListItemTitle] {
        font-weight: 500;
        margin-bottom: 4px;
      }

      [matListItemLine] {
        color: rgba(0,0,0,0.6);
        font-size: 14px;
      }
    }
  `]
})
export class SettingsPageComponent { } 