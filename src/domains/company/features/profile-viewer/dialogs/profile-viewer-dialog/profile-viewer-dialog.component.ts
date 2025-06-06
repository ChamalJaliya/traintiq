import { Component, Inject, ViewChild, EventEmitter, Output, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef, MatDialogContent } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';

import { CompanyProfile } from '../../../../../../shared/models/company-profile.model';

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
    MatCardModule
  ]
})
export class ProfileViewerDialogComponent implements AfterViewInit {
  @ViewChild(MatDialogContent) dialogContent!: MatDialogContent;
  @Output() editProfile = new EventEmitter<string>();
  isScrollable = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: CompanyProfile,
    public dialogRef: MatDialogRef<ProfileViewerDialogComponent>
  ) {}

  ngAfterViewInit(): void {
    // Check scrollability after view init
    setTimeout(() => {
      this.updateScrollableState();
    });
  }

  onEditClick(): void {
    if (this.data._id) {
      this.editProfile.emit(this.data._id);
      this.dialogRef.close();
    }
  }

  // Helper for social media icons
  getSocialIcon(platform: string): string {
    switch (platform.toLowerCase()) {
      case 'linkedin': return 'linkedin';
      case 'twitter': return 'public';
      case 'facebook': return 'facebook';
      case 'instagram': return 'photo_camera';
      case 'youtube': return 'subscriptions';
      default: return 'public';
    }
  }

  // Function to check if content is scrollable
  private updateScrollableState(): void {
    if (this.dialogContent && this.dialogContent['_elementRef']?.nativeElement) {
      const element = this.dialogContent['_elementRef'].nativeElement;
      this.isScrollable = element.scrollHeight > element.clientHeight;
    } else {
      this.isScrollable = false;
    }
  }

  // Function to check if content is scrollable (safe version)
  isContentScrollable(): boolean {
    return this.isScrollable;
  }

  // Function to scroll to top
  scrollToTop(): void {
    if (this.dialogContent && this.dialogContent['_elementRef']?.nativeElement) {
      const element = this.dialogContent['_elementRef'].nativeElement;
      element.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
