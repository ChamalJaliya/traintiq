import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { TourService } from './shared/services/tour.service';

@Component({
  selector: 'app-test-tour',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatListModule
  ],
  template: `
    <div class="test-tour-container">
      <mat-card class="test-header">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>science</mat-icon>
            Tour System Testing Dashboard
          </mat-card-title>
          <mat-card-subtitle>
            Comprehensive testing interface for the Traintiq Tour System
          </mat-card-subtitle>
        </mat-card-header>
      </mat-card>

      <div class="test-grid">
        <!-- Current Tour Status -->
        <mat-card class="status-card">
          <mat-card-header>
            <mat-card-title>Current Tour Status</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-list>
              <mat-list-item>
                <mat-icon matListItemIcon>{{ tourService.isActive() ? 'play_circle' : 'stop_circle' }}</mat-icon>
                <div matListItemTitle>Active</div>
                <div matListItemLine>{{ tourService.isActive() ? 'Yes' : 'No' }}</div>
              </mat-list-item>
              
              <mat-list-item>
                <mat-icon matListItemIcon>tour</mat-icon>
                <div matListItemTitle>Current Tour</div>
                <div matListItemLine>{{ tourService.currentTour()?.name || 'None' }}</div>
              </mat-list-item>
              
              <mat-list-item>
                <mat-icon matListItemIcon>linear_scale</mat-icon>
                <div matListItemTitle>Progress</div>
                <div matListItemLine>
                  Step {{ tourService.currentStepIndex() + 1 }} of {{ tourService.currentTour()?.steps.length || 0 }}
                </div>
              </mat-list-item>
              
              <mat-list-item>
                <mat-icon matListItemIcon>percent</mat-icon>
                <div matListItemTitle>Completion</div>
                <div matListItemLine>{{ tourService.progress() }}%</div>
              </mat-list-item>
            </mat-list>
          </mat-card-content>
        </mat-card>

        <!-- Available Tours -->
        <mat-card class="tours-card">
          <mat-card-header>
            <mat-card-title>Available Tours ({{ totalTours() }})</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            @for (tour of tours(); track tour.id) {
              <div class="tour-item">
                <div class="tour-info">
                  <h4>{{ tour.name }}</h4>
                  <p>{{ tour.description }}</p>
                  <div class="tour-meta">
                    <mat-chip-listbox>
                      <mat-chip-option [selected]="tourService.isTourCompleted(tour.id)" [color]="tourService.isTourCompleted(tour.id) ? 'accent' : 'basic'">
                        <mat-icon>{{ tourService.isTourCompleted(tour.id) ? 'check_circle' : 'radio_button_unchecked' }}</mat-icon>
                        {{ tourService.isTourCompleted(tour.id) ? 'Completed' : 'Available' }}
                      </mat-chip-option>
                      <mat-chip-option color="primary">
                        <mat-icon>steps</mat-icon>
                        {{ tour.steps.length }} steps
                      </mat-chip-option>
                    </mat-chip-listbox>
                  </div>
                </div>
                <div class="tour-actions">
                  <button 
                    mat-raised-button 
                    color="primary" 
                    (click)="startTour(tour.id)"
                    [disabled]="tourService.isActive()">
                    <mat-icon>play_arrow</mat-icon>
                    Start Tour
                  </button>
                  <button 
                    mat-button 
                    (click)="resetTourCompletion(tour.id)"
                    [disabled]="!tourService.isTourCompleted(tour.id)">
                    <mat-icon>refresh</mat-icon>
                    Reset Progress
                  </button>
                </div>
              </div>
              <mat-divider></mat-divider>
            }
          </mat-card-content>
        </mat-card>

        <!-- Tour Controls -->
        <mat-card class="controls-card">
          <mat-card-header>
            <mat-card-title>Tour Controls</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="control-group">
              <h4>Navigation</h4>
              <div class="button-group">
                <button 
                  mat-raised-button 
                  (click)="previousStep()" 
                  [disabled]="!tourService.isActive() || tourService.isFirstStep()">
                  <mat-icon>arrow_back</mat-icon>
                  Previous
                </button>
                <button 
                  mat-raised-button 
                  color="primary" 
                  (click)="nextStep()" 
                  [disabled]="!tourService.isActive()">
                  <mat-icon>arrow_forward</mat-icon>
                  Next
                </button>
              </div>
            </div>

            <div class="control-group">
              <h4>Tour Management</h4>
              <div class="button-group">
                <button 
                  mat-raised-button 
                  color="warn" 
                  (click)="skipTour()" 
                  [disabled]="!tourService.isActive()">
                  <mat-icon>skip_next</mat-icon>
                  Skip Tour
                </button>
                <button 
                  mat-raised-button 
                  color="accent" 
                  (click)="endTour()" 
                  [disabled]="!tourService.isActive()">
                  <mat-icon>stop</mat-icon>
                  End Tour
                </button>
              </div>
            </div>

            <div class="control-group">
              <h4>Testing Utilities</h4>
              <div class="button-group">
                <button mat-button (click)="clearAllProgress()">
                  <mat-icon>clear_all</mat-icon>
                  Clear All Progress
                </button>
                <button mat-button (click)="showTourData()">
                  <mat-icon>data_object</mat-icon>
                  Show Tour Data
                </button>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Current Step Details -->
        @if (tourService.isActive() && tourService.currentStep()) {
          <mat-card class="step-details-card">
            <mat-card-header>
              <mat-card-title>Current Step Details</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <mat-list>
                <mat-list-item>
                  <mat-icon matListItemIcon>title</mat-icon>
                  <div matListItemTitle>Title</div>
                  <div matListItemLine>{{ tourService.currentStep()?.title }}</div>
                </mat-list-item>
                
                <mat-list-item>
                  <mat-icon matListItemIcon>description</mat-icon>
                  <div matListItemTitle>Content</div>
                  <div matListItemLine>{{ tourService.currentStep()?.content }}</div>
                </mat-list-item>
                
                <mat-list-item>
                  <mat-icon matListItemIcon>my_location</mat-icon>
                  <div matListItemTitle>Target</div>
                  <div matListItemLine>{{ tourService.currentStep()?.target }}</div>
                </mat-list-item>
                
                <mat-list-item>
                  <mat-icon matListItemIcon>place</mat-icon>
                  <div matListItemTitle>Position</div>
                  <div matListItemLine>{{ tourService.currentStep()?.position || 'auto' }}</div>
                </mat-list-item>
                
                @if (tourService.currentStep()?.route) {
                  <mat-list-item>
                    <mat-icon matListItemIcon>route</mat-icon>
                    <div matListItemTitle>Route</div>
                    <div matListItemLine>{{ tourService.currentStep()?.route }}</div>
                  </mat-list-item>
                }
              </mat-list>
            </mat-card-content>
          </mat-card>
        }

        <!-- Test Results -->
        <mat-card class="results-card">
          <mat-card-header>
            <mat-card-title>Test Results & Logs</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="log-container">
              @for (log of testLogs(); track $index) {
                <div class="log-entry" [class]="log.type">
                  <mat-icon>{{ getLogIcon(log.type) }}</mat-icon>
                  <span class="log-time">{{ log.timestamp | date:'HH:mm:ss' }}</span>
                  <span class="log-message">{{ log.message }}</span>
                </div>
              }
              @if (testLogs().length === 0) {
                <div class="no-logs">
                  <mat-icon>info</mat-icon>
                  No test logs yet. Start interacting with the tour system to see logs.
                </div>
              }
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .test-tour-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .test-header {
      margin-bottom: 20px;
      background: linear-gradient(135deg, #1976d2, #42a5f5);
      color: white;
    }

    .test-header mat-card-title {
      display: flex;
      align-items: center;
      gap: 12px;
      color: white;
    }

    .test-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
    }

    .status-card, .tours-card, .controls-card, .step-details-card, .results-card {
      height: fit-content;
    }

    .tour-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
      gap: 16px;
    }

    .tour-info {
      flex: 1;
    }

    .tour-info h4 {
      margin: 0 0 8px 0;
      color: #1976d2;
      font-weight: 500;
    }

    .tour-info p {
      margin: 0 0 12px 0;
      color: #666;
      font-size: 14px;
    }

    .tour-meta {
      display: flex;
      gap: 8px;
    }

    .tour-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .control-group {
      margin-bottom: 24px;
    }

    .control-group h4 {
      margin: 0 0 12px 0;
      color: #1976d2;
      font-weight: 500;
    }

    .button-group {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .log-container {
      max-height: 300px;
      overflow-y: auto;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 12px;
    }

    .log-entry {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      border-radius: 4px;
      margin-bottom: 4px;
      font-size: 14px;
      font-family: 'Roboto Mono', monospace;
    }

    .log-entry.info {
      background: #e3f2fd;
      color: #1976d2;
    }

    .log-entry.success {
      background: #e8f5e8;
      color: #2e7d32;
    }

    .log-entry.warning {
      background: #fff3e0;
      color: #f57c00;
    }

    .log-entry.error {
      background: #ffebee;
      color: #d32f2f;
    }

    .log-time {
      font-size: 12px;
      opacity: 0.7;
      min-width: 60px;
    }

    .log-message {
      flex: 1;
    }

    .no-logs {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 20px;
      text-align: center;
      color: #666;
      font-style: italic;
    }

    @media (max-width: 768px) {
      .test-grid {
        grid-template-columns: 1fr;
      }
      
      .tour-item {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .tour-actions {
        width: 100%;
        flex-direction: row;
      }
    }
  `]
})
export class TestTourComponent {
  readonly tourService = inject(TourService);
  
