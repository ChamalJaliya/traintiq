import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { EmployeeProfileService } from '../../../../data/employee-profile.service';
import { EmployeeProfile } from '../../../../../../shared/models/employee-profile.model';

@Component({
  selector: 'app-viewer-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  template: `
    <div class="container mx-auto p-6">
      <mat-card *ngIf="profile" class="max-w-4xl mx-auto">
        <!-- Header -->
        <mat-card-header class="mb-6">
          <div class="flex justify-between items-center w-full">
            <div>
              <mat-card-title class="text-2xl font-bold">{{ profile.personalInfo.firstName }} {{ profile.personalInfo.lastName }}</mat-card-title>
              <mat-card-subtitle>{{ profile.experience[0]?.title }}</mat-card-subtitle>
            </div>
            <div class="flex gap-2">
              <button mat-icon-button 
                      matTooltip="Download Profile"
                      (click)="downloadProfile()">
                <mat-icon>download</mat-icon>
              </button>
              <button mat-raised-button 
                      color="primary"
                      [routerLink]="['edit']">
                <mat-icon>edit</mat-icon>
                Edit Profile
              </button>
            </div>
          </div>
        </mat-card-header>

        <!-- Content -->
        <mat-card-content>
          <mat-tab-group>
            <!-- Overview Tab -->
            <mat-tab label="Overview">
              <div class="p-4">
                <h3 class="text-xl font-semibold mb-4">Professional Summary</h3>
                <p class="text-gray-700 mb-6">{{ profile.experience[0]?.description }}</p>

                <!-- Skills -->
                <div class="mb-6">
                  <h3 class="text-xl font-semibold mb-4">Skills</h3>
                  <div class="flex flex-wrap gap-2">
                    <mat-chip *ngFor="let skill of profile.skills.technical"
                             [matTooltip]="'Level: ' + skill.level + '/5'">
                      {{ skill.name }}
                      <mat-progress-bar class="mt-1"
                                      mode="determinate"
                                      [value]="(skill.level / 5) * 100">
                      </mat-progress-bar>
                    </mat-chip>
                  </div>
                </div>

                <!-- Contact Information -->
                <div class="bg-gray-50 p-4 rounded">
                  <h3 class="text-xl font-semibold mb-4">Contact Information</h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="flex items-center">
                      <mat-icon class="mr-2">email</mat-icon>
                      <span>{{ profile.personalInfo.email }}</span>
                    </div>
                    <div class="flex items-center" *ngIf="profile.personalInfo.phone">
                      <mat-icon class="mr-2">phone</mat-icon>
                      <span>{{ profile.personalInfo.phone }}</span>
                    </div>
                    <div class="flex items-center" *ngIf="profile.personalInfo.location">
                      <mat-icon class="mr-2">location_on</mat-icon>
                      <span>{{ profile.personalInfo.location }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </mat-tab>

            <!-- Experience Tab -->
            <mat-tab label="Experience">
              <div class="p-4">
                <div *ngFor="let exp of profile.experience" class="mb-6">
                  <div class="flex justify-between items-start">
                    <div>
                      <h3 class="text-lg font-semibold">{{ exp.title }}</h3>
                      <p class="text-gray-600">{{ exp.company }}</p>
                    </div>
                    <p class="text-gray-500">
                      {{ exp.startDate | date:'MMM yyyy' }} - 
                      {{ exp.current ? 'Present' : (exp.endDate | date:'MMM yyyy') }}
                    </p>
                  </div>
                  <p class="mt-2 text-gray-700">{{ exp.description }}</p>
                  <div class="mt-2">
                    <mat-chip *ngFor="let tech of exp.technologies" class="mr-2">
                      {{ tech }}
                    </mat-chip>
                  </div>
                </div>
              </div>
            </mat-tab>

            <!-- Education Tab -->
            <mat-tab label="Education">
              <div class="p-4">
                <div *ngFor="let edu of profile.education" class="mb-6">
                  <div class="flex justify-between items-start">
                    <div>
                      <h3 class="text-lg font-semibold">{{ edu.degree }}</h3>
                      <p class="text-gray-600">{{ edu.institution }}</p>
                    </div>
                    <p class="text-gray-500">
                      {{ edu.startDate | date:'yyyy' }} - 
                      {{ edu.current ? 'Present' : (edu.endDate | date:'yyyy') }}
                    </p>
                  </div>
                  <p class="mt-2 text-gray-700">{{ edu.field }}</p>
                  <div *ngIf="edu.achievements?.length" class="mt-2">
                    <h4 class="font-medium mb-2">Achievements</h4>
                    <ul class="list-disc list-inside">
                      <li *ngFor="let achievement of edu.achievements" class="text-gray-700">
                        {{ achievement }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </mat-tab>
          </mat-tab-group>
        </mat-card-content>
      </mat-card>

      <!-- Loading State -->
      <div *ngIf="!profile" class="flex justify-center items-center h-64">
        <mat-progress-bar mode="indeterminate" class="w-64"></mat-progress-bar>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .mat-mdc-card {
      margin-bottom: 2rem;
    }

    .mat-mdc-chip {
      min-height: 48px;
    }
  `]
})
export class ViewerPageComponent implements OnInit {
  profile: EmployeeProfile | null = null;

  constructor(
    private route: ActivatedRoute,
    private employeeProfileService: EmployeeProfileService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadProfile(params['id']);
      }
    });
  }

  private loadProfile(id: string): void {
    this.employeeProfileService.getProfileById(id).subscribe({
      next: (profile) => {
        this.profile = profile;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.snackBar.open('Failed to load profile. Please try again.', 'Close', {
          duration: 5000,
          panelClass: ['snackbar-error']
        });
      }
    });
  }

  downloadProfile(): void {
    if (!this.profile) return;

    const jsonString = JSON.stringify(this.profile, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.profile.personalInfo.firstName}-${this.profile.personalInfo.lastName}-profile.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
} 