import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { RichEditorFormatComponent } from './format/rich-editor-format.component';
import { RichEditorInsertComponent } from './insert/rich-editor-insert.component';
import { VideoInsertModalComponent } from './modals/video-insert-modal/video-insert-modal.component';
import { ImageInsertModalComponent } from './modals/image-insert-modal/image-insert-modal.component';
import { TableInsertModalComponent } from './modals/table-insert-modal/table-insert-modal.component';
import { LinkInsertModalComponent } from './modals/link-insert-modal/link-insert-modal.component';
import { FileUploadModalComponent } from './modals/file-upload-modal/file-upload-modal.component';

@Component({
  selector: 'app-rich-editor',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTooltipModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
    RichEditorFormatComponent,
    RichEditorInsertComponent,
    VideoInsertModalComponent,
    ImageInsertModalComponent,
    TableInsertModalComponent,
    LinkInsertModalComponent,
    FileUploadModalComponent
  ],
  templateUrl: './rich-editor.component.html',
  styleUrls: ['./rich-editor.component.scss']
})
export class RichEditorComponent implements OnInit, AfterViewInit {
  @Input() content: string = '';
  @Input() placeholder: string = 'Start typing...';
  @Output() contentChange = new EventEmitter<string>();
  @Output() selectionChange = new EventEmitter<string>();

  @ViewChild('editorContent', { static: true }) editorContent!: ElementRef<HTMLDivElement>;

  // Modal states
  modals = {
    video: false,
    image: false,
    table: false,
    link: false,
    file: false
  };

  ngOnInit() {
    // Initialize the editor
    if (this.editorContent) {
      this.editorContent.nativeElement.innerHTML = this.content;
    }
  }

  ngAfterViewInit() {
    this.forceCorrectDirection();
  }

  private forceCorrectDirection() {
    if (this.editorContent) {
      const editor = this.editorContent.nativeElement;
      editor.style.direction = 'ltr';
      editor.style.textAlign = 'start';
      editor.style.unicodeBidi = 'embed';
      editor.style.writingMode = 'horizontal-tb';
      editor.setAttribute('dir', 'ltr');
    }
  }

  onContentChange(event: Event) {
    const target = event.target as HTMLDivElement;
    
    // Force LTR direction and proper text flow
    target.style.direction = 'ltr';
    target.style.textAlign = 'start';
    target.style.unicodeBidi = 'embed';
    target.style.writingMode = 'horizontal-tb';
    
    this.content = target.innerHTML;
    this.contentChange.emit(this.content);
  }

  onContentBlur() {
    this.contentChange.emit(this.content);
  }

