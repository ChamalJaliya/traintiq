import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild([
            {
                path: 'create',
                loadChildren: () => import('./features/question-creator/question-creator.module')
                    .then(m => m.QuestionCreatorModule)
            },
            {
                path: 'answer',
                loadChildren: () => import('./features/question-answering/question-answering.module')
                    .then(m => m.QuestionAnsweringModule)
            },
            {
                path: '',
                redirectTo: 'create',
                pathMatch: 'full'
            }
        ])
    ]
})
export class QuestionGradingModule { } 