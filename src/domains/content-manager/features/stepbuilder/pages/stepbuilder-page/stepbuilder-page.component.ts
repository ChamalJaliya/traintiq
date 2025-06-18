import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatBadgeModule } from '@angular/material/badge';
import { Subscription } from 'rxjs';

import { 
  StepbuilderService,
  StepBuilderTopic,
  StepBuilderStep,
  StepBuilderStatus,
  StepMediaType,
  VideoContent
} from '../../../../data/stepbuilder.service';
import { RichEditorComponent } from '../../components/rich-editor/rich-editor.component';

@Component({
  selector: 'app-stepbuilder-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatListModule,
    MatDividerModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatProgressBarModule,
    MatDialogModule,
    MatMenuModule,
    MatToolbarModule,
    MatBadgeModule,
    RichEditorComponent
  ],
  templateUrl: './stepbuilder-page.component.html',
  styleUrls: ['./stepbuilder-page.component.scss']
})
export class StepbuilderPageComponent implements OnInit, OnDestroy {
  topicId: string = '';
  topic: StepBuilderTopic | null = null;
  currentStep: StepBuilderStep | null = null;
  loading = false;
  
  // Forms
  stepForm: FormGroup;
  videoForm: FormGroup;
  
  // State management
  private subscriptions: Subscription[] = [];
  
  // Video dialog state
  showVideoDialog = false;
  

  
  // Enums for template
  StepBuilderStatus = StepBuilderStatus;
  StepMediaType = StepMediaType;
  
