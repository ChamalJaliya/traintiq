import { Component, Inject, ViewChild, EventEmitter, Output, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef, MatDialogContent } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';

import { EmployeeProfile } from '../../../../../../shared/models/employee-profile.model';

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
    MatChipsModule,
    MatProgressBarModule,
    MatTabsModule,
    MatTooltipModule,
    RouterModule
  ]
})
export class ProfileViewerDialogComponent implements AfterViewInit {
  @ViewChild(MatDialogContent) dialogContent!: MatDialogContent;
  @Output() editProfile = new EventEmitter<string>();
  isScrollable = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: EmployeeProfile,
    public dialogRef: MatDialogRef<ProfileViewerDialogComponent>
  ) {}

  ngAfterViewInit(): void {
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

  getSkillLevelText(level: number): string {
    switch (level) {
      case 1: return 'Beginner';
      case 2: return 'Elementary';
      case 3: return 'Intermediate';
      case 4: return 'Advanced';
      case 5: return 'Expert';
      default: return 'Not Specified';
    }
  }

  getSkillColor(level: number): string {
    switch (level) {
      case 1: return 'primary';
      case 2: return 'accent';
      case 3: return 'warn';
      case 4: return 'primary';
      case 5: return 'accent';
      default: return 'primary';
    }
  }

  private updateScrollableState(): void {
    if (this.dialogContent && this.dialogContent['_elementRef']?.nativeElement) {
      const element = this.dialogContent['_elementRef'].nativeElement;
      this.isScrollable = element.scrollHeight > element.clientHeight;
    } else {
      this.isScrollable = false;
    }
  }

  isContentScrollable(): boolean {
    return this.isScrollable;
  }

  scrollToTop(): void {
    if (this.dialogContent && this.dialogContent['_elementRef']?.nativeElement) {
      const element = this.dialogContent['_elementRef'].nativeElement;
      element.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
} 