  // Computed values
  readonly tours = computed(() => this.tourService.getTours());
  readonly totalTours = computed(() => this.tours().length);
  readonly testLogs = computed(() => this._testLogs());
  
  // Test logs
  private _testLogs = signal<Array<{
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
    timestamp: Date;
  }>>([]);

  constructor() {
    this.addLog('info', 'Tour testing dashboard initialized');
    this.addLog('info', `Found ${this.totalTours()} available tours`);
  }

  startTour(tourId: string): void {
    this.tourService.startTour(tourId);
    this.addLog('success', `Started tour: ${tourId}`);
  }

  nextStep(): void {
    this.tourService.nextStep();
    this.addLog('info', `Advanced to step ${this.tourService.currentStepIndex() + 1}`);
  }

  previousStep(): void {
    this.tourService.previousStep();
    this.addLog('info', `Moved back to step ${this.tourService.currentStepIndex() + 1}`);
  }

  skipTour(): void {
    this.tourService.skipTour();
    this.addLog('warning', 'Tour skipped by user');
  }

  endTour(): void {
    this.tourService.endTour();
    this.addLog('info', 'Tour ended manually');
  }

  resetTourCompletion(tourId: string): void {
    this.tourService.resetTourCompletion(tourId);
    this.addLog('success', `Reset completion status for tour: ${tourId}`);
  }

  clearAllProgress(): void {
    this.tours().forEach(tour => {
      this.tourService.resetTourCompletion(tour.id);
    });
    localStorage.removeItem('tour_welcome_dismissed');
    this.addLog('warning', 'Cleared all tour progress and welcome status');
  }

  showTourData(): void {
    const data = {
      isActive: this.tourService.isActive(),
      currentTour: this.tourService.currentTour(),
      currentStep: this.tourService.currentStep(),
      progress: this.tourService.progress(),
      userPreferences: this.tourService.userPreferences()
    };
    console.log('Tour System Data:', data);
    this.addLog('info', 'Tour data logged to console');
  }

  getLogIcon(type: string): string {
    switch (type) {
      case 'success': return 'check_circle';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'info';
    }
  }

  private addLog(type: 'info' | 'success' | 'warning' | 'error', message: string): void {
    this._testLogs.update(logs => [
      ...logs,
      { type, message, timestamp: new Date() }
    ].slice(-50)); // Keep only last 50 logs
  }
} 