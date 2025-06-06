import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Question, QuestionAnswer } from '../interfaces/question.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
    providedIn: 'root'
})
export class QuestionGradingService {
    private questions: Question[] = [];

    constructor() {
        // Add some mock questions
        this.addMockQuestions();
    }

    private addMockQuestions() {
        const mockQuestions: Question[] = [
            {
                id: uuidv4(),
                text: 'What is the capital of France?',
                correctAnswer: 'Paris',
                category: 'Geography',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: uuidv4(),
                text: 'Explain the concept of Object-Oriented Programming.',
                correctAnswer: 'Object-Oriented Programming is a programming paradigm based on objects that contain data and code. It uses concepts like classes, objects, inheritance, and polymorphism to organize and structure code.',
                category: 'Programming',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];
        this.questions = mockQuestions;
    }

    getQuestions(): Observable<Question[]> {
        return of(this.questions);
    }

    getRandomQuestion(): Observable<Question> {
        const randomIndex = Math.floor(Math.random() * this.questions.length);
        return of(this.questions[randomIndex]);
    }

    addQuestion(question: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>): Observable<Question> {
        const newQuestion: Question = {
            ...question,
            id: uuidv4(),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.questions.push(newQuestion);
        return of(newQuestion);
    }

    calculateSimilarity(answer1: string, answer2: string): number {
        // Simple similarity calculation (mock implementation)
        // In a real application, you would want to use more sophisticated algorithms
        // like Levenshtein distance or natural language processing
        const normalizedAnswer1 = answer1.toLowerCase().trim();
        const normalizedAnswer2 = answer2.toLowerCase().trim();

        if (normalizedAnswer1 === normalizedAnswer2) {
            return 100;
        }

        // Simple word matching
        const words1 = normalizedAnswer1.split(/\s+/);
        const words2 = normalizedAnswer2.split(/\s+/);
        
        const commonWords = words1.filter(word => words2.includes(word));
        const similarityScore = (commonWords.length * 2) / (words1.length + words2.length) * 100;
        
        return Math.round(similarityScore);
    }

    submitAnswer(questionId: string, userAnswer: string): Observable<QuestionAnswer> {
        const question = this.questions.find(q => q.id === questionId);
        if (!question) {
            throw new Error('Question not found');
        }

        const similarityScore = this.calculateSimilarity(question.correctAnswer, userAnswer);
        const answer: QuestionAnswer = {
            questionId,
            userAnswer,
            similarityScore,
            submittedAt: new Date()
        };

        return of(answer);
    }
} 