import { Routes } from '@angular/router';

export const routes: Routes = [
  // Redirect root path to the 'company' domain's default route ('generator')
  { path: '', redirectTo: 'company/generator', pathMatch: 'full' },

  // Lazy load the entire 'company' domain's routes
  // The 'company' domain's default path will be 'generator'
  {
    path: 'company', // Base path for the entire company domain
    loadChildren: () => import('../domains/company/company.routes').then(m => m.COMPANY_ROUTES)
  },

  // Wildcard route for any undefined paths, redirecting to the company generator
  { path: '**', redirectTo: 'company/generator' }
];
