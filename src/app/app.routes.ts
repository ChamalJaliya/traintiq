import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'company',
        loadChildren: () => import('../domains/company/company.routes').then(m => m.COMPANY_ROUTES)
      },
      {
        path: 'employee',
        loadChildren: () => import('../domains/employee/employee.routes').then(m => m.EMPLOYEE_ROUTES)
      },
      {
        path: 'question-grading',
        loadChildren: () => import('../domains/question-grading/question-grading.routes').then(m => m.QUESTION_GRADING_ROUTES)
      },
      {
        path: 'content-manager',
        loadChildren: () => import('../domains/content-manager/content-manager.routes').then(m => m.CONTENT_MANAGER_ROUTES)
      },
      {
        path: 'test-tour',
        loadComponent: () => import('./test-tour.component').then(m => m.TestTourComponent)
      },
      {
        path: '',
        redirectTo: '/content-manager',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/company'
  }
];
