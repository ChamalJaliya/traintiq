import { Routes } from '@angular/router';

// Lazy load specific feature page components
export const CONTENT_MANAGER_ROUTES: Routes = [
  { path: '', redirectTo: 'plans', pathMatch: 'full' }, // Default for /content-manager

  {
    path: 'plans',
    loadComponent: () => import('./features/plans/pages/plans-page/plans-page.component').then(m => m.PlansPageComponent)
  },
  {
    path: 'subject-builder/:planId',
    loadComponent: () => import('./features/subject-builder/pages/builder-page/builder-page.component').then(m => m.BuilderPageComponent)
  },
  {
    path: 'topic-editor/:subjectId',
    loadComponent: () => import('./features/topic-editor/pages/editor-page/editor-page.component').then(m => m.EditorPageComponent)
  },
  {
    path: 'content-viewer/:topicId',
    loadComponent: () => import('./features/content-viewer/pages/viewer-page/viewer-page.component').then(m => m.ViewerPageComponent)
  },
  // Add any other top-level content manager domain routes here
]; 