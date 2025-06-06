import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router } from '@angular/router';

import { CompanyProfileService } from '../../../../data/company-profile.service';
import { CompanyProfile, ProfileGenerationRequest } from '../../../../../../shared/models/company-profile.model';
import { ProfileViewerDialogComponent } from '../../../profile-viewer/dialogs/profile-viewer-dialog/profile-viewer-dialog.component';

@Component({
  selector: 'app-generator-page',
  templateUrl: './generator-page.component.html',
  styleUrls: ['./generator-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatProgressBarModule,
    MatDialogModule,
    MatDividerModule,
    MatSnackBarModule,
    MatIconModule,
    MatFormFieldModule
  ]
})
export class GeneratorPageComponent {
  companyUrl: string = '';
  customInstructions: string = '';
  isLoading: boolean = false;

  constructor(
    private companyProfileService: CompanyProfileService,
    private snackBar: MatSnackBar,
    private router: Router,
    public dialog: MatDialog
  ) {}

  generateProfile(): void {
    if (!this.companyUrl.trim()) {
      this.snackBar.open('Please enter a company website URL.', 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    this.isLoading = true;

    const request: ProfileGenerationRequest = {
      url: this.companyUrl,
      customInstructions: this.customInstructions.trim()
    };

    this.companyProfileService.generateProfile(request).subscribe({
      next: (profile: CompanyProfile) => {
        this.snackBar.open('Company profile generated successfully!', 'Close', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });
        this.openProfileDialog(profile);
      },
      error: (error) => {
        console.error('Error generating profile:', error);
        this.snackBar.open('Failed to generate profile. Please try again.', 'Close', {
          duration: 5000,
          panelClass: ['snackbar-error']
        });
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  openProfileDialog(profile: CompanyProfile): void {
    const dialogRef = this.dialog.open(ProfileViewerDialogComponent, {
      width: '90vw',
      maxWidth: '900px',
      data: profile,
      disableClose: true,
      panelClass: 'profile-viewer-dialog-panel'
    });

    dialogRef.componentInstance.editProfile.subscribe((profileId: string) => {
      this.router.navigate(['/company/edit', profileId]);
    });
  }

  resetForm(): void {
    this.companyUrl = '';
    this.customInstructions = '';
    this.isLoading = false;
    this.snackBar.dismiss();
  }
}
