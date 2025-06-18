import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-table-insert-modal',
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
  templateUrl: './table-insert-modal.component.html',
  styleUrls: ['./table-insert-modal.component.scss']
})
export class TableInsertModalComponent {
  @Input() isOpen = false;
  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() tableSelected = new EventEmitter<any>();

  rows = 3;
  cols = 3;

  close() {
    this.isOpen = false;
    this.isOpenChange.emit(false);
  }

  insertTable() {
    this.tableSelected.emit({ rows: this.rows, cols: this.cols });
    this.close();
  }

  getPreviewRows() {
    return Array(Math.min(this.rows, 5)).fill(0);
  }

  getPreviewCols() {
    return Array(Math.min(this.cols, 5)).fill(0);
  }
} 