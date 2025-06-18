import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { QuestionGradingService } from '../../../../shared/services/question-grading.service';
import { Question, QuestionAnswer, QuestionType, Quiz, QuizResult } from '../../../../shared/interfaces/question.interface';
import { Subject, interval, takeUntil } from 'rxjs';

@Component({
  selector: 'app-quiz-page',
  templateUrl: './quiz-page.component.html',
  styleUrls: ['./quiz-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatCheckboxModule,
    MatChipsModule,
    MatSnackBarModule,
    MatDialogModule
  ]
})
export class QuizPageComponent implements OnInit, OnDestroy {
  currentQuiz: Quiz | null = null;
  currentQuestionIndex = 0;
  currentQuestion: Question | null = null;
  answerForm: FormGroup;
  answers: QuestionAnswer[] = [];
  quizResult: QuizResult | null = null;
  
  // Timer
  timeLeft = 0;
  totalTime = 0;
  timerInterval: any;
  
  // UI States
  isQuizStarted = false;
  isQuizCompleted = false;
  isSubmitting = false;
  
  // Enum reference for template
  QuestionType = QuestionType;
  
  private destroy$ = new Subject<void>();

  constructor(
    private questionService: QuestionGradingService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.generateNewQuiz();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  private initializeForm() {
    this.answerForm = this.fb.group({
      textAnswer: [''],
      selectedOption: [''],
      booleanAnswer: [null],
      fileUpload: [null],
      scheduleCall: [false]
    });
  }

  generateNewQuiz() {
    this.questionService.generateRandomQuiz('Random Assessment', 'Test your knowledge with this randomized quiz')
      .subscribe({
        next: (quiz) => {
          this.currentQuiz = quiz;
          this.resetQuizState();
        },
        error: (error) => {
          this.snackBar.open('Error generating quiz', 'Close', { duration: 3000 });
        }
      });
  }

  private resetQuizState() {
    this.currentQuestionIndex = 0;
    this.answers = [];
    this.quizResult = null;
    this.isQuizStarted = false;
    this.isQuizCompleted = false;
    this.isSubmitting = false;
    this.timeLeft = 0;
    this.totalTime = 0;
    
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  startQuiz() {
    if (!this.currentQuiz || this.currentQuiz.questions.length === 0) {
      this.snackBar.open('No questions available', 'Close', { duration: 3000 });
      return;
    }

    this.isQuizStarted = true;
    this.currentQuestion = this.currentQuiz.questions[0];
    this.setupFormForQuestion();
    this.startTimer();
  }

  private startTimer() {
    if (!this.currentQuiz) return;
    
    this.totalTime = this.currentQuiz.timeLimit * 60; // Convert minutes to seconds
    this.timeLeft = this.totalTime;
    
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        this.submitQuiz();
      }
    }, 1000);
  }

  private setupFormForQuestion() {
    if (!this.currentQuestion) return;

    this.answerForm.reset();
    
    switch (this.currentQuestion.type) {
      case QuestionType.TEXT_INPUT:
        this.answerForm.get('textAnswer')?.setValidators([Validators.required, Validators.minLength(10)]);
        break;
      case QuestionType.MCQ:
        this.answerForm.get('selectedOption')?.setValidators([Validators.required]);
        break;
      case QuestionType.TRUE_FALSE:
        this.answerForm.get('booleanAnswer')?.setValidators([Validators.required]);
        break;
      case QuestionType.FILE_UPLOAD:
        // File upload validation would be handled separately
        break;
      case QuestionType.SCHEDULE_CALL:
        this.answerForm.get('scheduleCall')?.setValidators([Validators.requiredTrue]);
        break;
    }
    
    this.answerForm.updateValueAndValidity();
  }

  nextQuestion() {
    if (!this.currentQuestion || !this.answerForm.valid) {
      this.snackBar.open('Please answer the current question', 'Close', { duration: 3000 });
      return;
    }

    this.submitCurrentAnswer();
    
    if (this.currentQuestionIndex < (this.currentQuiz?.questions.length || 0) - 1) {
      this.currentQuestionIndex++;
      this.currentQuestion = this.currentQuiz!.questions[this.currentQuestionIndex];
      this.setupFormForQuestion();
    } else {
      this.submitQuiz();
    }
  }

  private submitCurrentAnswer() {
    if (!this.currentQuestion) return;

    const formValue = this.answerForm.value;
    let userAnswer = '';
    let selectedOptionIndex: number | undefined;
    let selectedBoolean: boolean | undefined;
    let fileUrl: string | undefined;
    let callScheduled: boolean | undefined;

    switch (this.currentQuestion.type) {
      case QuestionType.TEXT_INPUT:
        userAnswer = formValue.textAnswer || '';
        break;
      case QuestionType.MCQ:
        selectedOptionIndex = parseInt(formValue.selectedOption);
        userAnswer = this.currentQuestion.options?.[selectedOptionIndex] || '';
        break;
      case QuestionType.TRUE_FALSE:
        selectedBoolean = formValue.booleanAnswer;
        userAnswer = selectedBoolean ? 'True' : 'False';
        break;
      case QuestionType.FILE_UPLOAD:
        fileUrl = formValue.fileUpload;
        userAnswer = 'File uploaded';
        break;
      case QuestionType.SCHEDULE_CALL:
        callScheduled = formValue.scheduleCall;
        userAnswer = 'Call scheduled';
        break;
    }

    this.questionService.submitAnswer(
      this.currentQuestion.id,
      userAnswer,
      selectedOptionIndex,
      selectedBoolean,
      fileUrl,
      callScheduled
    ).subscribe({
      next: (answer) => {
        this.answers.push(answer);
        
        // Show immediate feedback for MCQ and True/False
        if (this.currentQuestion?.type === QuestionType.MCQ || this.currentQuestion?.type === QuestionType.TRUE_FALSE) {
          const message = answer.isCorrect ? 
            `Correct! +${answer.points} points` : 
            `Incorrect. The correct answer was ${this.getCorrectAnswerText()}`;
          
          this.snackBar.open(message, 'Close', { 
            duration: 2000,
            panelClass: answer.isCorrect ? 'success-snackbar' : 'error-snackbar'
          });
        }
      },
      error: (error) => {
        this.snackBar.open('Error submitting answer', 'Close', { duration: 3000 });
      }
    });
  }

  private getCorrectAnswerText(): string {
    if (!this.currentQuestion) return '';
    
    switch (this.currentQuestion.type) {
      case QuestionType.MCQ:
        return this.currentQuestion.options?.[this.currentQuestion.correctOptionIndex || 0] || '';
      case QuestionType.TRUE_FALSE:
        return this.currentQuestion.isTrue ? 'True' : 'False';
      default:
        return '';
    }
  }

  submitQuiz() {
    if (this.isSubmitting) return;
    
    this.isSubmitting = true;
    
    // Submit current answer if not already submitted
    if (this.currentQuestion && this.answerForm.valid) {
      this.submitCurrentAnswer();
    }
    
    // Calculate quiz result
    this.quizResult = this.questionService.calculateQuizResult(this.answers);
    this.quizResult.timeTaken = this.totalTime - this.timeLeft;
    
    this.isQuizCompleted = true;
    this.isSubmitting = false;
    
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  restartQuiz() {
    this.generateNewQuiz();
  }

  // Utility methods for template
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

  getProgressPercentage(): number {
    if (!this.currentQuiz) return 0;
    return Math.round(((this.currentQuestionIndex + 1) / this.currentQuiz.questions.length) * 100);
  }

  getScoreColor(percentage: number): string {
    if (percentage >= 90) return '#4caf50'; // green
    if (percentage >= 70) return '#ff9800'; // orange
    if (percentage >= 50) return '#f44336'; // red
    return '#9e9e9e'; // gray
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // In a real app, you would upload the file to a server
      const fileUrl = URL.createObjectURL(file);
      this.answerForm.patchValue({ fileUpload: fileUrl });
    }
  }
} 