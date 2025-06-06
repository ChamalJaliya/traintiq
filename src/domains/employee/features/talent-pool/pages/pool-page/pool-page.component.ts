import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';

import { EmployeeProfileService } from '../../../../data/employee-profile.service';
import { EmployeeProfile } from '../../../../../../shared/models/employee-profile.model';
import { BehaviorSubject, Observable, combineLatest, debounceTime, map, startWith, switchMap } from 'rxjs';
import { ProfileViewerDialogComponent } from '../../../profile-viewer/dialogs/profile-viewer-dialog/profile-viewer-dialog.component';

@Component({
  selector: 'app-pool-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    MatSelectModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatDialogModule
  ],
  template: `
    <div class="container mx-auto p-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Talent Pool</h1>
          <p class="text-gray-600 mt-1">Find and manage employee profiles</p>
        </div>
        <button mat-raised-button 
                color="primary" 
                routerLink="../profiles/new">
          <mat-icon>person_add</mat-icon>
          Add Profile
        </button>
      </div>

      <!-- Filters -->
      <mat-card class="mb-6">
        <mat-card-content>
          <form [formGroup]="filterForm" class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <mat-form-field>
              <mat-label>Search</mat-label>
              <input matInput 
                     formControlName="search" 
                     placeholder="Search by name, skills, or company">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field>
              <mat-label>Skills</mat-label>
              <mat-chip-grid #chipGrid>
                <mat-chip-row *ngFor="let skill of selectedSkills"
                            (removed)="removeSkill(skill)">
                  {{skill}}
                  <button matChipRemove>
                    <mat-icon>cancel</mat-icon>
                  </button>
                </mat-chip-row>
                <input placeholder="Add skill..."
                       [matChipInputFor]="chipGrid"
                       (matChipInputTokenEnd)="addSkill($event)">
              </mat-chip-grid>
            </mat-form-field>

            <mat-form-field>
              <mat-label>Experience Level</mat-label>
              <mat-select formControlName="experienceLevel">
                <mat-option value="">All Levels</mat-option>
                <mat-option value="junior">Junior (0-2 years)</mat-option>
                <mat-option value="mid">Mid-Level (3-5 years)</mat-option>
                <mat-option value="senior">Senior (6+ years)</mat-option>
              </mat-select>
            </mat-form-field>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Results -->
      <mat-card>
        <mat-card-content>
          <div *ngIf="isLoading" class="flex justify-center items-center h-64">
            <mat-progress-bar mode="indeterminate" class="w-64"></mat-progress-bar>
          </div>

          <div *ngIf="error" class="text-center text-red-600 p-4">
            {{ error }}
            <button mat-button color="primary" (click)="retry()">Retry</button>
          </div>

          <ng-container *ngIf="!isLoading && !error">
            <!-- Table View -->
            <table mat-table [dataSource]="filteredProfiles$ | async" matSort class="w-full">
              <!-- Name Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
                <td mat-cell *matCellDef="let profile">
                  <div class="flex items-center">
                    <img *ngIf="profile.personalInfo.profileImage" 
                         [src]="profile.personalInfo.profileImage"
                         class="w-8 h-8 rounded-full mr-2"
                         [alt]="profile.personalInfo.firstName">
                    <div>
                      {{ profile.personalInfo.firstName }} {{ profile.personalInfo.lastName }}
                      <div class="text-sm text-gray-500">{{ profile.personalInfo.email }}</div>
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Skills Column -->
              <ng-container matColumnDef="skills">
                <th mat-header-cell *matHeaderCellDef>Skills</th>
                <td mat-cell *matCellDef="let profile">
                  <mat-chip-listbox>
                    <mat-chip *ngFor="let skill of getTopSkills(profile)">
                      {{ skill.name }}
                      <span class="ml-1 text-xs">({{ skill.level }})</span>
                    </mat-chip>
                  </mat-chip-listbox>
                </td>
              </ng-container>

              <!-- Experience Column -->
              <ng-container matColumnDef="experience">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Experience</th>
                <td mat-cell *matCellDef="let profile">
                  <div *ngIf="profile.experience[0]">
                    {{ profile.experience[0].title }}
                    <div class="text-sm text-gray-500">{{ profile.experience[0].company }}</div>
                  </div>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let profile">
                  <button mat-icon-button 
                          (click)="openProfileDialog(profile)"
                          matTooltip="View Profile">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button 
                          [routerLink]="['../profiles', profile._id, 'edit']"
                          matTooltip="Edit Profile">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button 
                          color="warn"
                          (click)="deleteProfile(profile)"
                          matTooltip="Delete Profile">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>

            <mat-paginator [length]="totalProfiles"
                          [pageSize]="10"
                          [pageSizeOptions]="[5, 10, 25, 50]">
            </mat-paginator>

            <!-- Empty State -->
            <div *ngIf="(filteredProfiles$ | async)?.length === 0" 
                 class="text-center py-12">
              <mat-icon class="text-6xl text-gray-400">search</mat-icon>
              <h3 class="text-xl font-medium mt-4">No profiles found</h3>
              <p class="text-gray-600 mt-2">Try adjusting your search criteria</p>
            </div>
          </ng-container>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .mat-mdc-card {
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    }

    .mat-column-actions {
      width: 120px;
      text-align: right;
    }

    .mat-mdc-row:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }
  `]
})
export class PoolPageComponent implements OnInit {
  filterForm: FormGroup;
  selectedSkills: string[] = [];
  isLoading = false;
  error: string | null = null;
  displayedColumns = ['name', 'skills', 'experience', 'actions'];
  totalProfiles = 0;

