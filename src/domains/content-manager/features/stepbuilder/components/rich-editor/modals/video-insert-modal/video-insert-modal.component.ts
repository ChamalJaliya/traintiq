import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-video-insert-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
    FormsModule
  ],
  templateUrl: './video-insert-modal.component.html',
  styleUrls: ['./video-insert-modal.component.scss']
})
export class VideoInsertModalComponent {
  @Input() isOpen = false;
  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() videoSelected = new EventEmitter<any>();

  videoUrl = '';
  videoTitle = '';
  selectedPlatform = 'youtube';
  
  platforms = [
    { value: 'youtube', label: 'YouTube', icon: 'video_library' },
    { value: 'vimeo', label: 'Vimeo', icon: 'video_camera_front' },
    { value: 'loom', label: 'Loom', icon: 'record_voice_over' },
    { value: 'custom', label: 'Custom URL', icon: 'link' }
  ];

  close() {
    this.isOpen = false;
    this.isOpenChange.emit(false);
    this.resetForm();
  }

  insertVideo() {
    if (!this.videoUrl) return;

    const videoData = {
      url: this.videoUrl,
      title: this.videoTitle || 'Video',
      platform: this.selectedPlatform,
      embedCode: this.generateEmbedCode()
    };

    this.videoSelected.emit(videoData);
    this.close();
  }

  private generateEmbedCode(): string {
    let embedCode = '';
    
    if (this.videoUrl.includes('youtube.com') || this.videoUrl.includes('youtu.be')) {
      const videoId = this.extractYouTubeId(this.videoUrl);
      embedCode = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
    } else if (this.videoUrl.includes('vimeo.com')) {
      const videoId = this.extractVimeoId(this.videoUrl);
      embedCode = `<iframe src="https://player.vimeo.com/video/${videoId}" width="560" height="315" frameborder="0" allowfullscreen></iframe>`;
    } else if (this.videoUrl.includes('loom.com')) {
      embedCode = `<iframe src="${this.videoUrl}" width="560" height="315" frameborder="0" allowfullscreen></iframe>`;
    } else {
      embedCode = `<video controls width="560" height="315"><source src="${this.videoUrl}" type="video/mp4">Your browser does not support the video tag.</video>`;
    }
    
    return embedCode;
  }

  private extractYouTubeId(url: string): string {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  }

  private extractVimeoId(url: string): string {
    const regExp = /vimeo.com\/(\d+)/;
    const match = url.match(regExp);
    return match ? match[1] : '';
  }

  private resetForm() {
    this.videoUrl = '';
    this.videoTitle = '';
    this.selectedPlatform = 'youtube';
  }

  onPlatformChange(platform: string) {
    this.selectedPlatform = platform;
  }

  getPlaceholderText(): string {
    switch (this.selectedPlatform) {
      case 'youtube':
        return 'Enter YouTube URL (e.g., https://www.youtube.com/watch?v=...)';
      case 'vimeo':
        return 'Enter Vimeo URL (e.g., https://vimeo.com/...)';
      case 'loom':
        return 'Enter Loom URL (e.g., https://www.loom.com/share/...)';
      default:
        return 'Enter video URL';
    }
  }
} 