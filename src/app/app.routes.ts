import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

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
        path: '',
        redirectTo: 'company/generator',
        pathMatch: 'full'
      }
    ]
  }
];
