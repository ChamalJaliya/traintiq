import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';

import { CVAnalysisService } from '../../../../data/cv-analysis.service';
import { CVAnalysis } from '../../../../../../shared/models/employee-profile.model';

@Component({
  selector: 'app-analyzer-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule,
    RouterModule
  ],
  templateUrl: './analyzer-page.component.html',
  styleUrls: ['./analyzer-page.component.scss']
})
export class AnalyzerPageComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  selectedFile: File | null = null;
  isAnalyzing = false;
  isDragging = false;
  analysisResults: CVAnalysis | null = null;

  constructor(
    private cvAnalysisService: CVAnalysisService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const element = event.target as HTMLInputElement;
    const files = element.files;
    if (files?.length) {
      this.handleFile(files[0]);
    }
  }

  getConfidenceClass(confidence: number): string {
    if (confidence >= 0.8) return 'confidence-high';
    if (confidence >= 0.6) return 'confidence-medium';
    return 'confidence-low';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.handleFile(files[0]);
    }
  }

  handleFile(file: File): void {
    if (!this.isValidFileType(file)) {
      this.snackBar.open('Please upload a PDF or Word document', 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    this.selectedFile = file;
    this.analyzeCV();
  }

  removeFile(): void {
    this.selectedFile = null;
    this.analysisResults = null;
  }

  private isValidFileType(file: File): boolean {
    const validTypes = ['.pdf', '.doc', '.docx'];
    return validTypes.some(type => file.name.toLowerCase().endsWith(type));
  }

  analyzeCV(): void {
    if (!this.selectedFile) return;

    this.isAnalyzing = true;
    this.analysisResults = null;

    this.cvAnalysisService.analyzeCV(this.selectedFile).subscribe({
      next: (results) => {
        this.analysisResults = results;
        this.snackBar.open('CV analysis completed successfully', 'Close', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });
      },
      error: (error) => {
        console.error('Error analyzing CV:', error);
        this.snackBar.open('Failed to analyze CV. Please try again.', 'Close', {
          duration: 5000,
          panelClass: ['snackbar-error']
        });
      },
      complete: () => {
        this.isAnalyzing = false;
      }
    });
  }

  downloadAnalysis(): void {
    if (!this.analysisResults) return;

    const jsonString = JSON.stringify(this.analysisResults, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cv-analysis.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  generateProfile(): void {
    if (!this.analysisResults) return;

    this.cvAnalysisService.generateProfile(this.analysisResults).subscribe({
      next: (profile) => {
        this.snackBar.open('Employee profile generated successfully', 'Close', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });
        this.router.navigate(['../profiles', profile._id], { relativeTo: this.route });
      },
      error: (error) => {
        console.error('Error generating profile:', error);
        this.snackBar.open('Failed to generate profile. Please try again.', 'Close', {
          duration: 5000,
          panelClass: ['snackbar-error']
        });
      }
    });
  }
} 