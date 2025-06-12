import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter, Routes } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/company/generator',
    pathMatch: 'full'
  },
  {
    path: 'company',
    loadChildren: () => import('./domains/company/company.routes').then(m => m.COMPANY_ROUTES)
  },
  {
    path: 'employee',
    loadChildren: () => import('./domains/employee/employee.routes').then(m => m.employeeRoutes)
  },
  {
    path: '**',
    redirectTo: '/company/generator'
  }
];

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(),
    importProvidersFrom(MatSnackBarModule)
  ]
}).catch((err) => console.error(err));
