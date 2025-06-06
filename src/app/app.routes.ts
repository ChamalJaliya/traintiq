import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { employeeRoutes } from '../domains/employee/employee.routes';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'company',
        children: [
          {
            path: 'generator',
            loadComponent: () => import('../domains/company/features/profile-generator/pages/generator-page/generator-page.component')
              .then(m => m.GeneratorPageComponent)
          },
          {
            path: 'history',
            loadComponent: () => import('../domains/company/features/profile-history/pages/history-page/history-page.component')
              .then(m => m.HistoryPageComponent)
          },
          {
            path: 'view/:id',
            loadComponent: () => import('../domains/company/features/profile-viewer/pages/viewer-page/viewer-page.component')
              .then(m => m.ViewerPageComponent)
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('../domains/company/features/profile-editor/pages/editor-page/editor-page.component')
              .then(m => m.EditorPageComponent)
          },
          {
            path: 'settings',
            loadComponent: () => import('../domains/company/features/settings/pages/settings-page/settings-page.component')
              .then(m => m.SettingsPageComponent)
          },
          {
            path: '',
            redirectTo: 'generator',
            pathMatch: 'full'
          }
        ]
      },
      {
        path: 'employee',
        children: [
          {
            path: 'analyzer',
            loadComponent: () => import('../domains/employee/features/cv-analyzer/pages/analyzer-page/analyzer-page.component')
              .then(m => m.AnalyzerPageComponent)
          },
          {
            path: 'profiles',
            loadComponent: () => import('../domains/employee/features/profile-viewer/pages/viewer-page/viewer-page.component')
              .then(m => m.ViewerPageComponent)
          },
          {
            path: 'talent-pool',
            loadComponent: () => import('../domains/employee/features/talent-pool/pages/pool-page/pool-page.component')
              .then(m => m.PoolPageComponent)
          },
          {
            path: '',
            redirectTo: 'analyzer',
            pathMatch: 'full'
          }
        ]
      },
      {
        path: '',
        redirectTo: 'company/generator',
        pathMatch: 'full'
      }
    ]
  }
];
