import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatRadioModule } from '@angular/material/radio';
import { QuestionGradingService } from '../../../../shared/services/question-grading.service';
import { Question, QuestionAnswer, QuestionType, MeetingPlatform, TimeSlot } from '../../../../shared/interfaces/question.interface';
import { Subscription, interval } from 'rxjs';

@Component({
    selector: 'app-question-answering',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatChipsModule,
        MatRadioModule
    ],
    templateUrl: './question-answering.component.html',
    styleUrls: ['./question-answering.component.scss']
})
export class QuestionAnsweringComponent implements OnInit, OnDestroy {
    // Quiz state
    quizStarted = false;
    quizCompleted = false;
    currentQuestionIndex = -1;
    quizQuestions: Question[] = [];
    currentQuestion: Question | null = null;
    quizAnswers: QuestionAnswer[] = [];
    totalQuestions = 0;
    loading = false;
    
    // Timer
    timeLeft = 0;
    private timerSubscription?: Subscription;
    private quizStartTime?: Date;
    
    // Current answer state
    currentAnswer = '';
    selectedOption = -1;
    trueFalseAnswer: boolean | null = null;
    uploadedFile: File | null = null;
    selectedTimeSlot = -1;
    dragOver = false;

    private questionsSubscription?: Subscription;

    // Expose enums to template
    QuestionType = QuestionType;
    MeetingPlatform = MeetingPlatform;

    constructor(private questionService: QuestionGradingService) {}

    ngOnInit() {
        this.loadQuestions();
    }

    ngOnDestroy() {
        this.questionsSubscription?.unsubscribe();
        this.timerSubscription?.unsubscribe();
    }

    private loadQuestions() {
        this.questionsSubscription = this.questionService.getQuestions().subscribe(questions => {
            this.quizQuestions = questions;
            this.totalQuestions = questions.length;
        });
    }

    // Quiz flow methods
    startQuiz() {
        if (this.quizQuestions.length === 0) return;
        
        this.quizStarted = true;
        this.quizCompleted = false;
        this.currentQuestionIndex = 0;
        this.quizAnswers = [];
        this.quizStartTime = new Date();
        this.loadCurrentQuestion();
    }

    private loadCurrentQuestion() {
        if (this.currentQuestionIndex >= 0 && this.currentQuestionIndex < this.quizQuestions.length) {
            this.currentQuestion = this.quizQuestions[this.currentQuestionIndex];
            this.resetCurrentAnswer();
            this.startTimer();
        }
    }

    private resetCurrentAnswer() {
        this.currentAnswer = '';
        this.selectedOption = -1;
        this.trueFalseAnswer = null;
        this.uploadedFile = null;
        this.selectedTimeSlot = -1;
    }

    private startTimer() {
        this.timerSubscription?.unsubscribe();
        
        if (this.currentQuestion?.timeLimit) {
            this.timeLeft = this.currentQuestion.timeLimit;
            this.timerSubscription = interval(1000).subscribe(() => {
                this.timeLeft--;
                if (this.timeLeft <= 0) {
                    this.timerSubscription?.unsubscribe();
                    this.submitCurrentAnswer(); // Auto-submit when time runs out
                }
            });
        } else {
            this.timeLeft = 0;
        }
    }

    // Progress and navigation
    getProgressPercentage(): number {
        if (this.quizQuestions.length === 0) return 0;
        return ((this.currentQuestionIndex + 1) / this.quizQuestions.length) * 100;
    }

    isLastQuestion(): boolean {
        return this.currentQuestionIndex === this.quizQuestions.length - 1;
    }

    skipQuestion() {
        this.nextQuestion();
    }

    private nextQuestion() {
        this.timerSubscription?.unsubscribe();
        
        if (this.isLastQuestion()) {
            this.completeQuiz();
        } else {
            this.currentQuestionIndex++;
            this.loadCurrentQuestion();
        }
    }

    private completeQuiz() {
        this.quizCompleted = true;
        this.quizStarted = false;
        this.currentQuestion = null;
        this.timerSubscription?.unsubscribe();
    }

    // Answer validation and submission
    canSubmitCurrentAnswer(): boolean {
        if (!this.currentQuestion) return false;

        switch (this.currentQuestion.type) {
            case QuestionType.TEXT_INPUT:
                return this.currentAnswer.trim().length > 0;
            case QuestionType.MCQ:
                return this.selectedOption >= 0;
            case QuestionType.TRUE_FALSE:
                return this.trueFalseAnswer !== null;
            case QuestionType.FILE_UPLOAD:
                if (this.currentQuestion.submissionDeadline && this.isDeadlineExpired(this.currentQuestion.submissionDeadline)) {
                    return false;
                }
                return this.uploadedFile !== null;
            case QuestionType.SCHEDULE_CALL:
                return this.selectedTimeSlot >= 0;
            default:
                return false;
        }
    }

