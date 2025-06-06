import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { QuestionGradingService } from '../../../../shared/services/question-grading.service';
import { Question } from '../../../../shared/interfaces/question.interface';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-question-creator',
    templateUrl: './question-creator.component.html',
    styleUrls: ['./question-creator.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatListModule,
        MatIconModule,
        MatTooltipModule
    ]
})
export class QuestionCreatorComponent {
    questionForm: FormGroup;
    questions: Question[] = [];

    constructor(
        private fb: FormBuilder,
        private questionService: QuestionGradingService,
        private snackBar: MatSnackBar
    ) {
        this.questionForm = this.fb.group({
            text: ['', [Validators.required, Validators.minLength(10)]],
            correctAnswer: ['', [Validators.required, Validators.minLength(2)]],
            category: ['']
        });
        this.loadQuestions();
    }

    private loadQuestions() {
        this.questionService.getQuestions().subscribe(questions => {
            this.questions = questions;
        });
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

    onSubmit() {
        if (this.questionForm.valid) {
            const newQuestion = {
                ...this.questionForm.value,
                createdAt: new Date()
            };
            
            this.questionService.addQuestion(newQuestion).subscribe({
                next: (question) => {
                    this.snackBar.open('Question added successfully!', 'Close', {
                        duration: 3000
                    });
                    this.questionForm.reset();
                    this.loadQuestions();
                },
                error: (error) => {
                    this.snackBar.open('Error adding question!', 'Close', {
                        duration: 3000
                    });
                }
            });
        }
    }
} 