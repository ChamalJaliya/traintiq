import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

export interface StepBuilderStep {
  id: string;
  title: string;
  description: string;
  content: string;
  videoUrl?: string;
  order: number;
  status: StepBuilderStatus;
  estimatedDuration: number;
  interactive: boolean;
  mediaType?: StepMediaType;
  attachments: StepAttachment[];
  completed: boolean;
}

export interface StepBuilderTopic {
  id: string;
  title: string;
  description: string;
  steps: StepBuilderStep[];
  currentStepIndex: number;
  totalSteps: number;
  progress: number;
  estimatedDuration: number;
}

export interface StepAttachment {
  id: string;
  name: string;
  url: string;
  type: AttachmentType;
  size: number;
}

export interface VideoContent {
  id: string;
  title: string;
  url: string;
  duration: number;
  thumbnailUrl?: string;
  subtitles?: string;
}

export enum StepBuilderStatus {
  DRAFT = 'draft',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REVIEW = 'review'
}

export enum StepMediaType {
  VIDEO = 'video',
  AUDIO = 'audio',
  IMAGE = 'image',
  DOCUMENT = 'document',
  INTERACTIVE = 'interactive'
}

export enum AttachmentType {
  PDF = 'pdf',
  WORD = 'word',
  EXCEL = 'excel',
  POWERPOINT = 'powerpoint',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  OTHER = 'other'
}

@Injectable({
  providedIn: 'root'
})
export class StepbuilderService {

  private mockTopic: StepBuilderTopic = {
    id: 'topic-stepbuilder-1',
    title: 'Styling in React',
    description: 'Learn different approaches to styling React applications',
    currentStepIndex: 0,
    totalSteps: 3,
    progress: 33,
    estimatedDuration: 45,
    steps: [
      {
        id: 'step-1',
        title: 'Inline Styles',
        description: 'Applying inline styles directly within JSX for quick and straightforward styling solutions.',
        content: `# Inline Styles in React

Inline styles in React provide a way to apply CSS styles directly to elements using JavaScript objects. This approach offers dynamic styling capabilities and component-scoped styles.

## Basic Syntax

\`\`\`jsx
const MyComponent = () => {
  const divStyle = {
    color: 'blue',
    backgroundColor: 'lightgray',
    padding: '10px',
    borderRadius: '5px'
  };

  return <div style={divStyle}>Hello World!</div>;
};
\`\`\`

## Advantages
- **Dynamic Styles**: Easy to change styles based on component state
- **No CSS Conflicts**: Styles are scoped to the component
- **JavaScript Integration**: Can use variables and functions

## Best Practices
- Use camelCase for property names
- Consider performance for frequently changing styles
- Keep complex styles in separate objects`,
        videoUrl: 'https://example.com/react-inline-styles.mp4',
        order: 1,
        status: StepBuilderStatus.COMPLETED,
        estimatedDuration: 15,
        interactive: true,
        mediaType: StepMediaType.VIDEO,
        completed: true,
        attachments: [
          {
            id: 'att-1',
            name: 'inline-styles-examples.pdf',
            url: 'https://example.com/inline-styles-examples.pdf',
            type: AttachmentType.PDF,
            size: 245760
          }
        ]
      },
      {
        id: 'step-2',
        title: 'Styled Components',
        description: 'Learn how to use styled-components library for component-based styling in React.',
        content: `# Styled Components

Styled Components is a popular CSS-in-JS library that allows you to write CSS code to style your components using tagged template literals.

## Installation

\`\`\`bash
npm install styled-components
\`\`\`

## Basic Usage

\`\`\`jsx
import styled from 'styled-components';

const StyledButton = styled.button\`
  background-color: #007bff;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  
  &:hover {
    background-color: #0056b3;
  }
\`;

const MyComponent = () => {
  return <StyledButton>Click me!</StyledButton>;
};
\`\`\`

## Advanced Features
- **Props-based styling**: Dynamic styles based on component props
- **Theme support**: Consistent styling across your application
- **Automatic vendor prefixing**: Cross-browser compatibility

## Benefits
- Component-scoped styles
- Dynamic styling with props
- Automatic critical CSS injection
- No class name conflicts`,
        videoUrl: 'https://example.com/styled-components.mp4',
        order: 2,
        status: StepBuilderStatus.IN_PROGRESS,
        estimatedDuration: 20,
        interactive: true,
        mediaType: StepMediaType.VIDEO,
        completed: false,
        attachments: [
          {
            id: 'att-2',
            name: 'styled-components-guide.pdf',
            url: 'https://example.com/styled-components-guide.pdf',
            type: AttachmentType.PDF,
            size: 512000
          }
        ]
      },
      {
        id: 'step-3',
        title: 'CSS Modules',
        description: 'Understanding CSS Modules for scoped styling in React applications.',
        content: `# CSS Modules

CSS Modules provide a way to write CSS that's locally scoped to the component, preventing style conflicts and enabling modular styling.

## What are CSS Modules?
CSS Modules automatically generate unique class names for your CSS classes, ensuring they don't conflict with styles in other components.

## Basic Setup

**styles.module.css**
\`\`\`css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.title {
  color: #333;
  font-size: 2rem;
  margin-bottom: 1rem;
}

.button {
  background-color: #007bff;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.button:hover {
  background-color: #0056b3;
}
\`\`\`

**Component.jsx**
\`\`\`jsx
import styles from './styles.module.css';

const MyComponent = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Welcome</h1>
      <button className={styles.button}>Click me</button>
    </div>
  );
};
\`\`\`

## Benefits
- **Automatic scope isolation**: No global CSS conflicts
- **Familiar CSS syntax**: Write regular CSS
- **Optimal bundle size**: Only used styles are included
- **Development friendly**: Clear class name mapping in dev tools`,
        videoUrl: 'https://example.com/css-modules.mp4',
        order: 3,
        status: StepBuilderStatus.DRAFT,
        estimatedDuration: 10,
        interactive: false,
        mediaType: StepMediaType.VIDEO,
        completed: false,
        attachments: []
      }
    ]
  };

