import { Routes } from '@angular/router';

export const QUESTION_GRADING_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'create',
    pathMatch: 'full'
  },
  {
    path: 'create',
    loadComponent: () => import('./features/question-creator/pages/question-creator/question-creator.component')
      .then(m => m.QuestionCreatorComponent)
  },
  {
    path: 'answer',
    loadComponent: () => import('./features/question-answering/pages/question-answering/question-answering.component')
      .then(m => m.QuestionAnsweringComponent)
  },
  {
    path: 'quiz',
    loadComponent: () => import('./features/quiz/pages/quiz-page/quiz-page.component')
      .then(m => m.QuizPageComponent)
  }
]; 