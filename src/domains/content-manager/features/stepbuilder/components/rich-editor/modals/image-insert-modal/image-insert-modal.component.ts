import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-image-insert-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  templateUrl: './image-insert-modal.component.html',
  styleUrls: ['./image-insert-modal.component.scss']
})
export class ImageInsertModalComponent {
  @Input() isOpen = false;
  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() imageSelected = new EventEmitter<any>();

  imageUrl = '';
  altText = '';
  caption = '';

  close() {
    this.isOpen = false;
    this.isOpenChange.emit(false);
    this.resetForm();
  }

  insertImage() {
    if (!this.imageUrl) return;

    const imageData = {
      url: this.imageUrl,
      alt: this.altText || 'Image',
      caption: this.caption
    };

    this.imageSelected.emit(imageData);
    this.close();
  }

  hideImage(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.style.display = 'none';
    }
  }

  private resetForm() {
    this.imageUrl = '';
    this.altText = '';
    this.caption = '';
  }
} 