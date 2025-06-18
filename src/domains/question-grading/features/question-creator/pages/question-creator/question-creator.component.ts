import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { QuestionGradingService } from '../../../../shared/services/question-grading.service';
import { Question, QuestionType, MeetingPlatform } from '../../../../shared/interfaces/question.interface';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatRadioModule } from '@angular/material/radio';

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
        MatTooltipModule,
        MatSelectModule,
        MatCheckboxModule,
        MatChipsModule,
        MatRadioModule
    ]
})
export class QuestionCreatorComponent {
    questionForm: FormGroup;
    questions: Question[] = [];
    
    // Enum reference for template
    QuestionType = QuestionType;
    MeetingPlatform = MeetingPlatform;
    
    questionTypes = [
        { value: QuestionType.TEXT_INPUT, label: 'Text Input', icon: 'edit' },
        { value: QuestionType.MCQ, label: 'Multiple Choice', icon: 'radio_button_checked' },
        { value: QuestionType.TRUE_FALSE, label: 'True or False', icon: 'check_circle' },
        { value: QuestionType.FILE_UPLOAD, label: 'File Upload', icon: 'cloud_upload' },
        { value: QuestionType.SCHEDULE_CALL, label: 'Schedule Call', icon: 'video_call' }
    ];

    constructor(
        private fb: FormBuilder,
        private questionService: QuestionGradingService,
        private snackBar: MatSnackBar
    ) {
        this.questionForm = this.createForm();
        this.loadQuestions();
    }

    private createForm(): FormGroup {
        return this.fb.group({
            type: [QuestionType.TEXT_INPUT, Validators.required],
            text: ['', [Validators.required, Validators.minLength(10)]],
            category: [''],
            points: [5, [Validators.required, Validators.min(1)]],
            timeLimit: [60, [Validators.min(0)]],
            
            // Text Input fields
            correctAnswer: [''],
            
            // MCQ fields
            options: this.fb.array([]),
            correctOptionIndex: [0],
            
            // True/False fields
            isTrue: [true],
            
            // File Upload fields
            submissionDeadline: [''],
            maxFileSize: [10, [Validators.min(1), Validators.max(100)]],
            allowedFileTypes: [['pdf', 'doc', 'docx', 'txt']],
            
            // Schedule Call fields
            meetingPlatform: [MeetingPlatform.ZOOM],
            meetingDuration: [30, [Validators.min(15), Validators.max(120)]]
        });
    }

    get optionsArray(): FormArray {
        return this.questionForm.get('options') as FormArray;
    }

    onQuestionTypeChange(type: QuestionType) {
        this.questionForm.patchValue({ type });
        this.updateValidators(type);
        this.setupFormForType(type);
    }

    private updateValidators(type: QuestionType) {
        const correctAnswerControl = this.questionForm.get('correctAnswer');
        const optionsControl = this.questionForm.get('options');
        const correctOptionIndexControl = this.questionForm.get('correctOptionIndex');
        const isTrueControl = this.questionForm.get('isTrue');
        const submissionDeadlineControl = this.questionForm.get('submissionDeadline');
        const meetingPlatformControl = this.questionForm.get('meetingPlatform');

        // Clear existing validators
        correctAnswerControl?.clearValidators();
        correctOptionIndexControl?.clearValidators();
        isTrueControl?.clearValidators();
        submissionDeadlineControl?.clearValidators();
        meetingPlatformControl?.clearValidators();

        switch (type) {
            case QuestionType.TEXT_INPUT:
                correctAnswerControl?.setValidators([Validators.required, Validators.minLength(5)]);
                break;
            case QuestionType.MCQ:
                correctOptionIndexControl?.setValidators([Validators.required, Validators.min(0)]);
                break;
            case QuestionType.TRUE_FALSE:
                isTrueControl?.setValidators([Validators.required]);
                break;
            case QuestionType.FILE_UPLOAD:
                submissionDeadlineControl?.setValidators([Validators.required]);
                break;
            case QuestionType.SCHEDULE_CALL:
                meetingPlatformControl?.setValidators([Validators.required]);
                break;
        }

        correctAnswerControl?.updateValueAndValidity();
        correctOptionIndexControl?.updateValueAndValidity();
        isTrueControl?.updateValueAndValidity();
        submissionDeadlineControl?.updateValueAndValidity();
        meetingPlatformControl?.updateValueAndValidity();
    }

    private setupFormForType(type: QuestionType) {
        if (type === QuestionType.MCQ) {
            // Initialize with 4 options if empty
            if (this.optionsArray.length === 0) {
                for (let i = 0; i < 4; i++) {
                    this.addOption();
                }
            }
        }
    }

    addOption() {
        const optionControl = this.fb.control('', [Validators.required, Validators.minLength(1)]);
        this.optionsArray.push(optionControl);
    }