  constructor(
    private stepbuilderService: StepbuilderService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.stepForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required]],
      content: ['', [Validators.required]],
      estimatedDuration: [5, [Validators.required, Validators.min(1)]],
      interactive: [false]
    });

    this.videoForm = this.fb.group({
      videoUrl: ['', [Validators.required, Validators.pattern('https?://.+')]],
      title: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.topicId = params['topicId'];
      this.loadTopic();
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadTopic(): void {
    this.loading = true;
    const sub = this.stepbuilderService.getTopic(this.topicId).subscribe({
      next: (topic) => {
        this.topic = topic;
        this.loadCurrentStep();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading topic:', error);
        this.snackBar.open('Error loading topic', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
    this.subscriptions.push(sub);
  }

  loadCurrentStep(): void {
    if (!this.topic) return;
    
    const sub = this.stepbuilderService.getCurrentStep(this.topicId).subscribe({
      next: (step) => {
        this.currentStep = step;
        this.populateStepForm();
      },
      error: (error) => {
        console.error('Error loading current step:', error);
        this.snackBar.open('Error loading step', 'Close', { duration: 3000 });
      }
    });
    this.subscriptions.push(sub);
  }

  populateStepForm(): void {
    if (this.currentStep) {
      this.stepForm.patchValue({
        title: this.currentStep.title,
        description: this.currentStep.description,
        content: this.currentStep.content,
        estimatedDuration: this.currentStep.estimatedDuration,
        interactive: this.currentStep.interactive
      });
    }
  }

  // Navigation methods
  navigateToStep(stepIndex: number): void {
    if (!this.topic) return;
    
    const sub = this.stepbuilderService.navigateToStep(this.topicId, stepIndex).subscribe({
      next: (step) => {
        this.currentStep = step;
        this.topic!.currentStepIndex = stepIndex;
        this.populateStepForm();
        this.snackBar.open(`Navigated to step: ${step.title}`, 'Close', { duration: 2000 });
      },
      error: (error) => {
        console.error('Error navigating to step:', error);
        this.snackBar.open('Error navigating to step', 'Close', { duration: 3000 });
      }
    });
    this.subscriptions.push(sub);
  }

  goToPreviousStep(): void {
    if (!this.topic || this.topic.currentStepIndex <= 0) return;
    this.navigateToStep(this.topic.currentStepIndex - 1);
  }

  goToNextStep(): void {
    if (!this.topic || this.topic.currentStepIndex >= this.topic.steps.length - 1) return;
    this.navigateToStep(this.topic.currentStepIndex + 1);
  }

  // Content management methods
  onSaveStep(): void {
    if (!this.currentStep || !this.stepForm.valid) return;
    
    const updatedData = this.stepForm.value;
    const sub = this.stepbuilderService.updateStep(this.currentStep.id, updatedData).subscribe({
      next: (step) => {
        this.currentStep = step;
        this.snackBar.open('Step saved successfully!', 'Close', { duration: 2000 });
      },
      error: (error) => {
        console.error('Error saving step:', error);
        this.snackBar.open('Error saving step', 'Close', { duration: 3000 });
      }
    });
    this.subscriptions.push(sub);
  }

  onAddStep(): void {
    if (!this.topic) return;
    
    const newStep: StepBuilderStep = {
      id: 'step-' + Date.now(),
      title: 'New Step',
      description: 'Enter step description',
      content: '',
      estimatedDuration: 15,
      interactive: false,
      completed: false,
      status: StepBuilderStatus.IN_PROGRESS,
      mediaType: StepMediaType.VIDEO,
      videoUrl: '',
      attachments: [],
      order: this.topic.steps.length + 1
    };
    
    // Add step directly to the topic for now
    this.topic.steps.push(newStep);
    this.navigateToStep(this.topic.steps.length - 1);
    this.snackBar.open('New step added successfully!', 'Close', { duration: 2000 });
  }

  onMarkCompleted(): void {
    if (!this.currentStep) return;
    
    const sub = this.stepbuilderService.markStepCompleted(this.currentStep.id).subscribe({
      next: (success) => {
        if (success) {
          this.currentStep!.completed = true;
          this.currentStep!.status = StepBuilderStatus.COMPLETED;
          this.snackBar.open('Step marked as completed!', 'Close', { duration: 2000 });
        }
      },
      error: (error) => {
        console.error('Error marking step as completed:', error);
        this.snackBar.open('Error updating step status', 'Close', { duration: 3000 });
      }
    });
    this.subscriptions.push(sub);
  }

  // Video management methods
  openVideoDialog(): void {
    this.showVideoDialog = true;
  }

  closeVideoDialog(): void {
    this.showVideoDialog = false;
    this.videoForm.reset();
  }

  onAddVideo(): void {
    if (!this.currentStep || !this.videoForm.valid) return;
    
    const videoData: VideoContent = {
      id: 'video-' + Date.now(),
      title: this.videoForm.value.title,
      url: this.videoForm.value.videoUrl,
      duration: 0
    };
    
    const sub = this.stepbuilderService.addVideoToStep(this.currentStep.id, videoData).subscribe({
      next: (success) => {
        if (success) {
          this.currentStep!.videoUrl = videoData.url;
          this.currentStep!.mediaType = StepMediaType.VIDEO;
          this.closeVideoDialog();
          this.snackBar.open('Video added successfully!', 'Close', { duration: 2000 });
        }
      },
      error: (error) => {
        console.error('Error adding video:', error);
        this.snackBar.open('Error adding video', 'Close', { duration: 3000 });
      }
    });
    this.subscriptions.push(sub);
  }



  // Utility methods
  getStepStatusIcon(status: StepBuilderStatus): string {
    switch(status) {
      case StepBuilderStatus.COMPLETED: return 'check_circle';
      case StepBuilderStatus.IN_PROGRESS: return 'schedule';
      case StepBuilderStatus.REVIEW: return 'rate_review';
      default: return 'radio_button_unchecked';
    }
  }

  getStepStatusColor(status: StepBuilderStatus): string {
    switch(status) {
      case StepBuilderStatus.COMPLETED: return '#4caf50';
      case StepBuilderStatus.IN_PROGRESS: return '#ff9800';
      case StepBuilderStatus.REVIEW: return '#2196f3';
      default: return '#9e9e9e';
    }
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }

  getCurrentStepNumber(): number {
    return this.topic ? this.topic.currentStepIndex + 1 : 1;
  }

  getTotalSteps(): number {
    return this.topic ? this.topic.steps.length : 0;
  }

  canGoToPrevious(): boolean {
    return this.topic ? this.topic.currentStepIndex > 0 : false;
  }

  canGoToNext(): boolean {
    return this.topic ? this.topic.currentStepIndex < this.topic.steps.length - 1 : false;
  }

  goBack(): void {
    this.router.navigate(['/content-manager']);
  }

  // Rich Editor Methods
  onRichEditorContentChange(content: string): void {
    this.stepForm.patchValue({ content });
  }

  getCurrentStepContent(): string {
    return this.stepForm.get('content')?.value || '';
  }
} 