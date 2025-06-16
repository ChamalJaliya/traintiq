import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';

// Import from the centralized models
import {
  Plan,
  Subject,
  Topic,
  Section,
  Step,
  PlanStatus,
  SubjectStatus,
  TopicStatus,
  SectionStatus,
  StepStatus,
  DifficultyLevel,
  ContentType,
  MediaType,
  AIGenerationRequest,
  AIGeneratedContent,
  GeneratedSection,
  GeneratedStep
} from '../models/content.models';

// Re-export everything from models for easier imports
export * from '../models/content.models';

@Injectable({
  providedIn: 'root'
})
export class ContentManagerService {
  
  private mockPlans: Plan[] = [
    {
      id: 'plan-1',
      title: 'Complete React Development Course',
      description: 'Master React from basics to advanced concepts with hands-on projects',
      status: PlanStatus.PUBLISHED,
      difficulty: DifficultyLevel.INTERMEDIATE,
      estimatedDuration: 1200, // 20 hours
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15'),
      createdBy: 'admin',
      tags: ['react', 'javascript', 'frontend'],
      subjects: [
        {
          id: 'subject-1',
          planId: 'plan-1',
          title: 'React Fundamentals',
          description: 'Learn the core concepts of React including components, state, and props',
          order: 1,
          estimatedDuration: 480, // 8 hours
          status: SubjectStatus.IN_PROGRESS,
          prerequisites: ['HTML', 'CSS', 'JavaScript'],
          learningObjectives: [
            'Understand React components and JSX',
            'Learn about state and props',
            'Master React hooks',
            'Build interactive applications'
          ],
          topics: [
            {
              id: 'topic-1',
              subjectId: 'subject-1',
              title: 'Introduction to React',
              description: 'Understanding what React is and why it\'s useful for building user interfaces',
              order: 1,
              estimatedDuration: 120, // 2 hours
              status: TopicStatus.COMPLETED,
              contentType: ContentType.MIXED,
              sections: [
                {
                  id: 'section-1',
                  topicId: 'topic-1',
                  title: 'Getting Started with React',
                  description: 'Setting up your first React application and understanding the basics',
                  order: 1,
                  estimatedDuration: 45,
                  status: SectionStatus.COMPLETED,
                  steps: [
                    {
                      id: 'step-1',
                      sectionId: 'section-1',
                      title: 'What is React?',
                      description: 'Understanding React as a JavaScript library for building user interfaces',
                      content: 'React is a JavaScript library for building user interfaces, particularly web applications. It was created by Facebook and is now maintained by Facebook and the community.',
                      mediaUrl: 'https://example.com/react-intro.mp4',
                      mediaType: MediaType.VIDEO,
                      order: 1,
                      status: StepStatus.COMPLETED,
                      estimatedDuration: 15,
                      interactive: false,
                      attachments: []
                    },
                    {
                      id: 'step-2',
                      sectionId: 'section-1',
                      title: 'Setting up Development Environment',
                      description: 'Installing Node.js, npm, and creating your first React app with Create React App',
                      content: 'Learn how to set up your development environment for React development including Node.js, npm, and create-react-app.',
                      mediaUrl: 'https://example.com/setup-env.mp4',
                      mediaType: MediaType.VIDEO,
                      order: 2,
                      status: StepStatus.IN_PROGRESS,
                      estimatedDuration: 20,
                      interactive: true,
                      attachments: []
                    },
                    {
                      id: 'step-3',
                      sectionId: 'section-1',
                      title: 'Your First React Component',
                      description: 'Creating and rendering your first React functional component',
                      content: 'Create your first React component and understand JSX syntax.',
                      mediaUrl: 'https://example.com/first-component.mp4',
                      mediaType: MediaType.VIDEO,
                      order: 3,
                      status: StepStatus.DRAFT,
                      estimatedDuration: 10,
                      interactive: true,
                      attachments: []
                    }
                  ]
                },
                {
                  id: 'section-2',
                  topicId: 'topic-1',
                  title: 'Understanding Components',
                  description: 'Deep dive into React components - functional and class components',
                  order: 2,
                  estimatedDuration: 75,
                  status: SectionStatus.IN_PROGRESS,
                  steps: [
                    {
                      id: 'step-4',
                      sectionId: 'section-2',
                      title: 'Functional Components',
                      description: 'Understanding functional components and their advantages in modern React',
                      content: 'Learn about functional components and how to create them.',
                      mediaUrl: 'https://example.com/functional-components.mp4',
                      mediaType: MediaType.VIDEO,
                      order: 1,
                      status: StepStatus.COMPLETED,
                      estimatedDuration: 25,
                      interactive: false,
                      attachments: []
                    },
                    {
                      id: 'step-5',
                      sectionId: 'section-2',
                      title: 'Class Components',
                      description: 'Learning about class components and their lifecycle methods',
                      content: 'Understanding class components and their lifecycle methods.',
                      mediaUrl: 'https://example.com/class-components.mp4',
                      mediaType: MediaType.VIDEO,
                      order: 2,
                      status: StepStatus.IN_PROGRESS,
                      estimatedDuration: 30,
                      interactive: true,
                      attachments: []
                    },
                    {
                      id: 'step-6',
                      sectionId: 'section-2',
                      title: 'Props and State',
                      description: 'Learning how to pass data between components and manage component state',
                      content: 'Learn how to pass data between components using props and manage component state.',
                      mediaUrl: 'https://example.com/props-state.mp4',
                      mediaType: MediaType.VIDEO,
                      order: 3,
                      status: StepStatus.DRAFT,
                      estimatedDuration: 20,
                      interactive: true,
                      attachments: []
                    }
                  ]
                }
              ]
            },
            {
              id: 'topic-2',
              subjectId: 'subject-1',
              title: 'React Hooks',
              description: 'Master React hooks for state management and side effects',
              order: 2,
              estimatedDuration: 180, // 3 hours
              status: TopicStatus.DRAFT,
              contentType: ContentType.VIDEO,
              sections: [
                {
                  id: 'section-3',
                  topicId: 'topic-2',
                  title: 'useState Hook',
                  description: 'Learn how to manage component state with useState',
                  order: 1,
                  estimatedDuration: 60,
                  status: SectionStatus.DRAFT,
                  steps: [
                    {
                      id: 'step-7',
                      sectionId: 'section-3',
                      title: 'Introduction to useState',
                      description: 'Learning the useState hook and how it replaces class component state',
                      content: 'Understanding the useState hook and how it replaces class component state.',
                      order: 1,
                      status: StepStatus.DRAFT,
                      estimatedDuration: 20,
                      interactive: false,
                      attachments: []
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ];

  constructor() {}

  generateTopicContent(request: AIGenerationRequest): Observable<AIGeneratedContent> {
    // Simulate AI generation delay
    const mockContent: AIGeneratedContent = {
      sections: [
        {
          title: `Introduction to ${request.topic}`,
          description: `Basic concepts and overview of ${request.topic}`,
          estimatedDuration: Math.floor(request.estimatedDuration * 0.3),
          steps: [
            {
              title: `What is ${request.topic}?`,
              content: `${request.topic} is an important concept in ${request.subjectArea}. This step will introduce you to the fundamental ideas and principles.`,
              estimatedDuration: Math.floor(request.estimatedDuration * 0.1),
              mediaType: MediaType.VIDEO,
              interactive: false
            },
            {
              title: `Why ${request.topic} Matters`,
              content: `Understanding the importance and real-world applications of ${request.topic} in ${request.subjectArea}.`,
              estimatedDuration: Math.floor(request.estimatedDuration * 0.1),
              mediaType: MediaType.VIDEO,
              interactive: false
            },
            {
              title: 'Quick Quiz',
              content: 'Test your understanding with this interactive quiz.',
              estimatedDuration: Math.floor(request.estimatedDuration * 0.1),
              interactive: true
            }
          ]
        },
        {
          title: `Core Concepts of ${request.topic}`,
          description: `Deep dive into the essential concepts of ${request.topic}`,
          estimatedDuration: Math.floor(request.estimatedDuration * 0.4),
          steps: [
            {
              title: 'Key Principles',
              content: `Learn the fundamental principles that govern ${request.topic}.`,
              estimatedDuration: Math.floor(request.estimatedDuration * 0.15),
              mediaType: MediaType.VIDEO,
              interactive: false
            },
            {
              title: 'Common Patterns',
              content: `Explore common patterns and best practices in ${request.topic}.`,
              estimatedDuration: Math.floor(request.estimatedDuration * 0.15),
              mediaType: MediaType.VIDEO,
              interactive: false
            },
            {
              title: 'Hands-on Exercise',
              content: 'Apply your knowledge with this practical exercise.',
              estimatedDuration: Math.floor(request.estimatedDuration * 0.1),
              interactive: true
            }
          ]
        },
        {
          title: `Advanced ${request.topic}`,
          description: `Advanced topics and real-world applications`,
          estimatedDuration: Math.floor(request.estimatedDuration * 0.3),
          steps: [
            {
              title: 'Advanced Techniques',
              content: `Master advanced techniques and optimization strategies in ${request.topic}.`,
              estimatedDuration: Math.floor(request.estimatedDuration * 0.15),
              mediaType: MediaType.VIDEO,
              interactive: false
            },
            {
              title: 'Real-world Project',
              content: 'Build a real-world project to solidify your understanding.',
              estimatedDuration: Math.floor(request.estimatedDuration * 0.15),
              interactive: true
            }
          ]
        }
      ],
      estimatedDuration: request.estimatedDuration,
      suggestions: [
        `Consider adding more ${request.difficulty.toLowerCase()} level content`,
        `Interactive elements could enhance learning for ${request.targetAudience}`,
        `Additional resources on ${request.subjectArea} would be valuable`
      ]
    };

    return of(mockContent).pipe(delay(2000));
  }

  // Plan Management
  getPlans(): Observable<Plan[]> {
    return of(this.mockPlans).pipe(delay(500));
  }

  getPlan(planId: string): Observable<Plan | null> {
    const plan = this.mockPlans.find(p => p.id === planId) || null;
    return of(plan).pipe(delay(300));
  }

  createPlan(planData: Partial<Plan>): Observable<Plan> {
    const newPlan: Plan = {
      id: 'plan_' + Date.now(),
      title: planData.title || 'Untitled Plan',
      description: planData.description || '',
      status: PlanStatus.DRAFT,
      difficulty: planData.difficulty || DifficultyLevel.BEGINNER,
      estimatedDuration: planData.estimatedDuration || 60,
      subjects: [],
      tags: planData.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'current-user'
    };
    
    this.mockPlans.push(newPlan);
    return of(newPlan).pipe(delay(500));
  }

  updatePlan(planId: string, planData: Partial<Plan>): Observable<Plan> {
    const planIndex = this.mockPlans.findIndex(p => p.id === planId);
    if (planIndex === -1) {
      return throwError(() => new Error('Plan not found'));
    }
    
    this.mockPlans[planIndex] = {
      ...this.mockPlans[planIndex],
      ...planData,
      updatedAt: new Date()
    };
    
    return of(this.mockPlans[planIndex]).pipe(delay(500));
  }

  deletePlan(planId: string): Observable<boolean> {
    const planIndex = this.mockPlans.findIndex(p => p.id === planId);
    if (planIndex === -1) {
      return of(false);
    }
    
    this.mockPlans.splice(planIndex, 1);
    return of(true).pipe(delay(500));
  }

  // Subject Management
  getSubjects(planId: string): Observable<Subject[]> {
    const plan = this.mockPlans.find(p => p.id === planId);
    return of(plan?.subjects || []).pipe(delay(300));
  }

  createSubject(planId: string, subjectData: Partial<Subject>): Observable<Subject> {
    const plan = this.mockPlans.find(p => p.id === planId);
    if (!plan) {
      return throwError(() => new Error('Plan not found'));
    }

    const newSubject: Subject = {
      id: 'subject_' + Date.now(),
      planId: planId,
      title: subjectData.title || 'Untitled Subject',
      description: subjectData.description || '',
      order: plan.subjects.length + 1,
      estimatedDuration: subjectData.estimatedDuration || 60,
      status: SubjectStatus.DRAFT,
      prerequisites: subjectData.prerequisites || [],
      learningObjectives: subjectData.learningObjectives || [],
      topics: []
    };

    plan.subjects.push(newSubject);
    plan.updatedAt = new Date();
    
    return of(newSubject).pipe(delay(500));
  }

  // Topic Management
  getTopics(subjectId: string): Observable<Topic[]> {
    for (const plan of this.mockPlans) {
      const subject = plan.subjects.find(s => s.id === subjectId);
      if (subject) {
        return of(subject.topics).pipe(delay(300));
      }
    }
    return of([]);
  }

  getTopic(topicId: string): Observable<Topic | null> {
    for (const plan of this.mockPlans) {
      for (const subject of plan.subjects) {
        const topic = subject.topics.find(t => t.id === topicId);
        if (topic) {
          return of(topic).pipe(delay(300));
        }
      }
    }
    return of(null);
  }

  createTopic(subjectId: string, topicData: Partial<Topic>): Observable<Topic> {
    for (const plan of this.mockPlans) {
      const subject = plan.subjects.find(s => s.id === subjectId);
      if (subject) {
        const newTopic: Topic = {
          id: 'topic_' + Date.now(),
          subjectId: subjectId,
          title: topicData.title || 'Untitled Topic',
          description: topicData.description || '',
          order: subject.topics.length + 1,
          estimatedDuration: topicData.estimatedDuration || 30,
          status: TopicStatus.DRAFT,
          contentType: topicData.contentType || ContentType.MIXED,
          sections: []
        };

        subject.topics.push(newTopic);
        plan.updatedAt = new Date();
        
        return of(newTopic).pipe(delay(500));
      }
    }
    return throwError(() => new Error('Subject not found'));
  }

  updateTopic(topicId: string, topicData: Partial<Topic>): Observable<Topic> {
    for (const plan of this.mockPlans) {
      for (const subject of plan.subjects) {
        const topicIndex = subject.topics.findIndex(t => t.id === topicId);
        if (topicIndex !== -1) {
          subject.topics[topicIndex] = {
            ...subject.topics[topicIndex],
            ...topicData
          };
          plan.updatedAt = new Date();
          
          return of(subject.topics[topicIndex]).pipe(delay(500));
        }
      }
    }
    return throwError(() => new Error('Topic not found'));
  }

  deleteTopic(topicId: string): Observable<boolean> {
    for (const plan of this.mockPlans) {
      for (const subject of plan.subjects) {
        const topicIndex = subject.topics.findIndex(t => t.id === topicId);
        if (topicIndex !== -1) {
          subject.topics.splice(topicIndex, 1);
          plan.updatedAt = new Date();
          return of(true).pipe(delay(500));
        }
      }
    }
    return of(false);
  }

  reorderTopics(subjectId: string, topics: Topic[]): Observable<Topic[]> {
    for (const plan of this.mockPlans) {
      const subject = plan.subjects.find(s => s.id === subjectId);
      if (subject) {
        // Update order property for each topic
        topics.forEach((topic, index) => {
          topic.order = index + 1;
        });
        
        subject.topics = topics;
        plan.updatedAt = new Date();
        
        return of(subject.topics).pipe(delay(300));
      }
    }
    return throwError(() => new Error('Subject not found'));
  }

  // Section Management
  getSections(topicId: string): Observable<Section[]> {
    for (const plan of this.mockPlans) {
      for (const subject of plan.subjects) {
        const topic = subject.topics.find(t => t.id === topicId);
        if (topic) {
          return of(topic.sections).pipe(delay(300));
        }
      }
    }
    return of([]);
  }

  createSection(topicId: string, sectionData: Partial<Section>): Observable<Section> {
    for (const plan of this.mockPlans) {
      for (const subject of plan.subjects) {
        const topic = subject.topics.find(t => t.id === topicId);
        if (topic) {
          const newSection: Section = {
            id: 'section_' + Date.now(),
            topicId: topicId,
            title: sectionData.title || 'Untitled Section',
            description: sectionData.description || '',
            order: topic.sections.length + 1,
            estimatedDuration: sectionData.estimatedDuration || 15,
            status: SectionStatus.DRAFT,
            steps: []
          };

          topic.sections.push(newSection);
          plan.updatedAt = new Date();
          
          return of(newSection).pipe(delay(500));
        }
      }
    }
    return throwError(() => new Error('Topic not found'));
  }

  updateSection(sectionId: string, sectionData: Partial<Section>): Observable<Section> {
    for (const plan of this.mockPlans) {
      for (const subject of plan.subjects) {
        for (const topic of subject.topics) {
          const sectionIndex = topic.sections.findIndex(s => s.id === sectionId);
          if (sectionIndex !== -1) {
            topic.sections[sectionIndex] = {
              ...topic.sections[sectionIndex],
              ...sectionData
            };
            plan.updatedAt = new Date();
            
            return of(topic.sections[sectionIndex]).pipe(delay(500));
          }
        }
      }
    }
    return throwError(() => new Error('Section not found'));
  }

  deleteSection(sectionId: string): Observable<boolean> {
    for (const plan of this.mockPlans) {
      for (const subject of plan.subjects) {
        for (const topic of subject.topics) {
          const sectionIndex = topic.sections.findIndex(s => s.id === sectionId);
          if (sectionIndex !== -1) {
            topic.sections.splice(sectionIndex, 1);
            plan.updatedAt = new Date();
            return of(true).pipe(delay(500));
          }
        }
      }
    }
    return of(false);
  }

  reorderSections(topicId: string, sections: Section[]): Observable<Section[]> {
    for (const plan of this.mockPlans) {
      for (const subject of plan.subjects) {
        const topic = subject.topics.find(t => t.id === topicId);
        if (topic) {
          // Update order property for each section
          sections.forEach((section, index) => {
            section.order = index + 1;
          });
          
          topic.sections = sections;
          plan.updatedAt = new Date();
          
          return of(topic.sections).pipe(delay(300));
        }
      }
    }
    return throwError(() => new Error('Topic not found'));
  }

  // Step Management
  getSteps(sectionId: string): Observable<Step[]> {
    for (const plan of this.mockPlans) {
      for (const subject of plan.subjects) {
        for (const topic of subject.topics) {
          const section = topic.sections.find(s => s.id === sectionId);
          if (section) {
            return of(section.steps).pipe(delay(300));
          }
        }
      }
    }
    return of([]);
  }

  createStep(sectionId: string, stepData: Partial<Step>): Observable<Step> {
    for (const plan of this.mockPlans) {
      for (const subject of plan.subjects) {
        for (const topic of subject.topics) {
          const section = topic.sections.find(s => s.id === sectionId);
          if (section) {
            const newStep: Step = {
              id: 'step_' + Date.now(),
              sectionId: sectionId,
              title: stepData.title || 'Untitled Step',
              description: stepData.description || '',
              content: stepData.content || '',
              mediaUrl: stepData.mediaUrl,
              mediaType: stepData.mediaType,
              order: section.steps.length + 1,
              status: StepStatus.DRAFT,
              estimatedDuration: stepData.estimatedDuration || 5,
              interactive: stepData.interactive || false,
              quiz: stepData.quiz,
              attachments: stepData.attachments || []
            };

            section.steps.push(newStep);
            plan.updatedAt = new Date();
            
            return of(newStep).pipe(delay(500));
          }
        }
      }
    }
    return throwError(() => new Error('Section not found'));
  }

  updateStep(stepId: string, stepData: Partial<Step>): Observable<Step> {
    for (const plan of this.mockPlans) {
      for (const subject of plan.subjects) {
        for (const topic of subject.topics) {
          for (const section of topic.sections) {
            const stepIndex = section.steps.findIndex(s => s.id === stepId);
            if (stepIndex !== -1) {
              section.steps[stepIndex] = {
                ...section.steps[stepIndex],
                ...stepData
              };
              plan.updatedAt = new Date();
              
              return of(section.steps[stepIndex]).pipe(delay(500));
            }
          }
        }
      }
    }
    return throwError(() => new Error('Step not found'));
  }

  deleteStep(stepId: string): Observable<boolean> {
    for (const plan of this.mockPlans) {
      for (const subject of plan.subjects) {
        for (const topic of subject.topics) {
          for (const section of topic.sections) {
            const stepIndex = section.steps.findIndex(s => s.id === stepId);
            if (stepIndex !== -1) {
              section.steps.splice(stepIndex, 1);
              plan.updatedAt = new Date();
              return of(true).pipe(delay(500));
            }
          }
        }
      }
    }
    return of(false);
  }

  reorderSteps(sectionId: string, steps: Step[]): Observable<Step[]> {
    for (const plan of this.mockPlans) {
      for (const subject of plan.subjects) {
        for (const topic of subject.topics) {
          const section = topic.sections.find(s => s.id === sectionId);
          if (section) {
            // Update order property for each step
            steps.forEach((step, index) => {
              step.order = index + 1;
            });
            
            section.steps = steps;
            plan.updatedAt = new Date();
            
            return of(section.steps).pipe(delay(300));
          }
        }
      }
    }
    return throwError(() => new Error('Section not found'));
  }
} 