    submitCurrentAnswer() {
        if (!this.currentQuestion || !this.canSubmitCurrentAnswer()) {
            this.nextQuestion();
            return;
        }

        this.loading = true;
        this.timerSubscription?.unsubscribe();

        let userAnswer = '';
        let selectedOptionIndex: number | undefined;
        let selectedBoolean: boolean | undefined;
        let fileName: string | undefined;

        switch (this.currentQuestion.type) {
            case QuestionType.TEXT_INPUT:
                userAnswer = this.currentAnswer;
                break;
            case QuestionType.MCQ:
                selectedOptionIndex = this.selectedOption;
                userAnswer = this.currentQuestion.options?.[this.selectedOption] || '';
                break;
            case QuestionType.TRUE_FALSE:
                selectedBoolean = this.trueFalseAnswer!;
                userAnswer = this.trueFalseAnswer ? 'True' : 'False';
                break;
            case QuestionType.FILE_UPLOAD:
                if (this.uploadedFile) {
                    fileName = this.uploadedFile.name;
                    userAnswer = `File uploaded: ${this.uploadedFile.name}`;
                }
                break;
            case QuestionType.SCHEDULE_CALL:
                const slots = this.getAvailableTimeSlots();
                const slot = slots[this.selectedTimeSlot];
                userAnswer = `Meeting scheduled for ${slot.date} at ${slot.time}`;
                break;
        }

        this.questionService.submitAnswer(
            this.currentQuestion.id,
            userAnswer,
            selectedOptionIndex,
            selectedBoolean,
            fileName ? `uploads/${fileName}` : undefined,
            this.currentQuestion.type === QuestionType.SCHEDULE_CALL
        ).subscribe({
            next: (result) => {
                this.quizAnswers.push(result);
                this.loading = false;
                this.nextQuestion();
            },
            error: (error) => {
                console.error('Error submitting answer:', error);
                this.loading = false;
                this.nextQuestion();
            }
        });
    }

