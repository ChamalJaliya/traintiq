import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';

import { CompanyProfile } from '../../../../../../shared/models/company-profile.model';
import { CompanyProfileService } from '../../../../data/company-profile.service';

interface KeyValuePair {
  key: string;
  value: string;
}

@Component({
  selector: 'app-editor-page',
  templateUrl: './editor-page.component.html',
  styleUrls: ['./editor-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSnackBarModule,
    MatCardModule,
    MatProgressBarModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatDividerModule,
    RouterModule,
    MatTooltipModule
  ]
})
export class EditorPageComponent implements OnInit {
  profileId: string | null = null;
  companyProfile!: CompanyProfile;
  isLoading: boolean = true;
  isSaving: boolean = false;

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
          this.companyProfile = this.initializeProfile(profile);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load profile for editing:', err);
          this.snackBar.open('Could not load profile for editing.', 'Close', { duration: 3000, panelClass: ['snackbar-error'] });
          this.isLoading = false;
        }
      });
    } else {
      this.isLoading = false;
      this.snackBar.open('No profile ID provided for editing.', 'Close', { duration: 3000, panelClass: ['snackbar-warn'] });
    }
  }

  private initializeProfile(profile: CompanyProfile): CompanyProfile {
    const initializedProfile = { ...profile };
    
    // Initialize all required objects if they don't exist
    initializedProfile.basicInfo = initializedProfile.basicInfo || {
      legalName: '',
      tradingName: '',
      dba: '',
      logoUrl: '',
      industryCodes: []
    };
    initializedProfile.descriptive = initializedProfile.descriptive || {};
    initializedProfile.financials = initializedProfile.financials || { financialData: [] };
    initializedProfile.customSections = initializedProfile.customSections || {};
    
    return initializedProfile;
  }

  addCustomSection(): void {
    // Add a placeholder new section with a unique name
    let newSectionName = `New Custom Section ${Object.keys(this.companyProfile.customSections).length + 1}`;
    let i = 0;
    while(this.companyProfile.customSections[newSectionName]) {
      i++;
      newSectionName = `New Custom Section ${Object.keys(this.companyProfile.customSections).length + 1 + i}`;
    }
    this.companyProfile.customSections[newSectionName] = '';
  }

  removeCustomSection(key: string): void {
    delete this.companyProfile.customSections[key];
    this.snackBar.open(`Section '${key}' removed.`, 'Close', { duration: 2000, panelClass: ['snackbar-info'] });
  }

  updateCustomSectionKey(oldKey: string, newKey: string): void {
    if (oldKey !== newKey && this.companyProfile.customSections[oldKey] !== undefined) {
      const value = this.companyProfile.customSections[oldKey];
      delete this.companyProfile.customSections[oldKey];
      this.companyProfile.customSections[newKey] = value;
    }
  }

  getCustomSections(): KeyValuePair[] {
    return Object.entries(this.companyProfile.customSections || {}).map(([key, value]) => ({
      key,
      value
    }));
  }

  addFinancialData(): void {
    if (!this.companyProfile.financials) {
      this.companyProfile.financials = { financialData: [] };
    }
    if (!this.companyProfile.financials.financialData) {
      this.companyProfile.financials.financialData = [];
    }
    this.companyProfile.financials.financialData.push({
      year: new Date().getFullYear(),
      revenue: 0,
      profit: 0,
      currency: 'USD'
    });
  }

  removeFinancialData(index: number): void {
    if (this.companyProfile.financials?.financialData) {
      this.companyProfile.financials.financialData.splice(index, 1);
    }
  }

  updateCoreValues(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (!this.companyProfile.descriptive) {
      this.companyProfile.descriptive = {};
    }
    this.companyProfile.descriptive.coreValues = value.split(',').map(s => s.trim()).filter(s => s !== '');
  }

  saveProfile(): void {
    this.isSaving = true;
    this.companyProfileService.updateProfile(this.profileId!, this.companyProfile).subscribe({
      next: () => {
        this.snackBar.open('Profile changes saved successfully!', 'Close', { 
          duration: 3000, 
          panelClass: ['snackbar-success'] 
        });
        this.isSaving = false;
      },
      error: (err) => {
        console.error('Failed to save profile:', err);
        this.snackBar.open('Failed to save profile changes.', 'Close', { 
          duration: 3000, 
          panelClass: ['snackbar-error'] 
        });
        this.isSaving = false;
      }
    });
  }
}
