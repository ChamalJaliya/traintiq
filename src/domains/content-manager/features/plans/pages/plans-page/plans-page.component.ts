import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ContentManagerService, Plan, PlanStatus, DifficultyLevel } from '../../../../data/content-manager.service';

@Component({
  selector: 'app-plans-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDividerModule,
    ReactiveFormsModule
  ],
  templateUrl: './plans-page.component.html',
  styleUrls: ['./plans-page.component.scss']
})
export class PlansPageComponent implements OnInit {
  plans: Plan[] = [];
  loading = false;
  selectedPlan: Plan | null = null;
  showCreateForm = false;
  
  createPlanForm: FormGroup;
  
  // Enums for template access
  PlanStatus = PlanStatus;
  DifficultyLevel = DifficultyLevel;

  constructor(
    private contentManagerService: ContentManagerService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.createPlanForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      difficulty: [DifficultyLevel.BEGINNER, Validators.required],
      tags: ['']
    });
  }

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans(): void {
    this.loading = true;
    this.contentManagerService.getPlans().subscribe({
      next: (plans) => {
        this.plans = plans;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading plans:', error);
        this.snackBar.open('Error loading plans', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  onCreatePlan(): void {
    if (this.createPlanForm.valid) {
      this.loading = true;
      const planData = {
        ...this.createPlanForm.value,
        tags: this.createPlanForm.value.tags ? this.createPlanForm.value.tags.split(',').map((tag: string) => tag.trim()) : []
      };

      this.contentManagerService.createPlan(planData).subscribe({
        next: (newPlan) => {
          this.plans.unshift(newPlan);
          this.showCreateForm = false;
          this.createPlanForm.reset();
          this.loading = false;
          this.snackBar.open('Plan created successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error creating plan:', error);
          this.snackBar.open('Error creating plan', 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }

  onDeletePlan(plan: Plan): void {
    if (confirm(`Are you sure you want to delete "${plan.title}"?`)) {
      this.loading = true;
      this.contentManagerService.deletePlan(plan.id).subscribe({
        next: () => {
          this.plans = this.plans.filter(p => p.id !== plan.id);
          this.loading = false;
          this.snackBar.open('Plan deleted successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error deleting plan:', error);
          this.snackBar.open('Error deleting plan', 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }

  onEditPlan(plan: Plan): void {
    // Navigate to subject builder with plan ID
    // This will be implemented with proper routing
    console.log('Edit plan:', plan);
  }

  getStatusColor(status: PlanStatus): string {
    switch (status) {
      case PlanStatus.PUBLISHED:
        return 'primary';
      case PlanStatus.REVIEW:
        return 'accent';
      case PlanStatus.DRAFT:
        return 'warn';
      case PlanStatus.ARCHIVED:
        return '';
      default:
        return '';
    }
  }

  getDifficultyColor(difficulty: DifficultyLevel): string {
    switch (difficulty) {
      case DifficultyLevel.BEGINNER:
        return '#4CAF50';
      case DifficultyLevel.INTERMEDIATE:
        return '#FF9800';
      case DifficultyLevel.ADVANCED:
        return '#FF5722';
      case DifficultyLevel.EXPERT:
        return '#9C27B0';
      default:
        return '#757575';
    }
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) {
      return `${remainingMinutes}m`;
    } else if (remainingMinutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${remainingMinutes}m`;
    }
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.createPlanForm.reset();
    }
  }

  onCancel(): void {
    this.showCreateForm = false;
    this.createPlanForm.reset();
  }
} 