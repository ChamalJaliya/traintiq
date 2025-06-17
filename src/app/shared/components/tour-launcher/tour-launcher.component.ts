import { Component, computed, effect, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { TourService, Tour } from '../../services/tour.service';

@Component({
  selector: 'app-tour-launcher',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule
  ],
  templateUrl: './tour-launcher.component.html',
  styleUrls: ['./tour-launcher.component.scss']
})
export class TourLauncherComponent implements OnInit {
  // Menu state
  isMenuOpen = signal(false);
  
  // Computed values
  availableTours = computed(() => this.tourService.getTours());
  hasCompletedTours = computed(() => 
    this.availableTours().some(tour => this.tourService.isTourCompleted(tour.id))
  );

  constructor(public tourService: TourService) {
    // Auto-close menu when tour starts
    effect(() => {
      if (this.tourService.isActive()) {
        this.closeMenu();
      }
    });
  }

  ngOnInit() {
    // Component initialization
  }

  /**
   * Toggle the tour menu
   */
  toggleMenu() {
    this.isMenuOpen.update(open => !open);
  }

  /**
   * Close the tour menu
   */
  closeMenu() {
    this.isMenuOpen.set(false);
  }

  /**
   * Start a specific tour
   */
  async startTour(tourId: string) {
    try {
      await this.tourService.startTour(tourId);
      this.closeMenu();
    } catch (error) {
      console.error('Failed to start tour:', error);
    }
  }

  /**
   * Reset a specific tour
   */
  resetTour(tourId: string) {
    this.tourService.resetTourCompletion(tourId);
  }

  /**
   * Reset all tours
   */
  resetAllTours() {
    this.availableTours().forEach(tour => {
      this.tourService.resetTourCompletion(tour.id);
    });
  }

  /**
   * Determine if welcome message should be shown
   */
  shouldShowWelcome(): boolean {
    return this.tourService.userPreferences().showWelcomeMessage && 
           !this.hasCompletedTours();
  }

  /**
   * Determine if FAB should pulse
   */
  shouldShowPulse(): boolean {
    return !this.hasCompletedTours() && 
           this.tourService.userPreferences().showWelcomeMessage;
  }

  /**
   * Get appropriate icon for tour
   */
  getTourIcon(tour: Tour): string {
    const iconMap: { [key: string]: string } = {
      'main-navigation': 'dashboard',
      'content-manager-deep-dive': 'content_copy',
      'employee-management': 'people',
      'company-features': 'business',
      'question-grading': 'quiz',
      'onboarding': 'waving_hand',
      'advanced-features': 'auto_awesome',
      'profile-management': 'person',
      'analytics': 'analytics',
      'settings': 'settings'
    };

    return iconMap[tour.id] || 'tour';
  }
} 