# Traintiq Tour System 🎯

A modern, Angular 20-based tour system built with **Signals**, **Standalone Components**, and **Material Design**. This system provides an intuitive way to guide users through your application without any external dependencies.

## ✨ Features

- **🎯 Signal-based State Management**: Leverages Angular 20's stable Signals API for reactive state management
- **🎨 Material Design**: Beautiful, responsive UI components using Angular Material
- **🎪 Multiple Tour Types**: Pre-built tours for different sections of your application
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **⌨️ Keyboard Navigation**: Support for arrow keys, Enter, and Escape
- **🎭 Smart Positioning**: Automatically positions tour cards to avoid screen edges
- **💾 Progress Tracking**: Remembers completed tours using localStorage
- **🎬 Smooth Animations**: Engaging animations and transitions
- **🎪 Backdrop Support**: Optional backdrop dimming for better focus
- **🔧 Highly Customizable**: Easy to extend and customize for your needs

## 🚀 Getting Started

The tour system is already integrated into your main layout. Here's how to use it:

### 1. Available Tours

The system comes with three pre-built tours:

1. **Main Navigation Tour** (`main-navigation`)
   - Overview of the entire application
   - Navigation sidebar and toolbar
   - 8 interactive steps

2. **Content Manager Deep Dive** (`content-manager-deep-dive`)
   - Detailed walkthrough of content management features
   - Training plans, subject builder, topic editor
   - 4 focused steps

3. **Employee Management Tour** (`employee-management`)
   - HR and employee management features
   - CV analyzer, profiles, talent pool
   - 3 comprehensive steps

### 2. Starting a Tour

Users can start tours in several ways:

#### From the Tour Launcher (Recommended)
- Click the orange floating action button (tour icon) in the bottom-right corner
- Select a tour from the menu
- First-time users see a welcome message

#### Programmatically
```typescript
import { TourService } from './shared/services/tour.service';

constructor(private tourService: TourService) {}

startTour() {
  this.tourService.startTour('main-navigation');
}
```

### 3. Tour Controls

During a tour, users can:
- **Navigate**: Use Previous/Next buttons or arrow keys
- **Skip**: Click "Skip Tour" button or press Escape
- **Progress**: Visual progress bar shows completion percentage
- **Keyboard**: Arrow keys, Enter (next), Escape (skip)

## 🛠️ Customization

### Adding New Tours

To add a new tour, modify the `tours` array in `tour.service.ts`:

```typescript
{
  id: 'my-custom-tour',
  name: 'My Custom Tour',
  description: 'A custom tour for specific features',
  steps: [
    {
      id: 'step-1',
      title: 'Welcome to Custom Feature',
      content: 'This is how you use this feature...',
      target: '.my-feature-selector',
      position: 'right',
      showSkip: true,
      showPrevious: false,
      showNext: true,
      backdrop: true,
      highlightPadding: 12
    }
    // Add more steps...
  ]
}
```

### Step Configuration Options

Each step supports these options:

```typescript
interface TourStep {
  id: string;                    // Unique identifier
  title: string;                 // Step title
  content: string;               // Step description
  target: string;                // CSS selector for target element
  position?: 'top' | 'bottom' | 'left' | 'right'; // Card position
  route?: string;                // Navigate to this route
  action?: () => void;           // Custom action to perform
  showSkip?: boolean;            // Show skip button
  showPrevious?: boolean;        // Show previous button
  showNext?: boolean;            // Show next button
  backdrop?: boolean;            // Show backdrop overlay
  highlightPadding?: number;     // Padding around highlighted element
}
```

### Styling Customization

The tour system uses CSS custom properties for easy theming:

```scss
:root {
  --tour-primary-color: #1976d2;
  --tour-accent-color: #ff6b35;
  --tour-background: white;
  --tour-text-color: #333;
  --tour-border-radius: 16px;
}
```

## 🎨 Components

### TourService
- **Purpose**: Core service managing tour state and logic
- **Features**: Signal-based state, localStorage persistence, navigation
- **Location**: `src/app/shared/services/tour.service.ts`

### TourComponent
- **Purpose**: Displays tour steps and controls
- **Features**: Responsive positioning, keyboard navigation, progress tracking
- **Location**: `src/app/shared/components/tour/tour.component.ts`

### TourLauncherComponent
- **Purpose**: Entry point for users to discover and start tours
- **Features**: Floating action button, tour menu, welcome message
- **Location**: `src/app/shared/components/tour-launcher/tour-launcher.component.ts`

## 📱 Responsive Design

The tour system is fully responsive:

- **Desktop**: Full-featured experience with hover effects
- **Tablet**: Optimized touch interactions
- **Mobile**: Compact layout with mobile-friendly controls

## 🔧 API Reference

### TourService Methods

```typescript
// Start a tour
startTour(tourId: string): Promise<void>

// Navigate through steps
nextStep(): Promise<void>
previousStep(): Promise<void>

// Control tour flow
skipTour(): void
completeTour(): void
endTour(): void

// Get tour information
getTours(): Tour[]
isTourCompleted(tourId: string): boolean

// User preferences
updatePreferences(preferences: Partial<UserPreferences>): void
```

### TourService Signals

```typescript
// Read-only signals
readonly isActive: Signal<boolean>
readonly currentTour: Signal<Tour | null>
readonly currentStep: Signal<TourStep | null>
readonly currentStepIndex: Signal<number>
readonly isCompleted: Signal<boolean>
readonly progress: Signal<number>
readonly isFirstStep: Signal<boolean>
readonly isLastStep: Signal<boolean>
```

## 🎪 Best Practices

1. **Keep Steps Focused**: Each step should cover one feature or concept
2. **Use Clear Language**: Write concise, actionable descriptions
3. **Test on All Devices**: Ensure tours work on desktop, tablet, and mobile
4. **Provide Context**: Include relevant icons and visual cues
5. **Allow Easy Exit**: Always provide skip/exit options
6. **Track Completion**: Use localStorage to avoid repeating tours
7. **Test Selectors**: Ensure target selectors are stable and specific

## 🚨 Troubleshooting

### Common Issues

1. **Tour Not Starting**
   - Check if target elements exist in DOM
   - Verify tour ID is correct
   - Ensure selectors are valid

2. **Positioning Issues**
   - Adjust `highlightPadding` property
   - Try different `position` values
   - Check for CSS conflicts

3. **Navigation Problems**
   - Verify route paths are correct
   - Check if lazy-loaded modules are loaded
   - Ensure router navigation is working

### Debug Mode

Enable debug mode by setting:
```typescript
// In tour.service.ts
private debugMode = true; // Set to true for console logs
```

## 🎯 Future Enhancements

Potential improvements for the tour system:

- **Tour Analytics**: Track user interactions and completion rates
- **Dynamic Tours**: Generate tours based on user roles or permissions
- **A/B Testing**: Test different tour variations
- **Voice Guidance**: Audio narration for accessibility
- **Video Integration**: Embed video explanations in tour steps
- **Multi-language Support**: Internationalization for global users
- **Tour Branching**: Conditional steps based on user choices

## 🎉 Conclusion

The Traintiq Tour System provides a modern, user-friendly way to onboard users and showcase your application's features. Built with Angular 20's latest features and best practices, it's both powerful and easy to maintain.

For questions or contributions, please refer to the main project documentation or contact the development team.

---

**Built with ❤️ using Angular 20, Signals, and Material Design** 