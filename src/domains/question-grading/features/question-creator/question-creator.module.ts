import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';

import { QuestionCreatorComponent } from './pages/question-creator/question-creator.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            { path: '', component: QuestionCreatorComponent }
        ])
    ]
})
export class QuestionCreatorModule { } 