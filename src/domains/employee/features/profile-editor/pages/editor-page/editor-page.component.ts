import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSliderModule } from '@angular/material/slider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';

import { EmployeeProfileService } from '../../../../data/employee-profile.service';
import { EmployeeProfile } from '../../../../../../shared/models/employee-profile.model';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-editor-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatSliderModule,
    MatTabsModule,
    MatDividerModule
  ],
  template: `
    <div class="container mx-auto p-6">
      <div *ngIf="isLoading" class="flex justify-center items-center h-64">
        <mat-progress-bar mode="indeterminate" class="w-64"></mat-progress-bar>
      </div>

      <div *ngIf="error" class="text-center text-red-600 p-4">
        {{ error }}
        <button mat-button color="primary" (click)="retry()">Retry</button>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" *ngIf="!isLoading && !error">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-3xl font-bold text-gray-900">
            {{ isEditMode ? 'Edit Profile' : 'Create Profile' }}
          </h1>
          <div class="flex gap-3">
            <button mat-stroked-button type="button" (click)="cancel()">
              Cancel
            </button>
            <button mat-raised-button 
                    color="primary" 
                    type="submit"
                    [disabled]="form.invalid || isSaving">
              <mat-icon>save</mat-icon>
              Save Profile
            </button>
          </div>
        </div>

        <!-- Main Form -->
        <mat-card>
          <mat-card-content>
            <mat-tab-group>
              <!-- Personal Information Tab -->
              <mat-tab label="Personal Information">
                <div class="p-6" formGroupName="personalInfo">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <mat-form-field>
                      <mat-label>First Name</mat-label>
                      <input matInput formControlName="firstName" required>
                      <mat-error *ngIf="form.get('personalInfo.firstName')?.errors?.['required']">
                        First name is required
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field>
                      <mat-label>Last Name</mat-label>
                      <input matInput formControlName="lastName" required>
                      <mat-error *ngIf="form.get('personalInfo.lastName')?.errors?.['required']">
                        Last name is required
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field>
                      <mat-label>Email</mat-label>
                      <input matInput formControlName="email" required type="email">
                      <mat-error *ngIf="form.get('personalInfo.email')?.errors?.['required']">
                        Email is required
                      </mat-error>
                      <mat-error *ngIf="form.get('personalInfo.email')?.errors?.['email']">
                        Please enter a valid email address
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field>
                      <mat-label>Phone</mat-label>
                      <input matInput formControlName="phone">
                    </mat-form-field>

                    <mat-form-field>
                      <mat-label>Location</mat-label>
                      <input matInput formControlName="location">
                    </mat-form-field>

                    <mat-form-field>
                      <mat-label>LinkedIn Profile</mat-label>
                      <input matInput formControlName="linkedIn">
                      <mat-error *ngIf="form.get('personalInfo.linkedIn')?.errors?.['pattern']">
                        Please enter a valid LinkedIn URL
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field>
                      <mat-label>GitHub Profile</mat-label>
                      <input matInput formControlName="github">
                      <mat-error *ngIf="form.get('personalInfo.github')?.errors?.['pattern']">
                        Please enter a valid GitHub URL
                      </mat-error>
                    </mat-form-field>
                  </div>
                </div>
              </mat-tab>

              <!-- Skills Tab -->
              <mat-tab label="Skills">
                <div class="p-6" formGroupName="skills">
                  <!-- Technical Skills -->
                  <section class="mb-8">
                    <div class="flex justify-between items-center mb-4">
                      <h2 class="text-xl font-semibold">Technical Skills</h2>
                      <button mat-stroked-button 
                              type="button"
                              (click)="addTechnicalSkill()">
                        <mat-icon>add</mat-icon>
                        Add Skill
                      </button>
                    </div>

                    <div formArrayName="technical">
                      <div *ngFor="let skill of technicalSkills.controls; let i=index" 
                           [formGroupName]="i"
                           class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <mat-form-field>
                          <mat-label>Skill Name</mat-label>
                          <input matInput formControlName="name" required>
                        </mat-form-field>

                        <mat-form-field>
                          <mat-label>Level (1-5)</mat-label>
                          <input matInput type="number" formControlName="level" min="1" max="5" required>
                        </mat-form-field>

                        <mat-form-field>
                          <mat-label>Years of Experience</mat-label>
                          <input matInput type="number" formControlName="yearsOfExperience" required>
                        </mat-form-field>

                        <button mat-icon-button 
                                type="button"
                                color="warn"
                                (click)="removeTechnicalSkill(i)">
                          <mat-icon>delete</mat-icon>
                        </button>
                      </div>
                    </div>
                  </section>

                  <!-- Soft Skills -->
                  <section class="mb-8">
                    <div class="flex justify-between items-center mb-4">
                      <h2 class="text-xl font-semibold">Soft Skills</h2>
                      <button mat-stroked-button 
                              type="button"
                              (click)="addSoftSkill()">
                        <mat-icon>add</mat-icon>
                        Add Skill
                      </button>
                    </div>

                    <div formArrayName="soft">
                      <div *ngFor="let skill of softSkills.controls; let i=index" 
                           [formGroupName]="i"
                           class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <mat-form-field>
                          <mat-label>Skill Name</mat-label>
                          <input matInput formControlName="name" required>
                        </mat-form-field>

                        <button mat-icon-button 
                                type="button"
                                color="warn"
                                (click)="removeSoftSkill(i)">
                          <mat-icon>delete</mat-icon>
                        </button>
                      </div>
                    </div>
                  </section>

                  <!-- Languages -->
                  <section>
                    <div class="flex justify-between items-center mb-4">
                      <h2 class="text-xl font-semibold">Languages</h2>
                      <button mat-stroked-button 
                              type="button"
                              (click)="addLanguage()">
                        <mat-icon>add</mat-icon>
                        Add Language
                      </button>
                    </div>

                    <div formArrayName="languages">
                      <div *ngFor="let lang of languages.controls; let i=index" 
                           [formGroupName]="i"
                           class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <mat-form-field>
                          <mat-label>Language</mat-label>
                          <input matInput formControlName="name" required>
                        </mat-form-field>

                        <mat-form-field>
                          <mat-label>Proficiency Level</mat-label>
                          <mat-select formControlName="level" required>
                            <mat-option value="Basic">Basic</mat-option>
                            <mat-option value="Intermediate">Intermediate</mat-option>
                            <mat-option value="Advanced">Advanced</mat-option>
                            <mat-option value="Native">Native</mat-option>
                          </mat-select>
                        </mat-form-field>

                        <button mat-icon-button 
                                type="button"
                                color="warn"
                                (click)="removeLanguage(i)">
                          <mat-icon>delete</mat-icon>
                        </button>
                      </div>
                    </div>
                  </section>
                </div>
              </mat-tab>

              <!-- Experience Tab -->
              <mat-tab label="Experience">
                <div class="p-6">
                  <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-semibold">Work Experience</h2>
                    <button mat-stroked-button 
                            type="button"
                            (click)="addExperience()">
                      <mat-icon>add</mat-icon>
                      Add Experience
                    </button>
                  </div>

                  <div formArrayName="experience">
                    <mat-card *ngFor="let exp of experience.controls; let i=index" 
                             [formGroupName]="i"
                             class="mb-6">
                      <mat-card-content>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <mat-form-field>
                            <mat-label>Company</mat-label>
                            <input matInput formControlName="company" required>
                          </mat-form-field>

                          <mat-form-field>
                            <mat-label>Title</mat-label>
                            <input matInput formControlName="title" required>
                          </mat-form-field>

                          <mat-form-field>
                            <mat-label>Start Date</mat-label>
                            <input matInput [matDatepicker]="startPicker" formControlName="startDate" required>
                            <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
                            <mat-datepicker #startPicker></mat-datepicker>
                          </mat-form-field>

                          <mat-form-field *ngIf="!exp.get('current')?.value">
                            <mat-label>End Date</mat-label>
                            <input matInput [matDatepicker]="endPicker" formControlName="endDate">
                            <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
                            <mat-datepicker #endPicker></mat-datepicker>
                          </mat-form-field>

                          <div class="flex items-center">
                            <mat-checkbox formControlName="current">Current Position</mat-checkbox>
                          </div>
                        </div>

                        <mat-form-field class="w-full">
                          <mat-label>Description</mat-label>
                          <textarea matInput formControlName="description" rows="3" required></textarea>
                        </mat-form-field>

                        <div formArrayName="responsibilities">
                          <h3 class="font-medium mb-2">Responsibilities</h3>
                          <div *ngFor="let resp of getResponsibilities(i).controls; let j=index">
                            <mat-form-field class="w-full">
                              <input matInput [formControlName]="j" placeholder="Add responsibility">
                              <button mat-icon-button matSuffix (click)="removeResponsibility(i, j)">
                                <mat-icon>remove</mat-icon>
                              </button>
                            </mat-form-field>
                          </div>
                          <button mat-stroked-button 
                                  type="button"
                                  (click)="addResponsibility(i)">
                            Add Responsibility
                          </button>
                        </div>

                        <div formArrayName="technologies" class="mt-4">
                          <h3 class="font-medium mb-2">Technologies Used</h3>
                          <mat-form-field class="w-full">
                            <mat-chip-grid #chipGrid>
                              <mat-chip-row *ngFor="let tech of getTechnologies(i).value"
                                          (removed)="removeTechnology(i, tech)">
                                {{tech}}
                                <button matChipRemove>
                                  <mat-icon>cancel</mat-icon>
                                </button>
                              </mat-chip-row>
                              <input placeholder="New technology..."
                                     [matChipInputFor]="chipGrid"
                                     (matChipInputTokenEnd)="addTechnology(i, $event)">
                            </mat-chip-grid>
                          </mat-form-field>
                        </div>

                        <div class="flex justify-end mt-4">
                          <button mat-stroked-button 
                                  color="warn"
                                  type="button"
                                  (click)="removeExperience(i)">
                            <mat-icon>delete</mat-icon>
                            Remove Experience
                          </button>
                        </div>
                      </mat-card-content>
                    </mat-card>
                  </div>
                </div>
              </mat-tab>

              <!-- Education Tab -->
              <mat-tab label="Education">
                <!-- Similar structure to Experience tab -->
              </mat-tab>

              <!-- Projects Tab -->
              <mat-tab label="Projects">
                <!-- Similar structure to Experience tab -->
              </mat-tab>

              <!-- Certifications Tab -->
              <mat-tab label="Certifications">
                <!-- Similar structure to Experience tab -->
              </mat-tab>
            </mat-tab-group>
          </mat-card-content>
        </mat-card>
      </form>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .mat-mdc-form-field {
      width: 100%;
    }

    .mat-mdc-card {
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    }
  `]
})
export class EditorPageComponent implements OnInit {
  form: FormGroup;
  isLoading = false;
  isSaving = false;
  error: string | null = null;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private profileService: EmployeeProfileService,
    private snackBar: MatSnackBar
  ) {
    this.form = this.createForm();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.loadProfile(id);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      personalInfo: this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: [''],
        location: [''],
        linkedIn: ['', Validators.pattern(/^https:\/\/[www.]*linkedin.com\/.*$/)],
        github: ['', Validators.pattern(/^https:\/\/[www.]*github.com\/.*$/)]
      }),
      skills: this.fb.group({
        technical: this.fb.array([]),
        soft: this.fb.array([]),
        languages: this.fb.array([])
      }),
      experience: this.fb.array([]),
      education: this.fb.array([]),
      certifications: this.fb.array([]),
      projects: this.fb.array([])
    });
  }

  private loadProfile(id: string): void {
    this.isLoading = true;
    this.error = null;

    this.profileService.getProfileById(id).pipe(
      catchError(error => {
        console.error('Error loading profile:', error);
        this.error = 'Failed to load profile. Please try again.';
        return of(null as any);
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe(profile => {
      if (profile) {
        this.patchFormValue(profile);
      }
    });
  }

  private patchFormValue(profile: EmployeeProfile): void {
    // Clear existing arrays
    this.technicalSkills.clear();
    this.softSkills.clear();
    this.languages.clear();
    this.experience.clear();

    // Patch values
    this.form.patchValue({
      personalInfo: profile.personalInfo
    });

    // Add skills
    profile.skills.technical.forEach(skill => {
      this.technicalSkills.push(this.createTechnicalSkill(skill));
    });

    profile.skills.soft.forEach(skill => {
      this.softSkills.push(this.createSoftSkill(skill));
    });

    profile.skills.languages.forEach(lang => {
      this.languages.push(this.createLanguage(lang));
    });

    // Add experience
    profile.experience.forEach(exp => {
      this.experience.push(this.createExperience(exp));
    });

    // ... Similar for education, projects, certifications
  }

  // Getters for form arrays
  get technicalSkills() {
    return this.form.get('skills.technical') as FormArray;
  }

  get softSkills() {
    return this.form.get('skills.soft') as FormArray;
  }

  get languages() {
    return this.form.get('skills.languages') as FormArray;
  }

  get experience() {
    return this.form.get('experience') as FormArray;
  }

  // Form array creation methods
  createTechnicalSkill(skill: any = {}) {
    return this.fb.group({
      name: [skill.name || '', Validators.required],
      level: [skill.level || 1, [Validators.required, Validators.min(1), Validators.max(5)]],
      yearsOfExperience: [skill.yearsOfExperience || 0, Validators.required],
      lastUsed: [skill.lastUsed || new Date()],
      certifications: [skill.certifications || []],
      projects: [skill.projects || []]
    });
  }

  createSoftSkill(skill: any = {}) {
    return this.fb.group({
      name: [skill.name || '', Validators.required]
    });
  }

  createLanguage(lang: any = {}) {
    return this.fb.group({
      name: [lang.name || '', Validators.required],
      level: [lang.level || 'Basic', Validators.required],
      certifications: [lang.certifications || []]
    });
  }

  createExperience(exp: any = {}) {
    return this.fb.group({
      company: [exp.company || '', Validators.required],
      title: [exp.title || '', Validators.required],
      location: [exp.location || ''],
      startDate: [exp.startDate || null, Validators.required],
      endDate: [exp.endDate || null],
      current: [exp.current || false],
      description: [exp.description || '', Validators.required],
      highlights: [exp.highlights || []],
      technologies: [exp.technologies || []],
      responsibilities: this.fb.array(exp.responsibilities || [])
    });
  }

  // Add/Remove methods
  addTechnicalSkill(): void {
    this.technicalSkills.push(this.createTechnicalSkill());
  }

  removeTechnicalSkill(index: number): void {
    this.technicalSkills.removeAt(index);
  }

  addSoftSkill(): void {
    this.softSkills.push(this.createSoftSkill());
  }

  removeSoftSkill(index: number): void {
    this.softSkills.removeAt(index);
  }

  addLanguage(): void {
    this.languages.push(this.createLanguage());
  }

  removeLanguage(index: number): void {
    this.languages.removeAt(index);
  }

  addExperience(): void {
    this.experience.push(this.createExperience());
  }

  removeExperience(index: number): void {
    this.experience.removeAt(index);
  }

  // Helper methods for nested form arrays
  getResponsibilities(expIndex: number): FormArray {
    return this.experience.at(expIndex).get('responsibilities') as FormArray;
  }

  getTechnologies(expIndex: number): FormArray {
    return this.experience.at(expIndex).get('technologies') as FormArray;
  }

  addResponsibility(expIndex: number): void {
    this.getResponsibilities(expIndex).push(this.fb.control(''));
  }

  removeResponsibility(expIndex: number, respIndex: number): void {
    this.getResponsibilities(expIndex).removeAt(respIndex);
  }

  addTechnology(expIndex: number, event: any): void {
    const technologies = this.getTechnologies(expIndex);
    const value = event.value.trim();
    if (value) {
      technologies.push(this.fb.control(value));
      event.input.value = '';
    }
  }

  removeTechnology(expIndex: number, tech: string): void {
    const technologies = this.getTechnologies(expIndex);
    const index = technologies.value.indexOf(tech);
    if (index >= 0) {
      technologies.removeAt(index);
    }
  }

  retry(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProfile(id);
    }
  }

  cancel(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.markFormGroupTouched(this.form);
      return;
    }

    this.isSaving = true;
    const profile = this.form.value;
    const request = this.isEditMode ?
      this.profileService.updateProfile(this.route.snapshot.paramMap.get('id')!, profile) :
      this.profileService.createProfile(profile);

    request.pipe(
      catchError(error => {
        console.error('Error saving profile:', error);
        this.snackBar.open('Failed to save profile. Please try again.', 'Close', {
          duration: 5000,
          panelClass: ['snackbar-error']
        });
        return of(null as any);
      }),
      finalize(() => {
        this.isSaving = false;
      })
    ).subscribe(result => {
      if (result) {
        this.snackBar.open('Profile saved successfully', 'Close', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });
        this.router.navigate(['../'], { relativeTo: this.route });
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup | FormArray): void {
    Object.values(formGroup.controls).forEach(control => {
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      } else {
        control.markAsTouched();
      }
    });
  }
} 