import { Routes } from '@angular/router';

// Lazy load specific feature page components
export const COMPANY_ROUTES: Routes = [
  { path: '', redirectTo: 'generator', pathMatch: 'full' }, // Default for /company

  {
    path: 'generator',
    loadComponent: () => import('./features/profile-generator/pages/generator-page/generator-page.component').then(m => m.GeneratorPageComponent)
  },
  {
    path: 'view/:id', // Use 'view' here, the full path will be '/company/view/:id'
    loadComponent: () => import('./features/profile-viewer/pages/viewer-page/viewer-page.component').then(m => m.ViewerPageComponent)
  },
  {
    path: 'edit/:id', // Use 'edit' here, the full path will be '/company/edit/:id'
    loadComponent: () => import('./features/profile-editor/pages/editor-page/editor-page.component').then(m => m.EditorPageComponent)
  },
  {
    path: 'history',
    loadComponent: () => import('./features/profile-history/pages/history-page/history-page.component').then(m => m.HistoryPageComponent)
  },
  {
    path: 'organization-chart',
    loadComponent: () => import('./features/organization-chart/pages/organization-chart-page/organization-chart-page.component').then(m => m.OrganizationChartPageComponent)
  },
  {
    path: 'organization-directory',
    loadComponent: () => import('./features/organization-directory/pages/directory-page/directory-page.component').then(m => m.DirectoryPageComponent)
  }
  // Add any other top-level company domain routes here
];
