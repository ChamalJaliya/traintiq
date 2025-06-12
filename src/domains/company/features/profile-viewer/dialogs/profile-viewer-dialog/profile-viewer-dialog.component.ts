import { Component, Inject, ViewChild, EventEmitter, Output, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef, MatDialogContent } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';

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
    MatCardModule,
    MatChipsModule
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

  // Helper for service icons
  getServiceIcon(serviceName: string): string {
    const name = serviceName.toLowerCase();
    if (name.includes('ux') || name.includes('ui') || name.includes('design')) return 'design_services';
    if (name.includes('development') || name.includes('coding')) return 'code';
    if (name.includes('mobile') || name.includes('app')) return 'smartphone';
    if (name.includes('ai') || name.includes('artificial intelligence')) return 'psychology';
    if (name.includes('iot') || name.includes('internet of things')) return 'device_hub';
    if (name.includes('qa') || name.includes('quality') || name.includes('testing')) return 'bug_report';
    if (name.includes('team') || name.includes('dedicated')) return 'groups';
    if (name.includes('consulting') || name.includes('advisory')) return 'business_center';
    if (name.includes('cloud') || name.includes('infrastructure')) return 'cloud';
    if (name.includes('data') || name.includes('analytics')) return 'analytics';
    return 'settings';
  }

  // Helper for technology icons
  getTechIcon(techName: string): string {
    const tech = techName.toLowerCase();
    if (tech.includes('javascript') || tech.includes('js')) return 'javascript';
    if (tech.includes('react')) return 'web';
    if (tech.includes('angular')) return 'web';
    if (tech.includes('vue')) return 'web';
    if (tech.includes('node') || tech.includes('nodejs')) return 'dns';
    if (tech.includes('python')) return 'code';
    if (tech.includes('java')) return 'coffee';
    if (tech.includes('php')) return 'code';
    if (tech.includes('docker')) return 'inventory_2';
    if (tech.includes('kubernetes') || tech.includes('k8s')) return 'account_tree';
    if (tech.includes('aws') || tech.includes('azure') || tech.includes('gcp')) return 'cloud';
    if (tech.includes('mysql') || tech.includes('postgres') || tech.includes('mongodb')) return 'storage';
    if (tech.includes('redis')) return 'memory';
    if (tech.includes('git')) return 'source';
    if (tech.includes('flutter') || tech.includes('dart')) return 'smartphone';
    if (tech.includes('django') || tech.includes('flask')) return 'web';
    if (tech.includes('tensorflow') || tech.includes('pytorch')) return 'psychology';
    return 'code';
  }
}
