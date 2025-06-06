import { Component, Inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef, MatDialogContent } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router'; // For routerLink in the dialog actions

import { CompanyProfile } from '../../../../../../shared/models/company-profile.model'; // Updated path

@Component({
  selector: 'app-profile-viewer-dialog',
  templateUrl: './profile-viewer-dialog.component.html',
  styleUrls: ['./profile-viewer-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatCardModule,
    RouterModule
  ]
})
export class ProfileViewerDialogComponent {
  @ViewChild(MatDialogContent) dialogContent!: MatDialogContent;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: CompanyProfile, // Injects the profile data
    public dialogRef: MatDialogRef<ProfileViewerDialogComponent> // Reference to close the dialog
  ) {}

  // Helper for social media icons
  getSocialIcon(platform: string): string {
    switch (platform.toLowerCase()) {
      case 'linkedin': return 'linkedin'; // Placeholder, use custom icon if needed
      case 'twitter': return 'public'; // Using generic 'public' for twitter/X
      case 'facebook': return 'facebook'; // Placeholder
      case 'instagram': return 'photo_camera';
      case 'youtube': return 'subscriptions';
      default: return 'public';
    }
  }

  // Function to check if content is scrollable
  isContentScrollable(): boolean {
    if (!this.dialogContent) return false;
    const element = this.dialogContent['_elementRef'].nativeElement;
    return element.scrollHeight > element.clientHeight;
  }

  // Function to scroll to top
  scrollToTop(): void {
    if (this.dialogContent) {
      const element = this.dialogContent['_elementRef'].nativeElement;
      element.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
