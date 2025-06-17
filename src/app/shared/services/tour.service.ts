import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';

export interface TourStep {
  id: string;
  title: string;
  content: string;
  target: string; // CSS selector
  position?: 'top' | 'bottom' | 'left' | 'right';
  route?: string; // Optional route to navigate to
  action?: () => void; // Optional action to perform
  showSkip?: boolean;
  showPrevious?: boolean;
  showNext?: boolean;
  backdrop?: boolean;
  highlightPadding?: number;
}

export interface Tour {
  id: string;
  name: string;
  description: string;
  steps: TourStep[];
}

@Injectable({
  providedIn: 'root'
})
export class TourService {
  private router = inject(Router);

  // Signals for reactive state management
  private _isActive = signal(false);
  private _currentTour = signal<Tour | null>(null);
  private _currentStepIndex = signal(0);
  private _isCompleted = signal(false);
  private _userPreferences = signal({
    showWelcomeMessage: true,
    autoStart: false,
    skipOnEscape: true
  });

  // Computed values
  readonly isActive = this._isActive.asReadonly();
  readonly currentTour = this._currentTour.asReadonly();
  readonly currentStepIndex = this._currentStepIndex.asReadonly();
  readonly isCompleted = this._isCompleted.asReadonly();
  readonly userPreferences = this._userPreferences.asReadonly();

  readonly currentStep = computed(() => {
    const tour = this._currentTour();
    const index = this._currentStepIndex();
    return tour && tour.steps[index] ? tour.steps[index] : null;
  });

  readonly isFirstStep = computed(() => this._currentStepIndex() === 0);
  readonly isLastStep = computed(() => {
    const tour = this._currentTour();
    return tour ? this._currentStepIndex() === tour.steps.length - 1 : false;
  });

  readonly progress = computed(() => {
    const tour = this._currentTour();
    const index = this._currentStepIndex();
    return tour ? ((index + 1) / tour.steps.length) * 100 : 0;
  });

