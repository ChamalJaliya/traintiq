export interface Plan {
  id: string;
  title: string;
  description: string;
  subjects: Subject[];
  createdAt: Date;
  updatedAt: Date;
  status: PlanStatus;
  createdBy: string;
  tags: string[];
  estimatedDuration: number; // in minutes
  difficulty: DifficultyLevel;
}

export interface Subject {
  id: string;
  planId: string;
  title: string;
  description: string;
  topics: Topic[];
  order: number;
  status: SubjectStatus;
  estimatedDuration: number; // in minutes
  prerequisites: string[];
  learningObjectives: string[];
}

export interface Topic {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  sections: Section[];
  order: number;
  status: TopicStatus;
  estimatedDuration: number; // in minutes
  contentType: ContentType;
}

export interface Section {
  id: string;
  topicId: string;
  title: string;
  description: string;
  steps: Step[];
  order: number;
  status: SectionStatus;
  estimatedDuration: number; // in minutes
}

export interface Step {
  id: string;
  sectionId: string;
  title: string;
  description: string;
  content: string;
  mediaUrl?: string;
  mediaType?: MediaType;
  order: number;
  status: StepStatus;
  estimatedDuration: number; // in minutes
  interactive: boolean;
  quiz?: Quiz;
  attachments: Attachment[];
}

export interface Quiz {
  id: string;
  stepId: string;
  questions: Question[];
  passingScore: number;
  maxAttempts: number;
}

export interface Question {
  id: string;
  question: string;
  type: QuestionType;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  points: number;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: AttachmentType;
  size: number;
}

export interface AIGenerationRequest {
  topic: string;
  subjectArea: string;
  targetAudience: string;
  difficulty: DifficultyLevel;
  estimatedDuration: number;
  learningObjectives: string[];
  contentType: ContentType;
}

export interface AIGeneratedContent {
  sections: GeneratedSection[];
  estimatedDuration: number;
  suggestions: string[];
}

export interface GeneratedSection {
  title: string;
  description: string;
  steps: GeneratedStep[];
  estimatedDuration: number;
}

export interface GeneratedStep {
  title: string;
  content: string;
  estimatedDuration: number;
  mediaType?: MediaType;
  interactive: boolean;
}

export interface ContentFilter {
  status?: PlanStatus | SubjectStatus | TopicStatus;
  difficulty?: DifficultyLevel;
  contentType?: ContentType;
  createdBy?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
  searchQuery?: string;
}

export interface DragDropData {
  itemId: string;
  itemType: 'plan' | 'subject' | 'topic' | 'section' | 'step';
  sourceIndex: number;
  targetIndex: number;
  sourceContainer: string;
  targetContainer: string;
}

// Enums
export enum PlanStatus {
  DRAFT = 'draft',
  REVIEW = 'review',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export enum SubjectStatus {
  DRAFT = 'draft',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REVIEW = 'review'
}

export enum TopicStatus {
  DRAFT = 'draft',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REVIEW = 'review'
}

export enum SectionStatus {
  DRAFT = 'draft',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

export enum StepStatus {
  DRAFT = 'draft',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export enum ContentType {
  VIDEO = 'video',
  TEXT = 'text',
  INTERACTIVE = 'interactive',
  MIXED = 'mixed',
  HANDS_ON = 'hands_on'
}

export enum MediaType {
  VIDEO = 'video',
  AUDIO = 'audio',
  IMAGE = 'image',
  DOCUMENT = 'document',
  PRESENTATION = 'presentation'
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  SHORT_ANSWER = 'short_answer',
  ESSAY = 'essay',
  FILL_IN_BLANK = 'fill_in_blank'
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