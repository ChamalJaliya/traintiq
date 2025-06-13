import { Routes } from '@angular/router';

export const EMPLOYEE_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'analyzer',
    pathMatch: 'full'
  },
  {
    path: 'analyzer',
    loadComponent: () => import('./features/cv-analyzer/pages/analyzer-page/analyzer-page.component')
      .then(m => m.AnalyzerPageComponent)
  },
  {
    path: 'profiles',
    children: [
      {
        path: 'new',
        loadComponent: () => import('./features/profile-editor/pages/editor-page/editor-page.component')
          .then(m => m.EditorPageComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/profile-viewer/pages/viewer-page/viewer-page.component')
          .then(m => m.ViewerPageComponent)
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./features/profile-editor/pages/editor-page/editor-page.component')
          .then(m => m.EditorPageComponent)
      },
      {
        path: '',
        loadComponent: () => import('./features/talent-pool/pages/pool-page/pool-page.component')
          .then(m => m.PoolPageComponent)
      }
    ]
  },
  {
    path: 'talent-pool',
    loadComponent: () => import('./features/talent-pool/pages/pool-page/pool-page.component')
      .then(m => m.PoolPageComponent)
  }
]; 