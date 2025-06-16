import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';

import { 
  ContentManagerService, 
  Topic, 
  Section, 
  Step,
  StepStatus,
  SectionStatus,
  TopicStatus,
  MediaType
} from '../../../../data/content-manager.service';

interface ViewerProgress {
  currentSection: number;
  currentStep: number;
  completedSteps: Set<string>;
  totalSteps: number;
  progressPercentage: number;
}

@Component({
  selector: 'app-viewer-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    MatProgressBarModule,
    MatChipsModule,
    MatTabsModule,
    MatExpansionModule,
    MatSnackBarModule,
    MatSliderModule,
    MatTooltipModule,
    MatBadgeModule,
    MatMenuModule
  ],
  templateUrl: './viewer-page.component.html',
  styleUrls: ['./viewer-page.component.scss']
})
export class ViewerPageComponent implements OnInit {
  topicId: string = '';
  topic: Topic | null = null;
  currentSection: Section | null = null;
  currentStep: Step | null = null;
  loading = false;
  
  // Viewer state
  progress: ViewerProgress = {
    currentSection: 0,
    currentStep: 0,
    completedSteps: new Set(),
    totalSteps: 0,
    progressPercentage: 0
  };
  
  // Video player simulation
  isPlaying = false;
  currentTime = 0;
  duration = 300; // 5 minutes default
  volume = 50;
  playbackSpeed = 1;
  
  // Enums for template
  StepStatus = StepStatus;
  SectionStatus = SectionStatus;
  TopicStatus = TopicStatus;
  MediaType = MediaType;
  