    // Question type helpers
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
            [QuestionType.TEXT_INPUT]: 'Text',
            [QuestionType.MCQ]: 'MCQ',
            [QuestionType.TRUE_FALSE]: 'True/False',
            [QuestionType.FILE_UPLOAD]: 'File Upload',
            [QuestionType.SCHEDULE_CALL]: 'Schedule Call'
        };
        return labelMap[type] || 'Unknown';
    }

    getMeetingPlatformLabel(platform: MeetingPlatform | undefined): string {
        if (!platform) return 'Unknown Platform';
        
        const platformMap = {
            [MeetingPlatform.ZOOM]: 'Zoom',
            [MeetingPlatform.GOOGLE_MEET]: 'Google Meet',
            [MeetingPlatform.MICROSOFT_TEAMS]: 'Microsoft Teams'
        };
        return platformMap[platform] || 'Unknown Platform';
    }

    getPlatformIcon(platform: MeetingPlatform | undefined): string {
        if (!platform) return 'videocam';
        
        const iconMap = {
            [MeetingPlatform.ZOOM]: 'videocam',
            [MeetingPlatform.GOOGLE_MEET]: 'video_call',
            [MeetingPlatform.MICROSOFT_TEAMS]: 'groups'
        };
        return iconMap[platform] || 'videocam';
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

    // File upload methods
    onDragOver(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.dragOver = true;
    }

    onDragLeave(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.dragOver = false;
    }

    onFileDropped(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.dragOver = false;
        
        const files = event.dataTransfer?.files;
        if (files && files.length > 0) {
            this.handleFileSelection(files[0]);
        }
    }

    onFileSelected(event: any) {
        const file = event.target.files?.[0];
        if (file) {
            this.handleFileSelection(file);
        }
    }

    private handleFileSelection(file: File) {
        if (!this.currentQuestion) return;
        
        // Check file size
        if (this.currentQuestion.maxFileSize && file.size > this.currentQuestion.maxFileSize * 1024 * 1024) {
            alert(`File size exceeds maximum allowed size of ${this.currentQuestion.maxFileSize}MB`);
            return;
        }
        
        // Check file type
        if (this.currentQuestion.allowedFileTypes && this.currentQuestion.allowedFileTypes.length > 0) {
            const fileExtension = file.name.split('.').pop()?.toLowerCase();
            if (!fileExtension || !this.currentQuestion.allowedFileTypes.includes(fileExtension)) {
                alert(`File type not allowed. Allowed types: ${this.currentQuestion.allowedFileTypes.join(', ').toUpperCase()}`);
                return;
            }
        }
        
        this.uploadedFile = file;
    }

    removeFile() {
        this.uploadedFile = null;
    }

    formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    getAcceptedFileTypes(allowedTypes: string[] | undefined): string {
        if (!allowedTypes || allowedTypes.length === 0) return '*';
        return allowedTypes.map(type => `.${type}`).join(',');
    }

    isDeadlineExpired(deadline: Date): boolean {
        return new Date() > new Date(deadline);
    }

    getDeadlineStatus(deadline: Date): string {
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const timeDiff = deadlineDate.getTime() - now.getTime();
        
        if (timeDiff < 0) {
            return 'EXPIRED';
        } else if (timeDiff < 24 * 60 * 60 * 1000) {
            return 'DUE SOON';
        } else {
            return 'ON TIME';
        }
    }

    // Schedule call methods
    getAvailableTimeSlots(): TimeSlot[] {
        // Generate mock time slots
        const slots: TimeSlot[] = [];
        const today = new Date();
        
        for (let i = 1; i <= 5; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            
            slots.push({
                id: `slot-${i}-1`,
                date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                time: '10:00 AM - 11:00 AM',
                isAvailable: true
            });
            
            slots.push({
                id: `slot-${i}-2`,
                date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                time: '2:00 PM - 3:00 PM',
                isAvailable: true
            });
        }
        
        return slots;
    }

    selectTimeSlot(slotIndex: number, slot: TimeSlot) {
        this.selectedTimeSlot = slotIndex;
    }

    getSelectedSlotInfo(): string {
        if (this.selectedTimeSlot === -1) return '';
        
        const slots = this.getAvailableTimeSlots();
        const slot = slots[this.selectedTimeSlot];
        return slot ? `${slot.date} at ${slot.time}` : '';
    }

    // Results methods
    getFinalPercentage(): number {
        if (this.quizAnswers.length === 0) return 0;
        const totalScore = this.getTotalScore();
        const totalPossible = this.getTotalPossibleScore();
        return totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
    }

    getPerformanceLabel(): string {
        const percentage = this.getFinalPercentage();
        if (percentage >= 90) return 'Excellent';
        if (percentage >= 80) return 'Very Good';
        if (percentage >= 70) return 'Good';
        if (percentage >= 60) return 'Fair';
        return 'Needs Improvement';
    }

    getScoreClass(): string {
        const percentage = this.getFinalPercentage();
        if (percentage >= 80) return 'excellent';
        if (percentage >= 60) return 'good';
        return 'needs-improvement';
    }

    getCorrectAnswersCount(): number {
        return this.quizAnswers.filter(answer => answer.isCorrect).length;
    }

    getTotalScore(): number {
        return this.quizAnswers.reduce((sum, answer) => sum + answer.points, 0);
    }

    getTotalPossibleScore(): number {
        return this.quizAnswers.reduce((sum, answer) => {
            const question = this.quizQuestions.find(q => q.id === answer.questionId);
            return sum + (question?.points || 0);
        }, 0);
    }

    getTimeTaken(): string {
        if (!this.quizStartTime) return '0:00';
        const now = new Date();
        const timeDiff = now.getTime() - this.quizStartTime.getTime();
        const minutes = Math.floor(timeDiff / 60000);
        const seconds = Math.floor((timeDiff % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    getResultClass(answer: QuestionAnswer): string {
        if (answer.needsManualReview) return 'pending';
        return answer.isCorrect ? 'correct' : 'incorrect';
    }

    getResultIcon(answer: QuestionAnswer): string {
        if (answer.needsManualReview) return 'hourglass_empty';
        return answer.isCorrect ? 'check_circle' : 'cancel';
    }

    getQuestionPoints(questionId: string): number {
        const question = this.quizQuestions.find(q => q.id === questionId);
        return question?.points || 0;
    }

    getQuestionText(questionId: string): string {
        const question = this.quizQuestions.find(q => q.id === questionId);
        return question?.text || '';
    }

    getCorrectAnswer(questionId: string): string {
        const question = this.quizQuestions.find(q => q.id === questionId);
        if (!question) return '';

        switch (question.type) {
            case QuestionType.TEXT_INPUT:
                return question.correctAnswer || '';
            case QuestionType.MCQ:
                return question.options?.[question.correctOptionIndex || 0] || '';
            case QuestionType.TRUE_FALSE:
                return question.isTrue ? 'True' : 'False';
            default:
                return 'N/A';
        }
    }

    // Navigation methods
    restartQuiz() {
        this.quizStarted = false;
        this.quizCompleted = false;
        this.currentQuestionIndex = -1;
        this.currentQuestion = null;
        this.quizAnswers = [];
        this.resetCurrentAnswer();
        this.timerSubscription?.unsubscribe();
    }

    goBack() {
        this.restartQuiz();
    }
} 