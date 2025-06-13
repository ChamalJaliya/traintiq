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
        path: '',
        redirectTo: '/company',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/company'
  }
];