  // Predefined tours for different sections of the app
  private tours: Tour[] = [
    {
      id: 'main-navigation',
      name: 'Main Navigation Tour',
      description: 'Learn how to navigate through Traintiq',
      steps: [
        {
          id: 'welcome',
          title: 'Welcome to Traintiq! 🎉',
          content: 'Let\'s take a quick tour to help you get started with our comprehensive HR and training platform.',
          target: 'body',
          position: 'bottom',
          showSkip: true,
          showPrevious: false,
          showNext: true,
          backdrop: true,
          highlightPadding: 0
        },
        {
          id: 'sidebar-toggle',
          title: 'Navigation Menu',
          content: 'Click here to toggle the navigation sidebar. This gives you access to all major sections of the application.',
          target: 'button[mat-icon-button]:has(mat-icon:contains("menu"))',
          position: 'right',
          showSkip: true,
          showPrevious: true,
          showNext: true,
          backdrop: true,
          highlightPadding: 8
        },
        {
          id: 'content-manager',
          title: 'Content Manager Section',
          content: 'Here you can manage training plans, build subjects, edit topics, and view content. Perfect for creating educational materials.',
          target: '.nav-section:has(.nav-section-header mat-icon:contains("video_library"))',
          position: 'right',
          showSkip: true,
          showPrevious: true,
          showNext: true,
          backdrop: true,
          highlightPadding: 12
        },
        {
          id: 'question-grading',
          title: 'Question Grading System',
          content: 'Create and manage questions for assessments. Build comprehensive quizzes and evaluations for your training programs.',
          target: '.nav-section:has(.nav-section-header mat-icon:contains("school"))',
          position: 'right',
          showSkip: true,
          showPrevious: true,
          showNext: true,
          backdrop: true,
          highlightPadding: 12
        },
        {
          id: 'company-section',
          title: 'Company Management',
          content: 'Generate company profiles, view history, and manage organizational charts and directories.',
          target: '.nav-section:has(.nav-section-header mat-icon:contains("business"))',
          position: 'right',
          showSkip: true,
          showPrevious: true,
          showNext: true,
          backdrop: true,
          highlightPadding: 12
        },
        {
          id: 'employee-section',
          title: 'Employee Management',
          content: 'Analyze CVs, manage employee profiles, and maintain your talent pool. Everything you need for HR management.',
          target: '.nav-section:has(.nav-section-header mat-icon:contains("groups"))',
          position: 'right',
          showSkip: true,
          showPrevious: true,
          showNext: true,
          backdrop: true,
          highlightPadding: 12
        },
        {
          id: 'toolbar-actions',
          title: 'Quick Actions',
          content: 'Access notifications and your profile settings from these buttons in the top toolbar.',
          target: '.toolbar-action',
          position: 'bottom',
          showSkip: true,
          showPrevious: true,
          showNext: true,
          backdrop: true,
          highlightPadding: 8
        },
        {
          id: 'chat-bot',
          title: 'AI Assistant',
          content: 'Need help? Our AI chatbot is always available to assist you with questions and guidance.',
          target: 'app-chat-bot',
          position: 'left',
          showSkip: true,
          showPrevious: true,
          showNext: false,
          backdrop: true,
          highlightPadding: 12
        }
      ]
    },
    {
      id: 'content-manager-deep-dive',
      name: 'Content Manager Deep Dive',
      description: 'Explore the content management features in detail',
      steps: [
        {
          id: 'training-plans',
          title: 'Training Plans',
          content: 'Create and manage comprehensive training programs for your organization.',
          target: 'a[routerLink="/content-manager/plans"]',
          route: '/content-manager/plans',
          position: 'right',
          showSkip: true,
          showPrevious: false,
          showNext: true,
          backdrop: true,
          highlightPadding: 8
        },
        {
          id: 'subject-builder',
          title: 'Subject Builder',
          content: 'Build custom subjects and curriculum for your training programs.',
          target: 'a[routerLink="/content-manager/subject-builder/1"]',
          route: '/content-manager/subject-builder/1',
          position: 'right',
          showSkip: true,
          showPrevious: true,
          showNext: true,
          backdrop: true,
          highlightPadding: 8
        },
        {
          id: 'topic-editor',
          title: 'Topic Editor',
          content: 'Edit and refine individual topics within your subjects.',
          target: 'a[routerLink="/content-manager/topic-editor/1"]',
          route: '/content-manager/topic-editor/1',
          position: 'right',
          showSkip: true,
          showPrevious: true,
          showNext: true,
          backdrop: true,
          highlightPadding: 8
        },
        {
          id: 'content-viewer',
          title: 'Content Viewer',
          content: 'Preview and view your created content to ensure quality and consistency.',
          target: 'a[routerLink="/content-manager/content-viewer/1"]',
          route: '/content-manager/content-viewer/1',
          position: 'right',
          showSkip: true,
          showPrevious: true,
          showNext: false,
          backdrop: true,
          highlightPadding: 8
        }
      ]
    },
    {
      id: 'employee-management',
      name: 'Employee Management Tour',
      description: 'Discover employee management and HR features',
      steps: [
        {
          id: 'cv-analyzer',
          title: 'CV Analyzer',
          content: 'Upload and analyze CVs with AI-powered insights to make better hiring decisions.',
          target: 'a[routerLink="/employee/analyzer"]',
          route: '/employee/analyzer',
          position: 'right',
          showSkip: true,
          showPrevious: false,
          showNext: true,
          backdrop: true,
          highlightPadding: 8
        },
        {
          id: 'employee-profiles',
          title: 'Employee Profiles',
          content: 'Manage detailed profiles for all your employees, including skills, experience, and performance data.',
          target: 'a[routerLink="/employee/profiles"]',
          route: '/employee/profiles',
          position: 'right',
          showSkip: true,
          showPrevious: true,
          showNext: true,
          backdrop: true,
          highlightPadding: 8
        },
        {
          id: 'talent-pool',
          title: 'Talent Pool',
          content: 'Maintain a pool of potential candidates and track their qualifications and availability.',
          target: 'a[routerLink="/employee/talent-pool"]',
          route: '/employee/talent-pool',
          position: 'right',
          showSkip: true,
          showPrevious: true,
          showNext: false,
          backdrop: true,
          highlightPadding: 8
        }
      ]
    },
    {
      id: 'company-features',
      name: 'Company Features Tour',
      description: 'Discover comprehensive company management tools',
      steps: [
        {
          id: 'company-welcome',
          title: 'Company Management Hub 🏢',
          content: 'Welcome to the company management section! Here you can handle all aspects of your organization.',
          target: '.nav-section:has(.nav-section-header mat-icon:contains("business"))',
          position: 'right',
          showSkip: true,
          showPrevious: false,
          showNext: true,
          backdrop: true,
          highlightPadding: 12
        },
        {
          id: 'profile-generator',
          title: 'AI-Powered Profile Generator',
          content: 'Use our advanced AI to automatically generate comprehensive company profiles based on your business data.',
          target: 'a[routerLink="/company/generator"]',
          route: '/company/generator',
          position: 'right',
          showSkip: true,
          showPrevious: true,
          showNext: true,
          backdrop: true,
          highlightPadding: 8
        },
        {
          id: 'generation-history',
          title: 'Profile Generation History',
          content: 'Track and manage all your generated company profiles. View past versions and export data.',
          target: 'a[routerLink="/company/history"]',
          route: '/company/history',
          position: 'right',
          showSkip: true,
          showPrevious: true,
          showNext: true,
          backdrop: true,
          highlightPadding: 8
        },
        {
          id: 'organization-chart',
          title: 'Visual Organization Chart',
          content: 'Create and manage interactive organizational charts to visualize your company structure.',
          target: 'a[routerLink="/company/organization-chart"]',
          route: '/company/organization-chart',
          position: 'right',
          showSkip: true,
          showPrevious: true,
          showNext: true,
          backdrop: true,
          highlightPadding: 8
        },
        {
          id: 'organization-directory',
          title: 'Organization Directory',
          content: 'Maintain a comprehensive directory of all team members with contact information and roles.',
          target: 'a[routerLink="/company/organization-directory"]',
          route: '/company/organization-directory',
          position: 'right',
          showSkip: true,
          showPrevious: true,
          showNext: false,
          backdrop: true,
          highlightPadding: 8
        }
      ]
    }
  ];