    removeOption(index: number) {
        if (this.optionsArray.length > 2) { // Keep at least 2 options
            this.optionsArray.removeAt(index);
            
            // Adjust correct option index if necessary
            const correctIndex = this.questionForm.get('correctOptionIndex')?.value;
            if (correctIndex >= index && correctIndex > 0) {
                this.questionForm.patchValue({ correctOptionIndex: correctIndex - 1 });
            }
        }
    }

    private loadQuestions() {
        this.questionService.getQuestions().subscribe(questions => {
            this.questions = questions;
        });
    }

    getQuestionTypeIcon(type: QuestionType): string {
        const iconMap = {
            [QuestionType.TEXT_INPUT]: 'edit',
            [QuestionType.MCQ]: 'radio_button_checked',
            [QuestionType.TRUE_FALSE]: 'check_circle',
            [QuestionType.FILE_UPLOAD]: 'cloud_upload',
            [QuestionType.SCHEDULE_CALL]: 'video_call'
        };
        return iconMap[type] || 'help';
    }

    getQuestionTypeLabel(type: QuestionType): string {
        const labelMap = {
            [QuestionType.TEXT_INPUT]: 'Text Input',
            [QuestionType.MCQ]: 'Multiple Choice',
            [QuestionType.TRUE_FALSE]: 'True or False',
            [QuestionType.FILE_UPLOAD]: 'File Upload',
            [QuestionType.SCHEDULE_CALL]: 'Schedule Call'
        };
        return labelMap[type] || 'Unknown';
    }

    getMeetingPlatformLabel(platform: MeetingPlatform): string {
        const platformMap = {
            [MeetingPlatform.ZOOM]: 'Zoom',
            [MeetingPlatform.GOOGLE_MEET]: 'Google Meet',
            [MeetingPlatform.MICROSOFT_TEAMS]: 'Microsoft Teams'
        };
        return platformMap[platform] || 'Unknown Platform';
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
            'Biology': 'biotech',
            'Design': 'design_services'
        };

        return categoryMap[category] || 'label';
    }

    onSubmit() {
        if (this.questionForm.valid) {
            const formData = this.questionForm.value;
            
            // Prepare question data based on type
            const questionData: Omit<Question, 'id' | 'createdAt' | 'updatedAt'> = {
                type: formData.type,
                text: formData.text,
                category: formData.category || undefined,
                points: formData.points,
                timeLimit: formData.timeLimit || undefined
            };

            // Add type-specific fields
            switch (formData.type) {
                case QuestionType.TEXT_INPUT:
                    questionData.correctAnswer = formData.correctAnswer;
                    break;
                case QuestionType.MCQ:
                    questionData.options = this.optionsArray.value;
                    questionData.correctOptionIndex = formData.correctOptionIndex;
                    break;
                case QuestionType.TRUE_FALSE:
                    questionData.isTrue = formData.isTrue;
                    break;
                case QuestionType.FILE_UPLOAD:
                    questionData.submissionDeadline = formData.submissionDeadline ? new Date(formData.submissionDeadline) : undefined;
                    questionData.maxFileSize = formData.maxFileSize;
                    questionData.allowedFileTypes = formData.allowedFileTypes;
                    break;
                case QuestionType.SCHEDULE_CALL:
                    questionData.meetingPlatform = formData.meetingPlatform;
                    questionData.meetingDuration = formData.meetingDuration;
                    break;
            }

            this.questionService.addQuestion(questionData).subscribe({
                next: (question) => {
                    this.questions.push(question);
                    this.questionForm.reset();
                    this.questionForm.patchValue({
                        type: QuestionType.TEXT_INPUT,
                        points: 5,
                        timeLimit: 60,
                        maxFileSize: 10,
                        allowedFileTypes: ['pdf', 'doc', 'docx', 'txt'],
                        meetingPlatform: MeetingPlatform.ZOOM,
                        meetingDuration: 30,
                        isTrue: true
                    });
                    
                    // Clear options array
                    while (this.optionsArray.length !== 0) {
                        this.optionsArray.removeAt(0);
                    }
                    
                    this.snackBar.open('Question added successfully!', 'Close', {
                        duration: 3000
                    });
                },
                error: (error) => {
                    this.snackBar.open('Error adding question!', 'Close', {
                        duration: 3000
                    });
                }
            });
        }
    }

    generateRandomQuiz() {
        this.questionService.generateRandomQuiz('Random Assessment', 'A randomly generated quiz from the question pool').subscribe({
            next: (quiz) => {
                this.snackBar.open(`Generated quiz with ${quiz.questions.length} questions!`, 'Close', {
                    duration: 3000
                });
            },
            error: (error) => {
                this.snackBar.open('Error generating quiz!', 'Close', {
                    duration: 3000
                });
            }
        });
    }
} 