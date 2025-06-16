import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';

import { 
  ContentManagerService, 
  Plan, 
  Subject, 
  Topic, 
  Section, 
  Step,
  DifficultyLevel,
  TopicStatus,
  SectionStatus,
  StepStatus,
  ContentType,
  SubjectStatus,
  AIGenerationRequest,
  AIGeneratedContent
} from '../../../../data/content-manager.service';

@Component({
  selector: 'app-builder-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatDialogModule,
    MatSnackBarModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatExpansionModule,
    MatListModule,
    MatDividerModule,
    MatTooltipModule,
    ReactiveFormsModule,
    DragDropModule
  ],
  templateUrl: './builder-page.component.html',
  styleUrls: ['./builder-page.component.scss']
})
export class BuilderPageComponent implements OnInit {
  planId: string = '';
  plan: Plan | null = null;
  subjects: Subject[] = [];
  loading = false;
  generatingContent = false;
  showAIForm = false;
  
  aiGenerationForm: FormGroup;
  generatedContent: AIGeneratedContent | null = null;
  
  // Enums for template access
  DifficultyLevel = DifficultyLevel;
  ContentType = ContentType;
  SubjectStatus = SubjectStatus;
  TopicStatus = TopicStatus;
  SectionStatus = SectionStatus;
  StepStatus = StepStatus;

  // Edit states
  editingSubjects: Set<string> = new Set();
  editingSections: Set<string> = new Set();
  editingSteps: Set<string> = new Set();
  
  // Forms for editing
  subjectEditForm: FormGroup;
  sectionEditForm: FormGroup;
  stepEditForm: FormGroup;

  constructor(
    private contentManagerService: ContentManagerService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.aiGenerationForm = this.fb.group({
      topic: ['', [Validators.required, Validators.minLength(3)]],
      subjectArea: ['', [Validators.required]],
      targetAudience: ['', [Validators.required]],
      difficulty: [DifficultyLevel.INTERMEDIATE, Validators.required],
      estimatedDuration: [60, [Validators.required, Validators.min(15)]],
      contentType: [ContentType.MIXED, Validators.required],
      learningObjectives: ['']
    });

    this.subjectEditForm = this.fb.group({
      title: ['', [Validators.required]],
      description: ['']
    });

    this.sectionEditForm = this.fb.group({
      title: ['', [Validators.required]],
      description: ['']
    });

    this.stepEditForm = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      content: [''],
      estimatedDuration: [5, [Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.planId = params['planId'];
      this.loadPlan();
      this.loadSubjects();
    });
  }