  constructor(
    private contentManagerService: ContentManagerService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.topicId = params['topicId'];
      this.loadTopic();
    });
  }

  loadTopic(): void {
    this.loading = true;
    // Mock getting topic with sections and steps
    this.contentManagerService.getSubjects('plan1').subscribe({
      next: (subjects) => {
        // Find topic in subjects
        for (const subject of subjects) {
          const foundTopic = subject.topics.find(t => t.id === this.topicId);
          if (foundTopic) {
            this.topic = foundTopic;
            break;
          }
        }
        
        if (!this.topic && subjects.length > 0 && subjects[0].topics.length > 0) {
          this.topic = subjects[0].topics[0]; // Fallback to first topic
        }
        
        if (this.topic) {
          this.initializeViewer();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading topic:', error);
        this.snackBar.open('Error loading topic', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  initializeViewer(): void {
    if (!this.topic) return;
    
    // Calculate total steps
    this.progress.totalSteps = this.topic.sections.reduce((total, section) => total + section.steps.length, 0);
    
    // Set current section and step
    if (this.topic.sections.length > 0) {
      this.currentSection = this.topic.sections[0];
      if (this.currentSection.steps.length > 0) {
        this.currentStep = this.currentSection.steps[0];
        this.setMediaDuration();
      }
    }
    
    this.updateProgress();
  }

  setMediaDuration(): void {
    if (this.currentStep) {
      this.duration = this.currentStep.estimatedDuration * 60; // Convert minutes to seconds
      this.currentTime = 0;
    }
  }

  updateProgress(): void {
    if (!this.topic) return;
    
    const completedCount = this.progress.completedSteps.size;
    this.progress.progressPercentage = this.progress.totalSteps > 0 
      ? Math.round((completedCount / this.progress.totalSteps) * 100) 
      : 0;
  }

  // Navigation Methods
  goToSection(sectionIndex: number): void {
    if (!this.topic || sectionIndex < 0 || sectionIndex >= this.topic.sections.length) return;
    
    this.currentSection = this.topic.sections[sectionIndex];
    this.progress.currentSection = sectionIndex;
    
    if (this.currentSection.steps.length > 0) {
      this.goToStep(0);
    }
  }

  goToStep(stepIndex: number): void {
    if (!this.currentSection || stepIndex < 0 || stepIndex >= this.currentSection.steps.length) return;
    
    this.currentStep = this.currentSection.steps[stepIndex];
    this.progress.currentStep = stepIndex;
    this.setMediaDuration();
    this.stopPlayback();
  }

  goToNextStep(): void {
    if (!this.currentSection) return;
    
    const nextStepIndex = this.progress.currentStep + 1;
    
    if (nextStepIndex < this.currentSection.steps.length) {
      this.goToStep(nextStepIndex);
    } else {
      // Go to next section
      const nextSectionIndex = this.progress.currentSection + 1;
      if (this.topic && nextSectionIndex < this.topic.sections.length) {
        this.goToSection(nextSectionIndex);
      } else {
        this.snackBar.open('You have completed all content!', 'Close', { duration: 3000 });
      }
    }
  }

  goToPreviousStep(): void {
    const prevStepIndex = this.progress.currentStep - 1;
    
    if (prevStepIndex >= 0) {
      this.goToStep(prevStepIndex);
    } else {
      // Go to previous section
      const prevSectionIndex = this.progress.currentSection - 1;
      if (prevSectionIndex >= 0 && this.topic) {
        this.goToSection(prevSectionIndex);
        // Go to last step of previous section
        const prevSection = this.topic.sections[prevSectionIndex];
        if (prevSection.steps.length > 0) {
          this.goToStep(prevSection.steps.length - 1);
        }
      }
    }
  }

  // Media Player Methods
  togglePlayback(): void {
    this.isPlaying = !this.isPlaying;
    
    if (this.isPlaying) {
      this.startPlayback();
    } else {
      this.stopPlayback();
    }
  }

  startPlayback(): void {
    this.isPlaying = true;
    // Simulate video playback
    const interval = setInterval(() => {
      if (!this.isPlaying) {
        clearInterval(interval);
        return;
      }
      
      this.currentTime += this.playbackSpeed;
      if (this.currentTime >= this.duration) {
        this.currentTime = this.duration;
        this.isPlaying = false;
        this.onStepComplete();
        clearInterval(interval);
      }
    }, 1000);
  }

  stopPlayback(): void {
    this.isPlaying = false;
  }

  seekTo(time: number): void {
    this.currentTime = Math.max(0, Math.min(time, this.duration));
  }

  onTimeSliderChange(event: any): void {
    this.seekTo(event.value);
  }

  setPlaybackSpeed(speed: number): void {
    this.playbackSpeed = speed;
    this.snackBar.open(`Playback speed set to ${speed}x`, 'Close', { duration: 2000 });
  }

  // Step Completion
  markStepComplete(): void {
    if (this.currentStep) {
      this.progress.completedSteps.add(this.currentStep.id);
      this.updateProgress();
      this.snackBar.open('Step marked as complete!', 'Close', { duration: 2000 });
    }
  }

  onStepComplete(): void {
    this.markStepComplete();
    
    // Auto-advance to next step after completion
    setTimeout(() => {
      this.goToNextStep();
    }, 2000);
  }

  isStepCompleted(stepId: string): boolean {
    return this.progress.completedSteps.has(stepId);
  }

  // Interactive Content
  handleInteractiveContent(): void {
    if (this.currentStep?.interactive) {
      this.snackBar.open('Interactive content activated! Complete the activity to continue.', 'Close', { duration: 4000 });
      // Simulate interactive content completion
      setTimeout(() => {
        this.markStepComplete();
      }, 3000);
    }
  }

  // Utility Methods
  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  getProgressPercentage(): number {
    return this.duration > 0 ? (this.currentTime / this.duration) * 100 : 0;
  }

  getStepStatusIcon(step: Step): string {
    if (this.isStepCompleted(step.id)) {
      return 'check_circle';
    } else if (this.currentStep?.id === step.id) {
      return 'play_circle';
    } else {
      return 'radio_button_unchecked';
    }
  }

  getStepStatusColor(step: Step): string {
    if (this.isStepCompleted(step.id)) {
      return '#4caf50';
    } else if (this.currentStep?.id === step.id) {
      return '#2196f3';
    } else {
      return '#9e9e9e';
    }
  }

  getSectionCompletionCount(section: Section): number {
    return section.steps.filter(step => this.isStepCompleted(step.id)).length;
  }

  getMediaTypeIcon(mediaType?: MediaType): string {
    switch (mediaType) {
      case MediaType.VIDEO:
        return 'videocam';
      case MediaType.AUDIO:
        return 'audiotrack';
      case MediaType.IMAGE:
        return 'image';
      case MediaType.DOCUMENT:
        return 'description';
      case MediaType.PRESENTATION:
        return 'slideshow';
      default:
        return 'play_circle';
    }
  }

  goBack(): void {
    this.router.navigate(['/content-manager/plans']);
  }

  // Mock download functionality
  downloadResource(step: Step): void {
    this.snackBar.open(`Downloading resources for: ${step.title}`, 'Close', { duration: 2000 });
  }

  // Mock note taking
  takeNotes(): void {
    this.snackBar.open('Note taking feature would open here', 'Close', { duration: 2000 });
  }

  // Mock bookmark
  bookmarkStep(): void {
    if (this.currentStep) {
      this.snackBar.open(`Bookmarked: ${this.currentStep.title}`, 'Close', { duration: 2000 });
    }
  }
} 