import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';

// Update service and model imports
import { CompanyProfileService } from '../../../../data/company-profile.service';
import { CompanyProfile } from '../../../../../../shared/models/company-profile.model';

@Component({
  selector: 'app-viewer-page',
  templateUrl: './viewer-page.component.html',
  styleUrls: ['./viewer-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatSnackBarModule,
    MatCardModule,
    MatProgressBarModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    RouterModule
  ]
})
export class ViewerPageComponent implements OnInit {
  profileId: string | null = null;
  companyProfile: CompanyProfile | null = null;
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private companyProfileService: CompanyProfileService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.profileId = this.route.snapshot.paramMap.get('id');
    if (this.profileId) {
      this.companyProfileService.getProfile(this.profileId).subscribe({
        next: (profile) => {
          if (profile) {
            this.companyProfile = profile;
            this.isLoading = false;
          } else {
            this.handleError('Profile not found');
          }
        },
        error: (err) => {
          this.handleError('Failed to load profile details');
        }
      });
    } else {
      this.handleError('No profile ID provided');
    }
  }

  private handleError(message: string): void {
    console.error(message);
    this.snackBar.open(message, 'Close', { 
      duration: 3000, 
      panelClass: ['snackbar-error'] 
    });
    this.isLoading = false;
    this.router.navigate(['/company/history']);
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
}
