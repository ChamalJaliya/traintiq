export interface Question {
    id: string;
    text: string;
    correctAnswer: string;
    category?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface QuestionAnswer {
    questionId: string;
    userAnswer: string;
    similarityScore: number;
    submittedAt: Date;
} 