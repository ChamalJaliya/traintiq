import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { QuestionAnsweringComponent } from './pages/question-answering/question-answering.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            { path: '', component: QuestionAnsweringComponent }
        ])
    ]
})
export class QuestionAnsweringModule { } 