  /**
   * Start a tour by ID
   */
  async startTour(tourId: string): Promise<void> {
    const tour = this.tours.find(t => t.id === tourId);
    if (!tour) {
      console.warn(`Tour with ID "${tourId}" not found`);
      return;
    }

    this._currentTour.set(tour);
    this._currentStepIndex.set(0);
    this._isActive.set(true);
    this._isCompleted.set(false);

    // Navigate to the first step's route if specified
    const firstStep = tour.steps[0];
    if (firstStep?.route) {
      await this.router.navigate([firstStep.route]);
      // Wait a bit for the navigation to complete
      setTimeout(() => this.highlightCurrentStep(), 100);
    } else {
      this.highlightCurrentStep();
    }
  }

  /**
   * Go to the next step
   */
  async nextStep(): Promise<void> {
    const tour = this._currentTour();
    if (!tour) return;

    const nextIndex = this._currentStepIndex() + 1;
    if (nextIndex < tour.steps.length) {
      this._currentStepIndex.set(nextIndex);
      
      // Navigate if the step has a route
      const nextStep = tour.steps[nextIndex];
      if (nextStep?.route) {
        await this.router.navigate([nextStep.route]);
        setTimeout(() => this.highlightCurrentStep(), 100);
      } else {
        this.highlightCurrentStep();
      }
    } else {
      this.completeTour();
    }
  }

  /**
   * Go to the previous step
   */
  async previousStep(): Promise<void> {
    const currentIndex = this._currentStepIndex();
    if (currentIndex > 0) {
      this._currentStepIndex.set(currentIndex - 1);
      
      // Navigate if the step has a route
      const tour = this._currentTour();
      if (tour) {
        const prevStep = tour.steps[currentIndex - 1];
        if (prevStep?.route) {
          await this.router.navigate([prevStep.route]);
          setTimeout(() => this.highlightCurrentStep(), 100);
        } else {
          this.highlightCurrentStep();
        }
      }
    }
  }

  /**
   * Skip the current tour
   */
  skipTour(): void {
    this.endTour();
  }

  /**
   * Complete the current tour
   */
  completeTour(): void {
    this._isCompleted.set(true);
    setTimeout(() => this.endTour(), 2000); // Show completion message for 2 seconds
  }

  /**
   * End the current tour
   */
  endTour(): void {
    this._isActive.set(false);
    this._currentTour.set(null);
    this._currentStepIndex.set(0);
    this._isCompleted.set(false);
    this.removeHighlight();
  }

  /**
   * Get all available tours
   */
  getTours(): Tour[] {
    return [...this.tours];
  }

  /**
   * Update user preferences
   */
  updatePreferences(preferences: Partial<{ showWelcomeMessage: boolean; autoStart: boolean; skipOnEscape: boolean; }>): void {
    this._userPreferences.update(current => ({ ...current, ...preferences }));
  }

  /**
   * Check if a tour has been completed (stored in localStorage)
   */
  isTourCompleted(tourId: string): boolean {
    const completed = localStorage.getItem(`tour_completed_${tourId}`);
    return completed === 'true';
  }

  /**
   * Mark a tour as completed
   */
  markTourAsCompleted(tourId: string): void {
    localStorage.setItem(`tour_completed_${tourId}`, 'true');
  }

  /**
   * Reset tour completion status
   */
  resetTourCompletion(tourId: string): void {
    localStorage.removeItem(`tour_completed_${tourId}`);
  }

  /**
   * Highlight the current step's target element
   */
  private highlightCurrentStep(): void {
    const step = this.currentStep();
    if (!step) return;

    // Remove existing highlights
    this.removeHighlight();

    // Wait for DOM to be ready
    setTimeout(() => {
      const element = document.querySelector(step.target);
      if (element) {
        element.classList.add('tour-highlight');
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
  }

  /**
   * Remove highlight from all elements
   */
  private removeHighlight(): void {
    const highlighted = document.querySelectorAll('.tour-highlight');
    highlighted.forEach(el => el.classList.remove('tour-highlight'));
  }
} 