export interface TourStep {
  title: string;
  content: string;
  target: string;
  element?: string; // For backward compatibility
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'auto';
  backdrop?: boolean;
  showNext?: boolean;
  showPrevious?: boolean;
  showSkip?: boolean;
  onNext?: () => void;
  onPrevious?: () => void;
  onShow?: () => void;
  customIcon?: string;
  animation?: string;
  delay?: number;
}

export interface Tour {
  id: string;
  name: string;
  description?: string;
  steps: TourStep[];
  autoStart?: boolean;
  completedMessage?: string;
  category?: 'navigation' | 'feature' | 'onboarding' | 'help';
}

export interface TourProgress {
  tourId: string;
  completedSteps: number;
  totalSteps: number;
  isCompleted: boolean;
  lastCompletedAt?: Date;
} 