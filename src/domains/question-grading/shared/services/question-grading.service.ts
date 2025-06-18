import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Question, QuestionAnswer, QuestionType, Quiz, QuizResult } from '../interfaces/question.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
    providedIn: 'root'
})
export class QuestionGradingService {
    private questions: Question[] = [];
    private quizzes: Quiz[] = [];

    constructor() {
        // Add mock questions pool of 15 questions
        this.addMockQuestions();
    }

    private addMockQuestions() {
        const mockQuestions: Question[] = [
            // Text Input Questions (3)
            {
                id: uuidv4(),
                type: QuestionType.TEXT_INPUT,
                text: 'Explain the concept of Object-Oriented Programming and its main principles.',
                correctAnswer: 'Object-Oriented Programming is a programming paradigm based on objects that contain data and code. Its main principles are encapsulation, inheritance, polymorphism, and abstraction.',
                category: 'Programming',
                points: 10,
                timeLimit: 300,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: uuidv4(),
                type: QuestionType.TEXT_INPUT,
                text: 'What are the benefits of using cloud computing for businesses?',
                correctAnswer: 'Cloud computing offers scalability, cost-effectiveness, flexibility, automatic updates, disaster recovery, and accessibility from anywhere.',
                category: 'Technology',
                points: 8,
                timeLimit: 240,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: uuidv4(),
                type: QuestionType.TEXT_INPUT,
                text: 'Describe the importance of user experience (UX) in web design.',
                correctAnswer: 'UX is crucial as it determines how users interact with a website, affecting usability, satisfaction, accessibility, and ultimately business success.',
                category: 'Design',
                points: 8,
                timeLimit: 240,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            // MCQ Questions (6)
            {
                id: uuidv4(),
                type: QuestionType.MCQ,
                text: 'Which of the following is NOT a JavaScript data type?',
                options: ['String', 'Boolean', 'Float', 'Symbol'],
                correctOptionIndex: 2,
                category: 'Programming',
                points: 5,
                timeLimit: 60,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: uuidv4(),
                type: QuestionType.MCQ,
                text: 'What does HTML stand for?',
                options: ['Hyper Text Markup Language', 'Home Tool Markup Language', 'Hyperlinks and Text Markup Language', 'Hyperlinking Text Management Language'],
                correctOptionIndex: 0,
                category: 'Web Development',
                points: 3,
                timeLimit: 45,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: uuidv4(),
                type: QuestionType.MCQ,
                text: 'Which HTTP status code indicates a successful response?',
                options: ['404', '500', '200', '301'],
                correctOptionIndex: 2,
                category: 'Web Development',
                points: 4,
                timeLimit: 30,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: uuidv4(),
                type: QuestionType.MCQ,
                text: 'What is the primary purpose of CSS?',
                options: ['Structure content', 'Style and layout', 'Add interactivity', 'Database management'],
                correctOptionIndex: 1,
                category: 'Web Development',
                points: 3,
                timeLimit: 30,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: uuidv4(),
                type: QuestionType.MCQ,
                text: 'Which of these is a NoSQL database?',
                options: ['MySQL', 'PostgreSQL', 'MongoDB', 'SQLite'],
                correctOptionIndex: 2,
                category: 'Database',
                points: 4,
                timeLimit: 45,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: uuidv4(),
                type: QuestionType.MCQ,
                text: 'What does API stand for?',
                options: ['Application Program Interface', 'Automated Program Integration', 'Advanced Programming Interface', 'Application Protocol Interface'],
                correctOptionIndex: 0,
                category: 'Technology',
                points: 3,
                timeLimit: 30,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            // True/False Questions (4)
            {
                id: uuidv4(),
                type: QuestionType.TRUE_FALSE,
                text: 'JavaScript is a compiled programming language.',
                isTrue: false,
                category: 'Programming',
                points: 2,
                timeLimit: 30,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: uuidv4(),
                type: QuestionType.TRUE_FALSE,
                text: 'CSS Grid is better than Flexbox for one-dimensional layouts.',
                isTrue: false,
                category: 'Web Development',
                points: 3,
                timeLimit: 45,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: uuidv4(),
                type: QuestionType.TRUE_FALSE,
                text: 'RESTful APIs use HTTP methods like GET, POST, PUT, and DELETE.',
                isTrue: true,
                category: 'Technology',
                points: 2,
                timeLimit: 30,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: uuidv4(),
                type: QuestionType.TRUE_FALSE,
                text: 'Version control systems like Git only track code changes.',
                isTrue: false,
                category: 'Development Tools',
                points: 3,
                timeLimit: 45,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            // File Upload Questions (1)
            {
                id: uuidv4(),
                type: QuestionType.FILE_UPLOAD,
                text: 'Upload a code sample demonstrating a responsive web layout using CSS Grid or Flexbox. Include comments explaining your approach.',
                category: 'Practical Assessment',
                points: 15,
                timeLimit: 1800, // 30 minutes
                createdAt: new Date(),
                updatedAt: new Date()
            },
            // Schedule Call Questions (1)
            {
                id: uuidv4(),
                type: QuestionType.SCHEDULE_CALL,
                text: 'Schedule a technical interview to discuss your experience with modern web frameworks and your approach to solving complex programming challenges.',
                category: 'Technical Interview',
                points: 20,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];
        this.questions = mockQuestions;
    }

    getQuestions(): Observable<Question[]> {
        return of(this.questions);
    }

    getQuestionsByType(type: QuestionType): Observable<Question[]> {
        const filteredQuestions = this.questions.filter(q => q.type === type);
        return of(filteredQuestions);
    }

    getRandomQuestion(): Observable<Question> {
        const randomIndex = Math.floor(Math.random() * this.questions.length);
        return of(this.questions[randomIndex]);
    }

    generateRandomQuiz(title: string = 'Random Quiz', description: string = 'A randomly generated quiz'): Observable<Quiz> {
        // Shuffle questions and take first 5
        const shuffledQuestions = [...this.questions].sort(() => Math.random() - 0.5);
        const selectedQuestions = shuffledQuestions.slice(0, 5);
        
        const totalPoints = selectedQuestions.reduce((sum, q) => sum + q.points, 0);
        const totalTimeLimit = selectedQuestions.reduce((sum, q) => sum + (q.timeLimit || 0), 0);

        const quiz: Quiz = {
            id: uuidv4(),
            title,
            description,
            questions: selectedQuestions,
            totalPoints,
            timeLimit: Math.ceil(totalTimeLimit / 60), // Convert to minutes
            createdAt: new Date()
        };

        this.quizzes.push(quiz);
        return of(quiz);
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
        // Simple similarity calculation for text answers
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

    submitAnswer(questionId: string, userAnswer: string, selectedOptionIndex?: number, selectedBoolean?: boolean, fileUrl?: string, callScheduled?: boolean): Observable<QuestionAnswer> {
        const question = this.questions.find(q => q.id === questionId);
        if (!question) {
            throw new Error('Question not found');
        }

        let isCorrect = false;
        let similarityScore: number | undefined;
        let points = 0;

        // Calculate score based on question type
        switch (question.type) {
            case QuestionType.MCQ:
                isCorrect = selectedOptionIndex === question.correctOptionIndex;
                points = isCorrect ? question.points : 0;
                break;

            case QuestionType.TRUE_FALSE:
                isCorrect = selectedBoolean === question.isTrue;
                points = isCorrect ? question.points : 0;
                break;

            case QuestionType.TEXT_INPUT:
                if (question.correctAnswer) {
                    similarityScore = this.calculateSimilarity(question.correctAnswer, userAnswer);
                    points = Math.round((similarityScore / 100) * question.points);
                }
                break;

            case QuestionType.FILE_UPLOAD:
            case QuestionType.SCHEDULE_CALL:
                // These need manual review
                points = 0; // Will be awarded after review
                break;
        }

        const answer: QuestionAnswer = {
            questionId,
            userAnswer,
            selectedOptionIndex,
            selectedBoolean,
            fileUrl,
            callScheduled,
            similarityScore,
            isCorrect,
            points,
            submittedAt: new Date(),
            needsManualReview: question.type === QuestionType.FILE_UPLOAD || question.type === QuestionType.SCHEDULE_CALL
        };

        return of(answer);
    }

    calculateQuizResult(answers: QuestionAnswer[]): QuizResult {
        const totalScore = answers.reduce((sum, answer) => sum + answer.points, 0);
        const totalPossibleScore = answers.reduce((sum, answer) => {
            const question = this.questions.find(q => q.id === answer.questionId);
            return sum + (question?.points || 0);
        }, 0);

        const percentage = totalPossibleScore > 0 ? (totalScore / totalPossibleScore) * 100 : 0;

        return {
            quizId: uuidv4(),
            answers,
            totalScore,
            totalPossibleScore,
            percentage: Math.round(percentage),
            completedAt: new Date(),
            timeTaken: 0 // This would be calculated by the component
        };
    }

    getQuizzes(): Observable<Quiz[]> {
        return of(this.quizzes);
    }
} 