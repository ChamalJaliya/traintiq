import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { ActivatedRoute, RouterModule } from '@angular/router';

// Update service and model imports
import { CompanyProfileService } from '../../../../data/company-profile.service';

import { CompanyProfile } from '../../../../../../shared/models/company-profile.model';

@Component({
  selector: 'app-viewer-page', // Selector name
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
    private companyProfileService: CompanyProfileService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.profileId = this.route.snapshot.paramMap.get('id');
    if (this.profileId) {
      this.companyProfileService.getProfile(this.profileId).subscribe({
        next: (profile) => {
          this.companyProfile = profile;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load profile:', err);
          this.snackBar.open('Failed to load profile details.', 'Close', { duration: 3000, panelClass: ['snackbar-error'] });
          this.isLoading = false;
        }
      });
    } else {
      this.isLoading = false;
      this.snackBar.open('No profile ID provided.', 'Close', { duration: 3000, panelClass: ['snackbar-warn'] });
    }
  }

  // Helper for social media icons
  getSocialIcon(platform: string): string {
    switch (platform.toLowerCase()) {
      case 'linkedin': return 'linkedin'; // Replace with a custom icon if needed, or generic
      case 'twitter': return 'public'; // Using generic 'public' for twitter/X
      case 'facebook': return 'facebook';
      case 'instagram': return 'photo_camera';
      case 'youtube': return 'subscriptions';
      default: return 'public';
    }
  }
}
