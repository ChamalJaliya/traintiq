import { Component, computed, effect, inject, OnInit, signal, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { TourService } from '../../services/tour.service';
import { TourStep } from '../../models/tour-step.model';

@Component({
  selector: 'app-tour',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatDialogModule,
    MatChipsModule
  ],
  templateUrl: './tour.component.html',
  styleUrls: ['./tour.component.scss']
})
export class TourComponent implements OnInit, OnDestroy {
  readonly tourService = inject(TourService);
  
  // Expose Math for template
  readonly Math = Math;
  
  // Signals for reactive state
  private _cardPosition = signal({ top: 100, left: 100 });
  
  // Position signals
  private windowWidth = signal(0);
  private windowHeight = signal(0);
  
  // Computed values
  readonly currentStep = this.tourService.currentStep;
  readonly currentTour = this.tourService.currentTour;
  readonly cardPosition = this._cardPosition.asReadonly();
  readonly totalSteps = computed(() => this.currentTour()?.steps.length || 0);

  ngOnInit() {
    // Listen for keyboard events
    this.setupKeyboardListeners();
    
    // Update card position when step changes
    effect(() => {
      if (this.currentStep()) {
        this.updateCardPosition();
        this.highlightTargetElement();
      }
    });

    this.updateWindowDimensions();
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.onWindowResize.bind(this));
  }

  /**
   * Get icon for current step based on content
   */
  getStepIcon(): string {
    const step = this.currentStep();
    if (!step) return 'help';
    
    const iconMap: { [key: string]: string } = {
      'Main Navigation': 'dashboard',
      'Content Manager': 'content_copy',
      'Employee Management': 'people',
      'Company Features': 'business',
      'Profile Generator': 'auto_fix_high',
      'Organization Chart': 'account_tree',
      'Directory': 'contacts',
      'History': 'history',
      'Viewer': 'visibility',
      'Talent Pool': 'groups',
      'Resume Builder': 'description',
      'CV Analyzer': 'analytics',
      'Welcome': 'waving_hand',
      'Chatbot': 'chat',
      'Questions': 'quiz'
    };

    // Match by title or fallback to tour name
    return iconMap[step.title] || iconMap[this.currentTour()?.name || ''] || 'lightbulb';
  }

  /**
   * Go to next step
   */
  nextStep(): void {
    this.tourService.nextStep();
  }

  /**
   * Go to previous step
   */
  previousStep(): void {
    this.tourService.previousStep();
  }

  /**
   * Skip the current tour
   */
  skipTour(): void {
    this.tourService.skipTour();
  }

  /**
   * Update card position based on target element
   */
  private updateCardPosition(): void {
    const step = this.currentStep();
    if (!step) return;

    setTimeout(() => {
      const targetElement = document.querySelector(step.target);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const isMobile = window.innerWidth <= 768;
        const cardWidth = isMobile ? (window.innerWidth <= 480 ? 300 : 340) : 380;
        const cardHeight = isMobile ? 260 : 280;
        const padding = 12; // Reduced padding for closer positioning
        const minPadding = 8;
        
        let top = rect.top;
        let left = rect.left;
        let actualPosition = step.position || 'auto';
        
        // Calculate available space
        const spaceRight = window.innerWidth - rect.right;
        const spaceLeft = rect.left;
        const spaceBottom = window.innerHeight - rect.bottom;
        const spaceTop = rect.top;
        
        // Position card with precise positioning
        switch (actualPosition) {
          case 'top':
            if (spaceTop >= cardHeight + padding) {
              top = rect.top - cardHeight - padding;
              left = rect.left + (rect.width / 2) - (cardWidth / 2);
            } else {
              // Fallback to bottom
              top = rect.bottom + padding;
              left = rect.left + (rect.width / 2) - (cardWidth / 2);
            }
            break;
            
          case 'bottom':
            if (spaceBottom >= cardHeight + padding) {
              top = rect.bottom + padding;
              left = rect.left + (rect.width / 2) - (cardWidth / 2);
            } else {
              // Fallback to top
              top = rect.top - cardHeight - padding;
              left = rect.left + (rect.width / 2) - (cardWidth / 2);
            }
            break;
            
          case 'left':
            if (spaceLeft >= cardWidth + padding) {
              left = rect.left - cardWidth - padding;
              top = rect.top + (rect.height / 2) - (cardHeight / 2);
            } else {
              // Fallback to right
              left = rect.right + padding;
              top = rect.top + (rect.height / 2) - (cardHeight / 2);
            }
            break;
            
          case 'right':
            if (spaceRight >= cardWidth + padding) {
              left = rect.right + padding;
              top = rect.top + (rect.height / 2) - (cardHeight / 2);
            } else {
              // Fallback to left
              left = rect.left - cardWidth - padding;
              top = rect.top + (rect.height / 2) - (cardHeight / 2);
            }
            break;
            
          default:
            // Auto positioning - choose best position based on available space
            if (spaceRight >= cardWidth + padding) {
              // Position right - most common for sidebar navigation
              left = rect.right + padding;
              top = rect.top + (rect.height / 2) - (cardHeight / 2);
            } else if (spaceBottom >= cardHeight + padding) {
              // Position bottom
              top = rect.bottom + padding;
              left = rect.left + (rect.width / 2) - (cardWidth / 2);
            } else if (spaceLeft >= cardWidth + padding) {
              // Position left
              left = rect.left - cardWidth - padding;
              top = rect.top + (rect.height / 2) - (cardHeight / 2);
            } else if (spaceTop >= cardHeight + padding) {
              // Position top
              top = rect.top - cardHeight - padding;
              left = rect.left + (rect.width / 2) - (cardWidth / 2);
            } else {
              // Not enough space anywhere - position as close as possible
              if (spaceRight >= spaceLeft) {
                left = rect.right + minPadding;
                top = Math.max(minPadding, rect.top + (rect.height / 2) - (cardHeight / 2));
              } else {
                left = rect.left - cardWidth - minPadding;
                top = Math.max(minPadding, rect.top + (rect.height / 2) - (cardHeight / 2));
              }
            }
        }
        
        // Ensure card stays within viewport with minimal adjustments
        if (left < minPadding) {
          left = minPadding;
        } else if (left + cardWidth > window.innerWidth - minPadding) {
          left = window.innerWidth - cardWidth - minPadding;
        }
        
        if (top < minPadding) {
          top = minPadding;
        } else if (top + cardHeight > window.innerHeight - minPadding) {
          top = window.innerHeight - cardHeight - minPadding;
        }
        
        this._cardPosition.set({ top, left });
      } else {
        // Target not found - center the card
        this._cardPosition.set({
          top: (window.innerHeight - 280) / 2,
          left: (window.innerWidth - 380) / 2
        });
      }
    }, 100); // Reduced timeout for faster positioning
  }

  /**
   * Highlight the target element for the current step
   */
  private highlightTargetElement(): void {
    // Remove previous highlights
    document.querySelectorAll('.tour-highlight').forEach(el => {
      el.classList.remove('tour-highlight');
    });

    const step = this.currentStep();
    if (!step) return;

    setTimeout(() => {
      const targetElement = document.querySelector(step.target);
      if (targetElement) {
        targetElement.classList.add('tour-highlight');
        
        // Scroll element into view if needed
        targetElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center', 
          inline: 'center' 
        });
      }
    }, 100);
  }

  /**
   * Setup keyboard event listeners
   */
  private setupKeyboardListeners(): void {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!this.tourService.isActive()) return;
      
      switch (event.key) {
        case 'Escape':
          if (this.tourService.userPreferences().skipOnEscape) {
            this.skipTour();
          }
          break;
        case 'ArrowRight':
        case 'Enter':
          event.preventDefault();
          this.nextStep();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          this.previousStep();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Cleanup on component destroy
    // Note: In a real app, you'd want to implement OnDestroy and clean this up
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (!this.tourService.isActive()) return;
    
    switch (event.key) {
      case 'ArrowRight':
      case 'Enter':
        if (this.currentStep()?.showNext) {
          this.nextStep();
        }
        event.preventDefault();
        break;
      case 'ArrowLeft':
        if (this.currentStep()?.showPrevious && !this.tourService.isFirstStep()) {
          this.previousStep();
        }
        event.preventDefault();
        break;
      case 'Escape':
        if (this.currentStep()?.showSkip) {
          this.skipTour();
        }
        event.preventDefault();
        break;
    }
  }

  private onWindowResize() {
    this.updateWindowDimensions();
  }

  private updateWindowDimensions() {
    this.windowWidth.set(window.innerWidth);
    this.windowHeight.set(window.innerHeight);
  }
} 