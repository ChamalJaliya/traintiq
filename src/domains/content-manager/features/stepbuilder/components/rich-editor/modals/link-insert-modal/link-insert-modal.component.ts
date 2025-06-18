import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-link-insert-modal',
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
  templateUrl: './link-insert-modal.component.html',
  styleUrls: ['./link-insert-modal.component.scss']
})
export class LinkInsertModalComponent {
  @Input() isOpen = false;
  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() linkSelected = new EventEmitter<any>();

  url = '';
  text = '';

  close() {
    this.isOpen = false;
    this.isOpenChange.emit(false);
    this.resetForm();
  }

  insertLink() {
    if (!this.url) return;

    const linkData = {
      url: this.url,
      text: this.text || this.url
    };

    this.linkSelected.emit(linkData);
    this.close();
  }

  private resetForm() {
    this.url = '';
    this.text = '';
  }
} 