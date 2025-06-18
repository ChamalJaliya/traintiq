import { Component, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-rich-editor-insert',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './rich-editor-insert.component.html',
  styleUrls: ['./rich-editor-insert.component.scss']
})
export class RichEditorInsertComponent {
  @Output() insertCommand = new EventEmitter<any>();
  @Output() openModal = new EventEmitter<string>();

  showEmojiPicker = false;
  showIconPicker = false;

  emojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
    '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
    '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
    '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬'
  ];

  materialIcons = [
    'favorite', 'star', 'thumb_up', 'thumb_down', 'share', 'bookmark',
    'flag', 'info', 'warning', 'error', 'check_circle', 'cancel',
    'help', 'lightbulb', 'key', 'lock', 'visibility', 'visibility_off',
    'search', 'home', 'menu', 'settings', 'account_circle', 'person',
    'group', 'email', 'phone', 'location_on', 'schedule', 'today',
    'event', 'work', 'school', 'shopping_cart', 'payment', 'credit_card'
  ];

  onInsert(type: string) {
    if (['video', 'image', 'table', 'link', 'file'].includes(type)) {
      this.openModal.emit(type);
    } else {
      // Handle direct insert commands
      switch (type) {
        case 'audio':
          this.insertCommand.emit({ type: 'html', value: '<audio controls><source src="" type="audio/mpeg">Your browser does not support the audio element.</audio>' });
          break;
        case 'iframe':
          const iframeUrl = prompt('Enter iframe URL:');
          if (iframeUrl) {
            this.insertCommand.emit({ type: 'html', value: `<iframe src="${iframeUrl}" width="100%" height="300" frameborder="0"></iframe>` });
          }
          break;
        case 'columns':
          this.insertCommand.emit({ type: 'html', value: '<div class="two-column-layout"><div class="column">Column 1</div><div class="column">Column 2</div></div>' });
          break;
        case 'divider':
          this.insertCommand.emit({ type: 'html', value: '<hr class="custom-divider">' });
          break;
        case 'spacer':
          this.insertCommand.emit({ type: 'html', value: '<div class="spacer" style="height: 20px;"></div>' });
          break;
        case 'module':
          this.insertCommand.emit({ type: 'html', value: '<div class="training-module"><h4>Training Module</h4><p>Module content goes here</p></div>' });
          break;
        default:
          this.insertCommand.emit({ type });
      }
    }
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
    this.showIconPicker = false;
  }

  toggleIconPicker() {
    this.showIconPicker = !this.showIconPicker;
    this.showEmojiPicker = false;
  }

  insertEmoji(emoji: string) {
    console.log('Inserting emoji:', emoji); // Debug log
    this.insertCommand.emit({ type: 'emoji', value: emoji });
    this.showEmojiPicker = false;
  }

  insertIcon(icon: string) {
    console.log('Inserting icon:', icon); // Debug log
    this.insertCommand.emit({ type: 'icon', value: icon });
    this.showIconPicker = false;
  }

  closeAllPickers() {
    this.showEmojiPicker = false;
    this.showIconPicker = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    // Close pickers when clicking outside
    this.showEmojiPicker = false;
    this.showIconPicker = false;
  }
} 