  onKeyDown(event: KeyboardEvent) {
    // Handle keyboard shortcuts
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 'b':
          event.preventDefault();
          this.executeFormatCommand({ type: 'bold' });
          break;
        case 'i':
          event.preventDefault();
          this.executeFormatCommand({ type: 'italic' });
          break;
        case 'u':
          event.preventDefault();
          this.executeFormatCommand({ type: 'underline' });
          break;
        case 'z':
          event.preventDefault();
          if (event.shiftKey) {
            // Ctrl+Shift+Z = Redo
            console.log('Redo triggered via Ctrl+Shift+Z');
            this.executeFormatCommand({ type: 'redo' });
          } else {
            // Ctrl+Z = Undo
            console.log('Undo triggered via Ctrl+Z');
            this.executeFormatCommand({ type: 'undo' });
          }
          break;
        case 'y':
          // Ctrl+Y = Redo (alternative)
          event.preventDefault();
          console.log('Redo triggered via Ctrl+Y');
          this.executeFormatCommand({ type: 'redo' });
          break;
      }
    }
  }

  onTextSelection() {
    const selection = this.getSelectedText();
    this.selectionChange.emit(selection);
  }

  getSelectedText(): string {
    const selection = window.getSelection();
    return selection ? selection.toString() : '';
  }

  executeFormatCommand(command: any) {
    const editor = this.editorContent.nativeElement;
    editor.focus();

    switch (command.type) {
      case 'bold':
        document.execCommand('bold');
        break;
      case 'italic':
        document.execCommand('italic');
        break;
      case 'underline':
        document.execCommand('underline');
        break;
      case 'strikethrough':
        document.execCommand('strikeThrough');
        break;
      case 'style':
        document.execCommand('formatBlock', false, command.value);
        break;
      case 'fontName':
        document.execCommand('fontName', false, command.value);
        break;
      case 'fontSize':
        // Use execCommand for better compatibility
        document.execCommand('fontSize', false, '7'); // Set to largest first
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          if (!range.collapsed) {
            const span = document.createElement('span');
            span.style.fontSize = command.value;
            try {
              range.surroundContents(span);
            } catch (e) {
              span.appendChild(range.extractContents());
              range.insertNode(span);
            }
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
        break;
      case 'foreColor':
        document.execCommand('foreColor', false, command.value);
        break;
      case 'backColor':
      case 'hiliteColor':
        document.execCommand('hiliteColor', false, command.value);
        break;
      case 'justifyLeft':
        document.execCommand('justifyLeft');
        break;
      case 'justifyCenter':
        document.execCommand('justifyCenter');
        break;
      case 'justifyRight':
        document.execCommand('justifyRight');
        break;
      case 'justifyFull':
        document.execCommand('justifyFull');
        break;
      case 'insertUnorderedList':
        document.execCommand('insertUnorderedList');
        break;
      case 'insertOrderedList':
        document.execCommand('insertOrderedList');
        break;
      case 'indent':
        document.execCommand('indent');
        break;
      case 'outdent':
        document.execCommand('outdent');
        break;
      case 'createLink':
        const url = prompt('Enter URL:');
        if (url) {
          document.execCommand('createLink', false, url);
        }
        break;
      case 'unlink':
        document.execCommand('unlink');
        break;
      case 'removeFormat':
        document.execCommand('removeFormat');
        break;
      case 'undo':
        document.execCommand('undo');
        break;
      case 'redo':
        document.execCommand('redo');
        break;
    }

    this.onContentChange({ target: editor } as any);
  }

  executeInsertCommand(command: any) {
    switch (command.type) {
      case 'video':
        this.openInsertModal('video');
        break;
      case 'image':
        this.openInsertModal('image');
        break;
      case 'table':
        this.openInsertModal('table');
        break;
      case 'link':
        this.openInsertModal('link');
        break;
      case 'file':
        this.openInsertModal('file');
        break;
      case 'emoji':
        this.insertEmoji(command.value);
        break;
      case 'icon':
        this.insertIcon(command.value);
        break;
      case 'html':
        this.insertHTML(command.value);
        break;
      case 'divider':
        this.insertDivider();
        break;
      default:
        console.log('Insert command not handled:', command);
        break;
    }
  }

  openInsertModal(type: string) {
    this.modals = { video: false, image: false, table: false, link: false, file: false };
    (this.modals as any)[type] = true;
  }

  onVideoInserted(videoData: any) {
    this.insertVideo(videoData.embedCode);
  }

  onImageInserted(imageData: any) {
    this.insertImage(imageData.url, imageData.alt, imageData.caption);
  }

  onTableInserted(tableData: any) {
    this.insertTable(tableData.rows, tableData.cols);
  }

  onLinkInserted(linkData: any) {
    this.insertLink(linkData.url, linkData.text);
  }

  onFileUploaded(fileData: any) {
    if (fileData.files && fileData.files.length > 0) {
      fileData.files.forEach((file: any) => {
        this.insertFile(file.name, file.url, file.size);
      });
    }
  }

  private insertImage(src: string, alt: string = '', caption: string = '') {
    const editor = this.editorContent.nativeElement;
    editor.focus();
    
    let html = `<img src="${src}" alt="${alt}" style="max-width: 100%; height: auto;">`;
    if (caption) {
      html = `<div class="image-with-caption">${html}<p class="image-caption">${caption}</p></div>`;
    }
    
    document.execCommand('insertHTML', false, html);
    this.onContentChange({ target: editor } as any);
  }

  private insertVideo(embedCode: string) {
    const editor = this.editorContent.nativeElement;
    editor.focus();
    const html = `<div class="video-embed">${embedCode}</div>`;
    document.execCommand('insertHTML', false, html);
    this.onContentChange({ target: editor } as any);
  }

  private insertTable(rows: number, cols: number) {
    const editor = this.editorContent.nativeElement;
    editor.focus();
    
    let html = '<table border="1" style="border-collapse: collapse; width: 100%;">';
    for (let i = 0; i < rows; i++) {
      html += '<tr>';
      for (let j = 0; j < cols; j++) {
        if (i === 0) {
          html += '<th style="padding: 8px; background: #f5f5f5;">Header</th>';
        } else {
          html += '<td style="padding: 8px;">Cell</td>';
        }
      }
      html += '</tr>';
    }
    html += '</table>';
    
    document.execCommand('insertHTML', false, html);
    this.onContentChange({ target: editor } as any);
  }

  private insertLink(url: string, text: string) {
    const editor = this.editorContent.nativeElement;
    editor.focus();
    const html = `<a href="${url}" target="_blank">${text}</a>`;
    document.execCommand('insertHTML', false, html);
    this.onContentChange({ target: editor } as any);
  }

  private insertEmoji(emoji: string) {
    console.log('Rich editor inserting emoji:', emoji); // Debug log
    const editor = this.editorContent.nativeElement;
    
    // Make sure editor is focused and has cursor position
    editor.focus();
    
    // Create a selection range if one doesn't exist
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      // Set cursor to end of content
      const range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
    
    // Insert emoji with space
    const emojiWithSpace = emoji + ' ';
    const success = document.execCommand('insertHTML', false, emojiWithSpace);
    
    console.log('Emoji insertion success:', success, 'Content:', editor.innerHTML);
    
    // Trigger content change
    this.onContentChange({ target: editor } as any);
  }

  private insertIcon(icon: string) {
    console.log('Rich editor inserting icon:', icon); // Debug log
    const editor = this.editorContent.nativeElement;
    editor.focus();
    const html = `<span class="inline-icon" style="font-family: 'Material Icons'; font-size: 18px; color: #1976d2; margin: 0 4px;">${icon}</span> `;
    document.execCommand('insertHTML', false, html);
    this.onContentChange({ target: editor } as any);
  }

  private insertDivider() {
    const editor = this.editorContent.nativeElement;
    editor.focus();
    const html = '<hr>';
    document.execCommand('insertHTML', false, html);
    this.onContentChange({ target: editor } as any);
  }

  private insertHTML(html: string) {
    const editor = this.editorContent.nativeElement;
    editor.focus();
    document.execCommand('insertHTML', false, html);
    this.onContentChange({ target: editor } as any);
  }

  private insertFile(name: string, url: string, size: number) {
    const editor = this.editorContent.nativeElement;
    editor.focus();
    const fileSize = this.formatFileSize(size);
    const html = `<div class="file-attachment">
      <mat-icon>attach_file</mat-icon>
      <a href="${url}" target="_blank">${name}</a>
      <span class="file-size">(${fileSize})</span>
    </div>`;
    document.execCommand('insertHTML', false, html);
    this.onContentChange({ target: editor } as any);
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
} 