  loadPlan(): void {
    this.loading = true;
    this.contentManagerService.getPlan(this.planId).subscribe({
      next: (plan) => {
        this.plan = plan;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading plan:', error);
        this.snackBar.open('Error loading plan', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  loadSubjects(): void {
    this.contentManagerService.getSubjects(this.planId).subscribe({
      next: (subjects) => {
        this.subjects = subjects;
      },
      error: (error) => {
        console.error('Error loading subjects:', error);
        this.snackBar.open('Error loading subjects', 'Close', { duration: 3000 });
      }
    });
  }

  onGenerateContent(): void {
    if (this.aiGenerationForm.valid) {
      this.generatingContent = true;
      
      const request: AIGenerationRequest = {
        ...this.aiGenerationForm.value,
        learningObjectives: this.aiGenerationForm.value.learningObjectives
          ? this.aiGenerationForm.value.learningObjectives.split(',').map((obj: string) => obj.trim())
          : []
      };

      this.contentManagerService.generateTopicContent(request).subscribe({
        next: (content) => {
          this.generatedContent = content;
          this.generatingContent = false;
          this.snackBar.open('Content generated successfully!', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error generating content:', error);
          this.snackBar.open('Error generating content', 'Close', { duration: 3000 });
          this.generatingContent = false;
        }
      });
    }
  }

  onAcceptGeneratedContent(): void {
    if (this.generatedContent && this.plan) {
      // Create a new subject with the generated content
      const newSubject: Partial<Subject> = {
        title: this.aiGenerationForm.value.topic,
        description: `Generated content for ${this.aiGenerationForm.value.topic}`,
        topics: [],
        order: this.subjects.length + 1,
        estimatedDuration: this.generatedContent.estimatedDuration,
        learningObjectives: this.aiGenerationForm.value.learningObjectives 
          ? this.aiGenerationForm.value.learningObjectives.split(',').map((obj: string) => obj.trim())
          : []
      };

      this.contentManagerService.createSubject(this.planId, newSubject).subscribe({
        next: (subject) => {
          this.subjects.push(subject);
          this.generatedContent = null;
          this.showAIForm = false;
          this.aiGenerationForm.reset();
          this.snackBar.open('Subject created successfully!', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error creating subject:', error);
          this.snackBar.open('Error creating subject', 'Close', { duration: 3000 });
        }
      });
    }
  }

  onDrop(event: CdkDragDrop<Subject[]>): void {
    moveItemInArray(this.subjects, event.previousIndex, event.currentIndex);
    
    // Update the order of subjects
    this.subjects.forEach((subject, index) => {
      subject.order = index + 1;
    });
    
    this.snackBar.open('Subject order updated', 'Close', { duration: 2000 });
  }

  onDropTopic(event: CdkDragDrop<Topic[]>, subject: Subject): void {
    moveItemInArray(subject.topics, event.previousIndex, event.currentIndex);
    
    // Call the service to persist the new order
    this.contentManagerService.reorderTopics(subject.id, subject.topics).subscribe({
      next: (updatedTopics) => {
        subject.topics = updatedTopics;
        this.snackBar.open('Topics reordered successfully!', 'Close', { duration: 2000 });
      },
      error: (error) => {
        console.error('Error reordering topics:', error);
        this.snackBar.open('Error reordering topics', 'Close', { duration: 3000 });
        // Revert the change on error
        this.loadSubjects();
      }
    });
  }

  onEditSubject(subject: Subject): void {
    this.router.navigate(['/content-manager/topic-editor', subject.id]);
  }

  onDeleteSubject(subject: Subject): void {
    if (confirm(`Are you sure you want to delete "${subject.title}"?`)) {
      this.subjects = this.subjects.filter(s => s.id !== subject.id);
      this.snackBar.open('Subject deleted successfully', 'Close', { duration: 3000 });
    }
  }

  toggleAIForm(): void {
    this.showAIForm = !this.showAIForm;
    if (!this.showAIForm) {
      this.aiGenerationForm.reset();
      this.generatedContent = null;
    }
  }

  onCancelAI(): void {
    this.showAIForm = false;
    this.aiGenerationForm.reset();
    this.generatedContent = null;
  }

  getStatusColor(status: SubjectStatus): string {
    switch (status) {
      case SubjectStatus.COMPLETED:
        return 'primary';
      case SubjectStatus.IN_PROGRESS:
        return 'accent';
      case SubjectStatus.DRAFT:
        return 'warn';
      case SubjectStatus.REVIEW:
        return '';
      default:
        return '';
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

  goBack(): void {
    this.router.navigate(['/content-manager/plans']);
  }

  // Section Management
  onAddSection(topic: Topic): void {
    const newSection: Partial<Section> = {
      title: 'New Section',
      description: 'Section description',
      estimatedDuration: 15
    };

    this.contentManagerService.createSection(topic.id, newSection).subscribe({
      next: (section) => {
        // The service already adds the section to the topic, so no need to push again
        this.snackBar.open('Section added successfully!', 'Close', { duration: 2000 });
      },
      error: (error) => {
        console.error('Error creating section:', error);
        this.snackBar.open('Error creating section', 'Close', { duration: 3000 });
      }
    });
  }

  onEditSection(section: Section): void {
    this.editingSections.add(section.id);
    this.sectionEditForm.patchValue({
      title: section.title,
      description: section.description
    });
  }

  onSaveSection(section: Section): void {
    if (this.sectionEditForm.valid) {
      const updatedSection = {
        ...section,
        ...this.sectionEditForm.value
      };

      this.contentManagerService.updateSection(section.id, updatedSection).subscribe({
        next: () => {
          Object.assign(section, updatedSection);
          this.editingSections.delete(section.id);
          this.snackBar.open('Section updated successfully!', 'Close', { duration: 2000 });
        },
        error: (error) => {
          console.error('Error updating section:', error);
          this.snackBar.open('Error updating section', 'Close', { duration: 3000 });
        }
      });
    }
  }

  onCancelEditSection(sectionId: string): void {
    this.editingSections.delete(sectionId);
  }

  onDeleteSection(topic: Topic, section: Section): void {
    if (confirm('Are you sure you want to delete this section?')) {
      this.contentManagerService.deleteSection(section.id).subscribe({
        next: () => {
          const index = topic.sections.findIndex(s => s.id === section.id);
          if (index > -1) {
            topic.sections.splice(index, 1);
          }
          this.snackBar.open('Section deleted successfully!', 'Close', { duration: 2000 });
        },
        error: (error) => {
          console.error('Error deleting section:', error);
          this.snackBar.open('Error deleting section', 'Close', { duration: 3000 });
        }
      });
    }
  }

  onDropSection(event: CdkDragDrop<Section[]>, topic: Topic): void {
    moveItemInArray(topic.sections, event.previousIndex, event.currentIndex);
    
    // Update the order of sections and persist to service
    topic.sections.forEach((section, index) => {
      section.order = index + 1;
    });
    
    // Persist the reordering to the service
    this.contentManagerService.reorderSections(topic.id, topic.sections).subscribe({
      next: () => {
        this.snackBar.open('Section order updated', 'Close', { duration: 2000 });
      },
      error: (error) => {
        console.error('Error updating section order:', error);
        this.snackBar.open('Error updating section order', 'Close', { duration: 3000 });
      }
    });
  }

  // Step Management
  onAddStep(section: Section): void {
    const newStep: Partial<Step> = {
      title: 'New Step',
      description: 'Step description',
      content: 'Step content',
      estimatedDuration: 5,
      interactive: false
    };

    this.contentManagerService.createStep(section.id, newStep).subscribe({
      next: (step) => {
        // The service already adds the step to the section, so no need to push again
        this.snackBar.open('Step added successfully!', 'Close', { duration: 2000 });
      },
      error: (error) => {
        console.error('Error creating step:', error);
        this.snackBar.open('Error creating step', 'Close', { duration: 3000 });
      }
    });
  }

  onEditStep(step: Step): void {
    this.editingSteps.add(step.id);
    this.stepEditForm.patchValue({
      title: step.title,
      description: step.description,
      content: step.content,
      estimatedDuration: step.estimatedDuration
    });
  }

  onSaveStep(step: Step): void {
    if (this.stepEditForm.valid) {
      const updatedStep = {
        ...step,
        ...this.stepEditForm.value
      };

      this.contentManagerService.updateStep(step.id, updatedStep).subscribe({
        next: () => {
          Object.assign(step, updatedStep);
          this.editingSteps.delete(step.id);
          this.snackBar.open('Step updated successfully!', 'Close', { duration: 2000 });
        },
        error: (error) => {
          console.error('Error updating step:', error);
          this.snackBar.open('Error updating step', 'Close', { duration: 3000 });
        }
      });
    }
  }

  onCancelEditStep(stepId: string): void {
    this.editingSteps.delete(stepId);
  }

  onDeleteStep(section: Section, step: Step): void {
    if (confirm('Are you sure you want to delete this step?')) {
      this.contentManagerService.deleteStep(step.id).subscribe({
        next: () => {
          const index = section.steps.findIndex(s => s.id === step.id);
          if (index > -1) {
            section.steps.splice(index, 1);
          }
          this.snackBar.open('Step deleted successfully!', 'Close', { duration: 2000 });
        },
        error: (error) => {
          console.error('Error deleting step:', error);
          this.snackBar.open('Error deleting step', 'Close', { duration: 3000 });
        }
      });
    }
  }

  onDropStep(event: CdkDragDrop<Step[]>, section: Section): void {
    moveItemInArray(section.steps, event.previousIndex, event.currentIndex);
    
    // Update the order of steps and persist to service
    section.steps.forEach((step, index) => {
      step.order = index + 1;
    });
    
    // Persist the reordering to the service
    this.contentManagerService.reorderSteps(section.id, section.steps).subscribe({
      next: () => {
        this.snackBar.open('Step order updated', 'Close', { duration: 2000 });
      },
      error: (error) => {
        console.error('Error updating step order:', error);
        this.snackBar.open('Error updating step order', 'Close', { duration: 3000 });
      }
    });
  }

  // Utility methods
  isEditingSection(sectionId: string): boolean {
    return this.editingSections.has(sectionId);
  }

  isEditingStep(stepId: string): boolean {
    return this.editingSteps.has(stepId);
  }

  getStepStatusColor(status: StepStatus): string {
    switch (status) {
      case StepStatus.COMPLETED:
        return '#4caf50';
      case StepStatus.IN_PROGRESS:
        return '#ff9800';
      case StepStatus.DRAFT:
      default:
        return '#9e9e9e';
    }
  }

  getSectionStatusColor(status: SectionStatus): string {
    switch (status) {
      case SectionStatus.COMPLETED:
        return '#4caf50';
      case SectionStatus.IN_PROGRESS:
        return '#ff9800';
      case SectionStatus.DRAFT:
      default:
        return '#9e9e9e';
    }
  }
} 