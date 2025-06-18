import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-file-upload-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatCardModule
  ],
  templateUrl: './file-upload-modal.component.html',
  styleUrls: ['./file-upload-modal.component.scss']
})
export class FileUploadModalComponent {
  @Input() isOpen = false;
  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() fileSelected = new EventEmitter<any>();

  selectedFiles: File[] = [];
  dragOver = false;
  uploading = false;
  uploadProgress = 0;

  onFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      this.selectedFiles = Array.from(target.files);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.dragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.dragOver = false;
    
    if (event.dataTransfer?.files) {
      this.selectedFiles = Array.from(event.dataTransfer.files);
    }
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
  }

  uploadFiles() {
    if (this.selectedFiles.length === 0) return;
    
    this.uploading = true;
    this.uploadProgress = 0;
    
    // Simulate upload progress
    const interval = setInterval(() => {
      this.uploadProgress += 10;
      if (this.uploadProgress >= 100) {
        clearInterval(interval);
        this.uploading = false;
        
        // Emit file data
        const fileData = {
          files: this.selectedFiles.map(file => ({
            name: file.name,
            size: file.size,
            type: file.type,
            url: URL.createObjectURL(file) // In real app, this would be from server
          }))
        };
        
        this.fileSelected.emit(fileData);
        this.close();
      }
    }, 200);
  }

  close() {
    this.isOpen = false;
    this.isOpenChange.emit(false);
    this.selectedFiles = [];
    this.uploading = false;
    this.uploadProgress = 0;
  }

  getFileIcon(file: File): string {
    const type = file.type;
    if (type.includes('image')) return 'image';
    if (type.includes('video')) return 'movie';
    if (type.includes('audio')) return 'audiotrack';
    if (type.includes('pdf')) return 'picture_as_pdf';
    if (type.includes('word') || type.includes('document')) return 'description';
    if (type.includes('excel') || type.includes('spreadsheet')) return 'table_chart';
    return 'insert_drive_file';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
} 