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
import { MatChipsModule } from '@angular/material/chips';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { CompanyProfileService } from '../../../../data/company-profile.service';
import { CompanyProfile, ProfileGenerationRequest } from '../../../../../../shared/models/company-profile.model';
import { ProfileViewerDialogComponent } from '../../../profile-viewer/dialogs/profile-viewer-dialog/profile-viewer-dialog.component';

interface ProcessedFile {
  filename: string;
  status: string;
  textContent?: string;
  message?: string;
  characterCount?: number;
}

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
    MatFormFieldModule,
    MatChipsModule
  ]
})
export class GeneratorPageComponent {
  companyUrls: string[] = [''];
  customInstructions: string = '';
  selectedFiles: File[] = [];
  processedDocuments: ProcessedFile[] = [];
  isLoading: boolean = false;
  currentStep: number = 0;
  loadingMessage: string = 'Initializing...';

  quickFocusOptions = [
    'Technology Stack',
    'Funding & Financials',
    'Leadership Team',
    'Products & Services',
    'Market Position',
    'Recent Developments'
  ];

  constructor(
    private companyProfileService: CompanyProfileService,
    private snackBar: MatSnackBar,
    private router: Router,
    private http: HttpClient,
    public dialog: MatDialog
  ) {}

  addUrl(): void {
    if (this.companyUrls.length < 5) {
      this.companyUrls.push('');
    }
  }

  removeUrl(index: number): void {
    if (index > 0) {
      this.companyUrls.splice(index, 1);
    }
  }

  clearUrl(index: number): void {
    this.companyUrls[index] = '';
  }

  onFilesSelected(event: any): void {
    const files = Array.from(event.target.files) as File[];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const supportedTypes = ['.pdf', '.docx', '.doc'];

    files.forEach(file => {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!supportedTypes.includes(fileExtension)) {
        this.snackBar.open(`Unsupported file type: ${file.name}`, 'Close', {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
        return;
      }

      if (file.size > maxSize) {
        this.snackBar.open(`File too large: ${file.name} (Max 10MB)`, 'Close', {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
        return;
      }

      if (!this.selectedFiles.find(f => f.name === file.name)) {
        this.selectedFiles.push(file);
      }
    });

    // Clear the file input
    event.target.value = '';
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  getFileIcon(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'picture_as_pdf';
      case 'docx':
      case 'doc':
        return 'description';
      default:
        return 'insert_drive_file';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  addQuickFocus(focus: string): void {
    if (!this.customInstructions.includes(focus)) {
      const separator = this.customInstructions ? '\n• ' : '• ';
      this.customInstructions += separator + focus;
    }
  }

  hasValidInput(): boolean {
    const hasValidUrl = this.companyUrls.some(url => url.trim() && this.isValidUrl(url));
    const hasFiles = this.selectedFiles.length > 0;
    return hasValidUrl || hasFiles;
  }

  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  }

  async processDocuments(): Promise<void> {
    if (this.selectedFiles.length === 0) {
      return;
    }

    this.currentStep = 2;
    this.loadingMessage = 'Processing uploaded documents...';

    try {
      const filesData = await Promise.all(
        this.selectedFiles.map(file => this.fileToBase64(file))
      );

      const payload = {
        files: filesData.map((content, index) => ({
          name: this.selectedFiles[index].name,
          content: content.split(',')[1] // Remove data:type;base64, prefix
        })),
        maxSizeMB: 10
      };

      const response = await this.http.post<any>('/api/companies/process-files', payload).toPromise();
      this.processedDocuments = response.processedFiles || [];

      const successCount = this.processedDocuments.filter(f => f.status === 'success').length;
      if (successCount > 0) {
        this.snackBar.open(`Successfully processed ${successCount} documents`, 'Close', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });
      }

      const errorCount = this.processedDocuments.length - successCount;
      if (errorCount > 0) {
        this.snackBar.open(`Failed to process ${errorCount} documents`, 'Close', {
          duration: 3000,
          panelClass: ['snackbar-warning']
        });
      }

    } catch (error) {
      console.error('Error processing documents:', error);
      this.snackBar.open('Failed to process documents', 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  async generateProfile(): Promise<void> {
    if (!this.hasValidInput()) {
      this.snackBar.open('Please provide at least one URL or upload documents.', 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    this.isLoading = true;
    this.currentStep = 1;
    this.loadingMessage = 'Scraping websites...';

    try {
      // Process documents first if any
      await this.processDocuments();

      // Prepare URLs (filter out empty ones)
      const validUrls = this.companyUrls.filter(url => url.trim() && this.isValidUrl(url));

      if (validUrls.length === 0 && this.processedDocuments.length === 0) {
        throw new Error('No valid URLs or processed documents available');
      }

      this.currentStep = 3;
      this.loadingMessage = 'Extracting company information...';

      // Prepare document content for API
      const documentContent = this.processedDocuments
        .filter(doc => doc.status === 'success' && doc.textContent)
        .map(doc => doc.textContent!);

      const documentNames = this.processedDocuments
        .filter(doc => doc.status === 'success' && doc.textContent)
        .map(doc => doc.filename);

      const request: any = {
        urls: validUrls,
        customInstructions: this.customInstructions.trim() || undefined,
        documentContent: documentContent.length > 0 ? documentContent : undefined,
        documentNames: documentNames.length > 0 ? documentNames : undefined
      };

      this.currentStep = 4;
      this.loadingMessage = 'Generating comprehensive profile...';

      const profile: CompanyProfile = await this.companyProfileService.generateProfile(request).toPromise();

      this.snackBar.open('Enhanced company profile generated successfully!', 'Close', {
        duration: 3000,
        panelClass: ['snackbar-success']
      });

      this.openProfileDialog(profile);

    } catch (error) {
      console.error('Error generating profile:', error);
      this.snackBar.open('Failed to generate profile. Please try again.', 'Close', {
        duration: 5000,
        panelClass: ['snackbar-error']
      });
    } finally {
      this.isLoading = false;
      this.currentStep = 0;
      this.loadingMessage = 'Initializing...';
    }
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
    this.companyUrls = [''];
    this.customInstructions = '';
    this.selectedFiles = [];
    this.processedDocuments = [];
    this.isLoading = false;
    this.currentStep = 0;
    this.loadingMessage = 'Initializing...';
    this.snackBar.dismiss();
  }
}