  constructor() {}

  getTopic(topicId: string): Observable<StepBuilderTopic> {
    return of(this.mockTopic).pipe(delay(500));
  }

  getCurrentStep(topicId: string): Observable<StepBuilderStep> {
    const currentStep = this.mockTopic.steps[this.mockTopic.currentStepIndex];
    return of(currentStep).pipe(delay(300));
  }

  getStep(stepId: string): Observable<StepBuilderStep | null> {
    const step = this.mockTopic.steps.find(s => s.id === stepId);
    return of(step || null).pipe(delay(300));
  }

  updateStep(stepId: string, stepData: Partial<StepBuilderStep>): Observable<StepBuilderStep> {
    const stepIndex = this.mockTopic.steps.findIndex(s => s.id === stepId);
    if (stepIndex !== -1) {
      this.mockTopic.steps[stepIndex] = { ...this.mockTopic.steps[stepIndex], ...stepData };
      return of(this.mockTopic.steps[stepIndex]).pipe(delay(500));
    }
    throw new Error('Step not found');
  }

  navigateToStep(topicId: string, stepIndex: number): Observable<StepBuilderStep> {
    if (stepIndex >= 0 && stepIndex < this.mockTopic.steps.length) {
      this.mockTopic.currentStepIndex = stepIndex;
      return of(this.mockTopic.steps[stepIndex]).pipe(delay(300));
    }
    throw new Error('Step index out of range');
  }

  markStepCompleted(stepId: string): Observable<boolean> {
    const stepIndex = this.mockTopic.steps.findIndex(s => s.id === stepId);
    if (stepIndex !== -1) {
      this.mockTopic.steps[stepIndex].completed = true;
      this.mockTopic.steps[stepIndex].status = StepBuilderStatus.COMPLETED;
      this.updateProgress();
      return of(true).pipe(delay(300));
    }
    return of(false);
  }

  addVideoToStep(stepId: string, videoData: VideoContent): Observable<boolean> {
    const stepIndex = this.mockTopic.steps.findIndex(s => s.id === stepId);
    if (stepIndex !== -1) {
      this.mockTopic.steps[stepIndex].videoUrl = videoData.url;
      this.mockTopic.steps[stepIndex].mediaType = StepMediaType.VIDEO;
      return of(true).pipe(delay(500));
    }
    return of(false);
  }

  private updateProgress(): void {
    const completedSteps = this.mockTopic.steps.filter(s => s.completed).length;
    this.mockTopic.progress = Math.round((completedSteps / this.mockTopic.totalSteps) * 100);
  }
} 