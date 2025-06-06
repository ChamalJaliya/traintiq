import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { QuestionGradingService } from '../../../../shared/services/question-grading.service';
import { Question, QuestionAnswer } from '../../../../shared/interfaces/question.interface';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, interval, takeUntil } from 'rxjs';

const QUESTION_TIME_LIMIT = 120; // 2 minutes in seconds

@Component({
    selector: 'app-question-answering',
    templateUrl: './question-answering.component.html',
    styleUrls: ['./question-answering.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        MatIconModule,
        MatTooltipModule
    ]
})
export class QuestionAnsweringComponent implements OnInit, OnDestroy {
    currentQuestion: Question | null = null;
    answerForm: FormGroup;
    lastSubmission: QuestionAnswer | null = null;
    loading = false;
    timeLeft = QUESTION_TIME_LIMIT;
    isTimeUp = false;
    private destroy$ = new Subject<void>();

    constructor(
        private questionService: QuestionGradingService,
        private fb: FormBuilder,
        private snackBar: MatSnackBar
    ) {
        this.answerForm = this.fb.group({
            answer: ['', [Validators.required, Validators.minLength(2)]]
        });
    }

    ngOnInit() {
        this.loadRandomQuestion();
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadRandomQuestion() {
        this.loading = true;
        this.lastSubmission = null;
        this.answerForm.reset();
        this.isTimeUp = false;
        
        this.questionService.getRandomQuestion().subscribe({
            next: (question) => {
                this.currentQuestion = question;
                this.loading = false;
                this.startTimer();
            },
            error: (error) => {
                this.snackBar.open('Error loading question!', 'Close', {
                    duration: 3000
                });
                this.loading = false;
            }
        });
    }

    private startTimer() {
        this.timeLeft = QUESTION_TIME_LIMIT;
        this.isTimeUp = false;

        // Clear any existing timer
        this.destroy$.next();

        // Start new timer
        interval(1000)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                if (this.timeLeft > 0) {
                    this.timeLeft--;
                } else {
                    this.isTimeUp = true;
                    this.answerForm.disable();
                }
            });
    }

    onSubmit() {
        if (this.answerForm.valid && this.currentQuestion && !this.isTimeUp) {
            this.loading = true;
            const userAnswer = this.answerForm.get('answer')?.value;

            this.questionService.submitAnswer(this.currentQuestion.id, userAnswer).subscribe({
                next: (result) => {
                    this.lastSubmission = result;
                    this.loading = false;
                    this.destroy$.next(); // Stop the timer
                },
                error: (error) => {
                    this.snackBar.open('Error submitting answer!', 'Close', {
                        duration: 3000
                    });
                    this.loading = false;
                }
            });
        }
    }

    getScoreColor(score: number): string {
        if (score >= 90) return '#2e7d32'; // green
        if (score >= 70) return '#f57c00'; // orange
        return '#c62828'; // red
    }

    getCategoryIcon(category: string | undefined): string {
        if (!category) return 'help_outline';
        
        const categoryMap: { [key: string]: string } = {
            'Programming': 'code',
            'Mathematics': 'functions',
            'Science': 'science',
            'History': 'history_edu',
            'Geography': 'public',
            'Literature': 'menu_book',
            'Art': 'palette',
            'Music': 'music_note',
            'Sports': 'sports',
            'Technology': 'computer',
            'Languages': 'translate',
            'Business': 'business',
            'Physics': 'bolt',
            'Chemistry': 'science',
            'Biology': 'biotech'
        };

        return categoryMap[category] || 'label';
    }
} 