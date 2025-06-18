import { Component, Output, EventEmitter, Input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-rich-editor-format',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDividerModule,
    FormsModule
  ],
  templateUrl: './rich-editor-format.component.html',
  styleUrls: ['./rich-editor-format.component.scss']
})
export class RichEditorFormatComponent {
  @Input() selectedText: string = '';
  @Output() formatCommand = new EventEmitter<any>();

  selectedStyle = 'p';
  selectedFont = 'Arial';
  selectedSize = '14px';
  showTextColorPicker = false;
  showHighlightPicker = false;

  textColors = [
    '#000000', '#333333', '#666666', '#999999', '#cccccc', '#ffffff',
    '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
    '#ff6600', '#ff3399', '#9933ff', '#33ff99', '#3399ff', '#99ff33'
  ];

  highlightColors = [
    '#ffff00', '#00ff00', '#00ffff', '#ff00ff', '#ff6600', '#ff3399'
  ];

  executeCommand(command: string) {
    this.formatCommand.emit({ type: command });
  }

  onStyleChange(event: any) {
    this.formatCommand.emit({ type: 'style', value: event.value });
  }

  onFontChange(event: any) {
    this.formatCommand.emit({ type: 'fontName', value: event.value });
  }

  onSizeChange(event: any) {
    this.formatCommand.emit({ type: 'fontSize', value: event.value });
  }

  setTextColor(color: string) {
    this.formatCommand.emit({ type: 'foreColor', value: color });
    this.showTextColorPicker = false;
  }

  setHighlightColor(color: string) {
    this.formatCommand.emit({ type: 'backColor', value: color });
    this.showHighlightPicker = false;
  }

  isFormatActive(format: string): boolean {
    try {
      return document.queryCommandState(format);
    } catch (e) {
      return false;
    }
  }

  isAlignmentActive(alignment: string): boolean {
    try {
      switch (alignment) {
        case 'left': return document.queryCommandState('justifyLeft');
        case 'center': return document.queryCommandState('justifyCenter');
        case 'right': return document.queryCommandState('justifyRight');
        case 'justify': return document.queryCommandState('justifyFull');
        default: return false;
      }
    } catch (e) {
      return false;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    // Close color pickers when clicking outside
    this.showTextColorPicker = false;
    this.showHighlightPicker = false;
  }
} 