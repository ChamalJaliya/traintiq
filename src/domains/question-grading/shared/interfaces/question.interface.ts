export enum QuestionType {
    TEXT_INPUT = 'text_input',
    MCQ = 'mcq',
    TRUE_FALSE = 'true_false',
    FILE_UPLOAD = 'file_upload',
    SCHEDULE_CALL = 'schedule_call'
}

export enum MeetingPlatform {
    ZOOM = 'zoom',
    GOOGLE_MEET = 'google_meet',
    MICROSOFT_TEAMS = 'microsoft_teams'
}

export interface Question {
    id: string;
    type: QuestionType;
    text: string;
    correctAnswer?: string;
    options?: string[];
    correctOptionIndex?: number;
    isTrue?: boolean;
    category?: string;
    points: number;
    timeLimit?: number;
    // File upload specific fields
    submissionDeadline?: Date;
    maxFileSize?: number; // in MB
    allowedFileTypes?: string[];
    // Schedule call specific fields
    meetingPlatform?: MeetingPlatform;
    meetingDuration?: number; // in minutes
    availableSlots?: TimeSlot[];
    createdAt: Date;
    updatedAt: Date;
}

export interface TimeSlot {
    id: string;
    date: string;
    time: string;
    isAvailable: boolean;
}

export interface QuestionAnswer {
    questionId: string;
    userAnswer: string;
    selectedOptionIndex?: number;
    selectedBoolean?: boolean;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    uploadedAt?: Date;
    callScheduled?: boolean;
    selectedTimeSlot?: TimeSlot;
    meetingLink?: string;
    similarityScore?: number;
    isCorrect?: boolean;
    points: number;
    submittedAt: Date;
    needsManualReview: boolean;
}

export interface Quiz {
    id: string;
    title: string;
    description: string;
    questions: Question[];
    totalPoints: number;
    timeLimit: number;
    createdAt: Date;
}

export interface QuizResult {
    quizId: string;
    answers: QuestionAnswer[];
    totalScore: number;
    totalPossibleScore: number;
    percentage: number;
    completedAt: Date;
    timeTaken: number;
} 