  private searchSubject = new BehaviorSubject<string>('');
  private skillsSubject = new BehaviorSubject<string[]>([]);
  private experienceLevelSubject = new BehaviorSubject<string>('');

  filteredProfiles$: Observable<EmployeeProfile[]>;

  constructor(
    private fb: FormBuilder,
    private profileService: EmployeeProfileService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.filterForm = this.createFilterForm();
    this.setupFilterSubscriptions();
    this.filteredProfiles$ = this.setupProfileFiltering();
  }

  ngOnInit(): void {
    this.loadProfiles();
  }

  private createFilterForm(): FormGroup {
    return this.fb.group({
      search: [''],
      experienceLevel: ['']
    });
  }

  private setupFilterSubscriptions(): void {
    // Search filter
    this.filterForm.get('search')?.valueChanges
      .pipe(debounceTime(300))
      .subscribe(value => this.searchSubject.next(value || ''));

    // Experience level filter
    this.filterForm.get('experienceLevel')?.valueChanges
      .subscribe(value => this.experienceLevelSubject.next(value || ''));
  }

  private setupProfileFiltering(): Observable<EmployeeProfile[]> {
    return combineLatest([
      this.searchSubject.pipe(startWith('')),
      this.skillsSubject.pipe(startWith([])),
      this.experienceLevelSubject.pipe(startWith(''))
    ]).pipe(
      switchMap(([search, skills, experienceLevel]) => 
        this.profileService.getProfiles().pipe(
          map(profiles => this.filterProfiles(profiles, search, skills, experienceLevel))
        )
      )
    );
  }

  private filterProfiles(
    profiles: EmployeeProfile[],
    search: string,
    skills: string[],
    experienceLevel: string
  ): EmployeeProfile[] {
    return profiles.filter(profile => {
      const matchesSearch = !search || this.matchesSearch(profile, search.toLowerCase());
      const matchesSkills = !skills.length || this.matchesSkills(profile, skills);
      const matchesExperience = !experienceLevel || this.matchesExperienceLevel(profile, experienceLevel);
      return matchesSearch && matchesSkills && matchesExperience;
    });
  }

