import { Component, OnInit } from '@angular/core';
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
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';

import { 
  ContentManagerService, 
  Subject, 
  Topic, 
  Section, 
  Step,
  TopicStatus,
  SectionStatus,
  StepStatus,
  ContentType,
  MediaType
} from '../../../../data/content-manager.service';

@Component({
  selector: 'app-editor-page',
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
    MatExpansionModule,
    MatListModule,
    MatDividerModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatProgressBarModule,
    DragDropModule
  ],
  templateUrl: './editor-page.component.html',
  styleUrls: ['./editor-page.component.scss']
})
export class EditorPageComponent implements OnInit {
  subjectId: string = '';
  subject: Subject | null = null;
  selectedTopic: Topic | null = null;
  loading = false;
  
  // Forms
  topicForm: FormGroup;
  sectionForm: FormGroup;
  stepForm: FormGroup;
  
  // Edit states
  editingTopics: Set<string> = new Set();
  editingSections: Set<string> = new Set();
  editingSteps: Set<string> = new Set();
  
  // Enums for template
  TopicStatus = TopicStatus;
  SectionStatus = SectionStatus;
  StepStatus = StepStatus;
  ContentType = ContentType;
  MediaType = MediaType;
  
  constructor(
    private contentManagerService: ContentManagerService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.topicForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required]],
      contentType: [ContentType.MIXED, Validators.required],
      estimatedDuration: [30, [Validators.required, Validators.min(5)]]
    });

    this.sectionForm = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      estimatedDuration: [15, [Validators.required, Validators.min(5)]]
    });

    this.stepForm = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      content: ['', [Validators.required]],
      estimatedDuration: [5, [Validators.required, Validators.min(1)]],
      interactive: [false],
      mediaType: [MediaType.VIDEO]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.subjectId = params['subjectId'];
      this.loadSubject();
    });
  }

  loadSubject(): void {
    this.loading = true;
    // First get all plans to find the subject
    this.contentManagerService.getPlans().subscribe({
      next: (plans) => {
        let foundSubject: Subject | null = null;
        
        // Search through all plans and their subjects
        for (const plan of plans) {
          const subject = plan.subjects.find(s => s.id === this.subjectId);
          if (subject) {
            foundSubject = subject;
            break;
          }
        }
        
        this.subject = foundSubject;
        if (this.subject && this.subject.topics.length > 0) {
          this.selectedTopic = this.subject.topics[0];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading subject:', error);
        this.snackBar.open('Error loading subject', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  // Topic Management
  onSelectTopic(topic: Topic): void {
    this.selectedTopic = topic;
  }

  onAddTopic(): void {
    if (!this.subject) return;
    
    const newTopic: Partial<Topic> = {
      title: 'New Topic',
      description: 'Topic description',
      sections: [],
      order: this.subject.topics.length + 1,
      status: TopicStatus.DRAFT,
      estimatedDuration: 30,
      contentType: ContentType.MIXED
    };

    this.contentManagerService.createTopic(this.subject.id, newTopic).subscribe({
      next: (topic) => {
        // Reload the subject to get the updated topics list
        this.loadSubject();
        this.selectedTopic = topic;
        this.snackBar.open('Topic added successfully!', 'Close', { duration: 2000 });
      },
      error: (error) => {
        console.error('Error adding topic:', error);
        this.snackBar.open('Error adding topic', 'Close', { duration: 3000 });
      }
    });
  }

  onEditTopic(topic: Topic): void {
    this.editingTopics.add(topic.id);
    this.topicForm.patchValue({
      title: topic.title,
      description: topic.description,
      contentType: topic.contentType,
      estimatedDuration: topic.estimatedDuration
    });
  }

  onSaveTopic(topic: Topic): void {
    if (this.topicForm.valid) {
      Object.assign(topic, this.topicForm.value);
      this.editingTopics.delete(topic.id);
      this.snackBar.open('Topic updated successfully!', 'Close', { duration: 2000 });
    }
  }

  onCancelEditTopic(topicId: string): void {
    this.editingTopics.delete(topicId);
  }

  onDeleteTopic(topic: Topic): void {
    if (!this.subject) return;
    
    if (confirm('Are you sure you want to delete this topic?')) {
      this.contentManagerService.deleteTopic(topic.id).subscribe({
        next: (success) => {
          if (success) {
            // Remove topic from local array
            const index = this.subject!.topics.findIndex(t => t.id === topic.id);
            if (index > -1) {
              this.subject!.topics.splice(index, 1);
              if (this.selectedTopic?.id === topic.id) {
                this.selectedTopic = this.subject!.topics[0] || null;
              }
            }
            this.snackBar.open('Topic deleted successfully!', 'Close', { duration: 2000 });
          }
        },
        error: (error) => {
          console.error('Error deleting topic:', error);
          this.snackBar.open('Error deleting topic', 'Close', { duration: 3000 });
        }
      });
    }
  }

  // Section Management
  onAddSection(): void {
    if (!this.selectedTopic) return;
    
    const newSection: Partial<Section> = {
      title: 'New Section',
      description: 'Section description',
      estimatedDuration: 15
    };

    this.contentManagerService.createSection(this.selectedTopic.id, newSection).subscribe({
      next: (section) => {
        // The service already adds the section to the topic, so reload the subject
        this.loadSubject();
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
    this.sectionForm.patchValue({
      title: section.title,
      description: section.description,
      estimatedDuration: section.estimatedDuration
    });
  }

  onSaveSection(section: Section): void {
    if (this.sectionForm.valid) {
      const updatedSection = {
        ...section,
        ...this.sectionForm.value
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

  onDeleteSection(section: Section): void {
    if (!this.selectedTopic) return;
    
    if (confirm('Are you sure you want to delete this section?')) {
      this.contentManagerService.deleteSection(section.id).subscribe({
        next: (success) => {
          if (success) {
            // Remove section from local array
            const index = this.selectedTopic!.sections.findIndex(s => s.id === section.id);
            if (index > -1) {
              this.selectedTopic!.sections.splice(index, 1);
            }
            this.snackBar.open('Section deleted successfully!', 'Close', { duration: 2000 });
          }
        },
        error: (error) => {
          console.error('Error deleting section:', error);
          this.snackBar.open('Error deleting section', 'Close', { duration: 3000 });
        }
      });
    }
  }

  // Step Management
  onAddStep(section: Section): void {
    const newStep: Step = {
      id: 'step_' + Date.now(),
      sectionId: section.id,
      title: 'New Step',
      description: 'Step description',
      content: 'Step content',
      order: section.steps.length + 1,
      status: StepStatus.DRAFT,
      estimatedDuration: 5,
      interactive: false,
      attachments: []
    };

    section.steps.push(newStep);
    this.snackBar.open('Step added successfully!', 'Close', { duration: 2000 });
  }

  onEditStep(step: Step): void {
    this.editingSteps.add(step.id);
    this.stepForm.patchValue({
      title: step.title,
      description: step.description,
      content: step.content,
      estimatedDuration: step.estimatedDuration,
      interactive: step.interactive,
      mediaType: step.mediaType || MediaType.VIDEO
    });
  }

  onSaveStep(step: Step): void {
    if (this.stepForm.valid) {
      Object.assign(step, this.stepForm.value);
      this.editingSteps.delete(step.id);
      this.snackBar.open('Step updated successfully!', 'Close', { duration: 2000 });
    }
  }

  onCancelEditStep(stepId: string): void {
    this.editingSteps.delete(stepId);
  }

  onDeleteStep(section: Section, step: Step): void {
    if (confirm('Are you sure you want to delete this step?')) {
      const index = section.steps.findIndex(s => s.id === step.id);
      if (index > -1) {
        section.steps.splice(index, 1);
        this.snackBar.open('Step deleted successfully!', 'Close', { duration: 2000 });
      }
    }
  }

  // Drag & Drop
  onDropSections(event: CdkDragDrop<Section[]>): void {
    if (!this.selectedTopic) return;
    
    moveItemInArray(this.selectedTopic.sections, event.previousIndex, event.currentIndex);
    
    // Call the service to persist the new order
    this.contentManagerService.reorderSections(this.selectedTopic.id, this.selectedTopic.sections).subscribe({
      next: (updatedSections) => {
        this.selectedTopic!.sections = updatedSections;
        this.snackBar.open('Section order updated', 'Close', { duration: 2000 });
      },
      error: (error) => {
        console.error('Error reordering sections:', error);
        this.snackBar.open('Error updating section order', 'Close', { duration: 3000 });
        // Revert the change on error
        this.loadSubject();
      }
    });
  }

  onDropSteps(event: CdkDragDrop<Step[]>, section: Section): void {
    moveItemInArray(section.steps, event.previousIndex, event.currentIndex);
    
    // Call the service to persist the new order
    this.contentManagerService.reorderSteps(section.id, section.steps).subscribe({
      next: (updatedSteps) => {
        section.steps = updatedSteps;
        this.snackBar.open('Step order updated', 'Close', { duration: 2000 });
      },
      error: (error) => {
        console.error('Error reordering steps:', error);
        this.snackBar.open('Error updating step order', 'Close', { duration: 3000 });
        // Revert the change on error
        this.loadSubject();
      }
    });
  }

  // Utility methods
  isEditingTopic(topicId: string): boolean {
    return this.editingTopics.has(topicId);
  }

  isEditingSection(sectionId: string): boolean {
    return this.editingSections.has(sectionId);
  }

  isEditingStep(stepId: string): boolean {
    return this.editingSteps.has(stepId);
  }

  getStatusColor(status: TopicStatus | SectionStatus | StepStatus): string {
    switch (status) {
      case 'completed':
        return '#4caf50';
      case 'in_progress':
        return '#ff9800';
      case 'review':
        return '#2196f3';
      case 'draft':
      default:
        return '#9e9e9e';
    }
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }

  getTotalSectionDuration(): number {
    if (!this.selectedTopic) return 0;
    return this.selectedTopic.sections.reduce((total, section) => total + section.estimatedDuration, 0);
  }

  getCompletionPercentage(): number {
    if (!this.selectedTopic) return 0;
    const totalSections = this.selectedTopic.sections.length;
    if (totalSections === 0) return 0;
    
    const completedSections = this.selectedTopic.sections.filter(s => s.status === SectionStatus.COMPLETED).length;
    return Math.round((completedSections / totalSections) * 100);
  }

  goBack(): void {
    this.router.navigate(['/content-manager/plans']);
  }
} 