  private matchesSearch(profile: EmployeeProfile, search: string): boolean {
    const fullName = `${profile.personalInfo.firstName} ${profile.personalInfo.lastName}`.toLowerCase();
    const hasMatchingSkill = profile.skills.technical.some(skill => 
      skill.name.toLowerCase().includes(search)
    );
    const hasMatchingCompany = profile.experience.some(exp => 
      exp.company.toLowerCase().includes(search)
    );

    return fullName.includes(search) || hasMatchingSkill || hasMatchingCompany;
  }

  private matchesSkills(profile: EmployeeProfile, skills: string[]): boolean {
    return skills.every(skill =>
      profile.skills.technical.some(techSkill => 
        techSkill.name.toLowerCase() === skill.toLowerCase()
      )
    );
  }

  private matchesExperienceLevel(profile: EmployeeProfile, level: string): boolean {
    const totalYears = profile.skills.technical.reduce(
      (max, skill) => Math.max(max, skill.yearsOfExperience),
      0
    );

    switch (level) {
      case 'junior':
        return totalYears <= 2;
      case 'mid':
        return totalYears > 2 && totalYears <= 5;
      case 'senior':
        return totalYears > 5;
      default:
        return true;
    }
  }

  addSkill(event: any): void {
    const value = event.value.trim();
    if (value) {
      this.selectedSkills = [...this.selectedSkills, value];
      this.skillsSubject.next(this.selectedSkills);
      event.input.value = '';
    }
  }

  removeSkill(skill: string): void {
    this.selectedSkills = this.selectedSkills.filter(s => s !== skill);
    this.skillsSubject.next(this.selectedSkills);
  }

  getTopSkills(profile: EmployeeProfile): any[] {
    return profile.skills.technical
      .sort((a, b) => b.level - a.level)
      .slice(0, 3);
  }

  deleteProfile(profile: EmployeeProfile): void {
    if (confirm(`Are you sure you want to delete ${profile.personalInfo.firstName}'s profile?`)) {
      this.profileService.deleteProfile(profile._id!).subscribe({
        next: () => {
          this.snackBar.open('Profile deleted successfully', 'Close', {
            duration: 3000,
            panelClass: ['snackbar-success']
          });
          this.loadProfiles();
        },
        error: (error) => {
          console.error('Error deleting profile:', error);
          this.snackBar.open('Failed to delete profile', 'Close', {
            duration: 5000,
            panelClass: ['snackbar-error']
          });
        }
      });
    }
  }

  retry(): void {
    this.loadProfiles();
  }

  loadProfiles(): void {
    this.isLoading = true;
    this.error = null;

    this.profileService.getProfiles().subscribe({
      next: (profiles) => {
        this.totalProfiles = profiles.length;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading profiles:', error);
        this.error = 'Failed to load profiles. Please try again.';
        this.isLoading = false;
      }
    });
  }

  openProfileDialog(profile: EmployeeProfile): void {
    const dialogRef = this.dialog.open(ProfileViewerDialogComponent, {
      width: '90vw',
      maxWidth: '1200px',
      data: profile,
      panelClass: 'profile-viewer-dialog'
    });

    dialogRef.componentInstance.editProfile.subscribe((profileId: string) => {
      this.router.navigate(['../profiles', profileId, 'edit'], { relativeTo: this.route });
    });
  }

  getSkillLevelText(level: number): string {
    switch (level) {
      case 1: return 'Beginner';
      case 2: return 'Elementary';
      case 3: return 'Intermediate';
      case 4: return 'Advanced';
      case 5: return 'Expert';
      default: return 'Not Specified';
    }
  }

  getSkillColor(level: number): string {
    switch (level) {
      case 1: return 'primary';
      case 2: return 'accent';
      case 3: return 'warn';
      case 4: return 'primary';
      case 5: return 'accent';
      default: return 'primary';
    }
  }
} 