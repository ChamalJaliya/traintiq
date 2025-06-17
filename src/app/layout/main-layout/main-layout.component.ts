import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { ChatBotComponent } from '../../shared/components/chat-bot/chat-bot.component';
import { TourComponent } from '../../shared/components/tour/tour.component';
import { TourLauncherComponent } from '../../shared/components/tour-launcher/tour-launcher.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDividerModule,
    ChatBotComponent,
    TourComponent,
    TourLauncherComponent
  ],
  template: `
    <mat-drawer-container class="app-container">
      <mat-drawer #drawer mode="side" class="app-sidenav" opened>
        <div class="sidenav-header">
          <div class="logo-container">
            <img src="/images/logo.png" alt="Traintiq Logo" class="logo-image">
          </div>
        </div>
        <mat-nav-list>
          <!-- Content Manager Section -->
          <div class="nav-section">
            <div class="nav-section-header">
              <mat-icon>video_library</mat-icon>
              <span>Content Manager</span>
            </div>
            <a mat-list-item routerLink="/content-manager/plans" routerLinkActive="active" class="nav-item">
              <mat-icon>school</mat-icon>
              <span>Training Plans</span>
            </a>
            <a mat-list-item routerLink="/content-manager/subject-builder/1" routerLinkActive="active" class="nav-item">
              <mat-icon>build</mat-icon>
              <span>Subject Builder</span>
            </a>
            <a mat-list-item routerLink="/content-manager/topic-editor/1" routerLinkActive="active" class="nav-item">
              <mat-icon>edit</mat-icon>
              <span>Topic Editor</span>
            </a>
            <a mat-list-item routerLink="/content-manager/content-viewer/1" routerLinkActive="active" class="nav-item">
              <mat-icon>visibility</mat-icon>
              <span>Content Viewer</span>
            </a>
          </div>

          <mat-divider class="nav-divider"></mat-divider>

          <!-- Question Grading Section -->
          <div class="nav-section">
            <div class="nav-section-header">
              <mat-icon>school</mat-icon>
              <span>Question Grading</span>
            </div>
            <a mat-list-item routerLink="/question-grading/create" routerLinkActive="active" class="nav-item">
              <mat-icon>add_circle</mat-icon>
              <span>Create Questions</span>
            </a>
            <a mat-list-item routerLink="/question-grading/answer" routerLinkActive="active" class="nav-item">
              <mat-icon>question_answer</mat-icon>
              <span>Answer Questions</span>
            </a>
          </div>

          <mat-divider class="nav-divider"></mat-divider>

          <!-- Company Section -->
          <div class="nav-section">
            <div class="nav-section-header">
              <mat-icon>business</mat-icon>
              <span>Company</span>
            </div>
            <a mat-list-item routerLink="/company/generator" routerLinkActive="active" class="nav-item">
              <mat-icon>auto_awesome</mat-icon>
              <span>Profile Generator</span>
            </a>
            <a mat-list-item routerLink="/company/history" routerLinkActive="active" class="nav-item">
              <mat-icon>history</mat-icon>
              <span>Generation History</span>
            </a>
            <a mat-list-item routerLink="/company/organization-chart" routerLinkActive="active">
          <mat-icon>account_tree</mat-icon>
          <span>Organization Chart</span>
        </a>
        <a mat-list-item routerLink="/company/organization-directory" routerLinkActive="active">
          <mat-icon>people</mat-icon>
          <span>Organization Directory</span>
        </a>
          </div>

          <!-- Employee Section -->
          <mat-divider class="nav-divider"></mat-divider>
          <div class="nav-section">
            <div class="nav-section-header">
              <mat-icon>groups</mat-icon>
              <span>Employee</span>
            </div>
            <a mat-list-item routerLink="/employee/analyzer" routerLinkActive="active" class="nav-item">
              <mat-icon>psychology</mat-icon>
              <span>CV Analyzer</span>
            </a>
            <a mat-list-item routerLink="/employee/profiles" routerLinkActive="active" class="nav-item">
              <mat-icon>badge</mat-icon>
              <span>Employee Profiles</span>
            </a>
            <a mat-list-item routerLink="/employee/talent-pool" routerLinkActive="active" class="nav-item">
              <mat-icon>group_work</mat-icon>
              <span>Talent Pool</span>
            </a>
          </div>
        </mat-nav-list>
      </mat-drawer>

      <mat-drawer-content>
        <mat-toolbar class="app-toolbar">
          <button mat-icon-button (click)="drawer.toggle()">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="toolbar-logo">Traintiq</span>
          <span class="flex-spacer"></span>
          <button mat-icon-button class="toolbar-action" matTooltip="Notifications">
            <mat-icon>notifications</mat-icon>
          </button>
          <button mat-icon-button class="toolbar-action" matTooltip="Profile">
            <mat-icon>account_circle</mat-icon>
          </button>
        </mat-toolbar>

        <div class="main-content">
          <router-outlet></router-outlet>
        </div>
        
        <!-- Chat Bot Component -->
        <app-chat-bot></app-chat-bot>
        
        <!-- Tour Components -->
        <app-tour></app-tour>
        <app-tour-launcher></app-tour-launcher>
      </mat-drawer-content>
    </mat-drawer-container>
  `,
  styles: [`
    // Container styles
    .app-container {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      background: #f8f9fa;

      ::ng-deep {
        .mat-drawer {
          background: #1a237e;
          
          .mat-drawer-inner-container {
            background: #1a237e;
            overflow-x: hidden;
            overflow-y: auto;
            height: 100vh;
          }
        }

        .mdc-list {
          background: #1a237e;
          padding: 16px 0;

          .mdc-list-item {
            padding: 0;
            margin: 4px 16px;
            height: 48px !important;
            
            &::before {
              margin: 0 8px;  // Add padding to the hover effect
            }
            
            .mdc-list-item__content {
              color: rgba(255, 255, 255, 0.85) !important;
              padding: 0 12px;
              height: 100%;
            }

            .mat-mdc-list-item-unscoped-content {
              color: rgba(255, 255, 255, 0.85) !important;
              display: flex;
              align-items: center;
              gap: 16px;
              height: 100%;
              padding-left: 8px;
            }

            .mat-icon {
              margin: 0;
              color: rgba(255, 255, 255, 0.85) !important;
              display: flex;
              align-items: center;
              justify-content: center;
              width: 24px;
              height: 24px;
            }

            span {
              margin-left: 0;
              font-size: 14px;
              line-height: 1.2;
              display: flex;
              align-items: center;
            }

            &:hover, &.active {
              .mat-mdc-list-item-unscoped-content {
                gap: 20px;
              }
            }
          }
        }
      }
    }

    // Sidenav styles
    .app-sidenav {
      width: 250px;
      
      .nav-section {
        margin-bottom: 12px;
        
        .nav-section-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 24px 12px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          position: relative;
          
          &::after {
            content: '';
            position: absolute;
            bottom: 6px;
            left: 24px;
            right: 24px;
            height: 1px;
            background: linear-gradient(90deg, 
              rgba(100, 181, 246, 0.3) 0%, 
              transparent 100%);
          }
          
          mat-icon {
            font-size: 18px;
            width: 18px;
            height: 18px;
            color: rgba(100, 181, 246, 0.8);
          }
        }
      }
      
      .nav-divider {
        background: linear-gradient(90deg, 
          transparent 0%, 
          rgba(100, 181, 246, 0.3) 20%, 
          rgba(100, 181, 246, 0.3) 80%, 
          transparent 100%);
        margin: 20px 16px;
        height: 1px;
        border: none;
        opacity: 0.6;
      }
      border: none;

      .sidenav-header {
        height: 140px;
        background: #151b60;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);

        .logo-container {
          width: 100%;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          
          .logo-image {
            height: 130%;
            width: auto;
            object-fit: contain;
            max-width: none;
            transition: transform 0.3s ease;
            transform-origin: center center;
            animation: logoFloat 3s ease-in-out infinite;
            
            @keyframes logoFloat {
              0% {
                transform: translateY(0) scale(1);
              }
              50% {
                transform: translateY(-8px) scale(1.05);
              }
              100% {
                transform: translateY(0) scale(1);
              }
            }
            
            &:hover {
              transform: scale(1.15);
              animation-play-state: paused;
              filter: brightness(1.1);
            }
          }
        }
      }

      ::ng-deep {
        .mat-drawer-inner-container {
          overflow-x: hidden;
          overflow-y: auto;
          height: 100vh;
          scroll-behavior: smooth;
          
          // Modern custom scrollbar styling
          &::-webkit-scrollbar {
            width: 8px;
          }
          
          &::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 4px;
          }
          
          &::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, 
              rgba(100, 181, 246, 0.8) 0%, 
              rgba(63, 81, 181, 0.8) 100%);
            border-radius: 4px;
            border: 2px solid transparent;
            background-clip: content-box;
            transition: all 0.3s ease;
            
            &:hover {
              background: linear-gradient(180deg, 
                rgba(100, 181, 246, 1) 0%, 
                rgba(63, 81, 181, 1) 100%);
              border-radius: 6px;
              width: 10px;
            }
            
            &:active {
              background: linear-gradient(180deg, 
                rgba(33, 150, 243, 1) 0%, 
                rgba(48, 63, 159, 1) 100%);
            }
          }
          
          &::-webkit-scrollbar-corner {
            background: transparent;
          }
          
          // Firefox scrollbar styling
          scrollbar-width: thin;
          scrollbar-color: rgba(100, 181, 246, 0.8) rgba(255, 255, 255, 0.05);
        }

        .mat-nav-list {
          padding: 8px 0;

          .mat-mdc-list-item {
            --mdc-list-list-item-label-text-color: rgba(255, 255, 255, 0.85);
            --mdc-list-list-item-supporting-text-color: rgba(255, 255, 255, 0.85);
            --mdc-list-list-item-leading-icon-color: rgba(255, 255, 255, 0.85);
            --mat-list-item-unselected-hover-state-layer-color: rgba(255, 255, 255, 0.08);
            
            &.nav-item {
              height: 48px;
              margin: 4px 8px;
              border-radius: 8px;
              font-weight: 400;
              letter-spacing: 0.15px;
              transition: all 0.3s ease;
              position: relative;
              overflow: hidden;

              .mdc-list-item__content {
                color: rgba(255, 255, 255, 0.85);
              }

              .mat-icon {
                margin-right: 16px;
                transition: all 0.3s ease;
              }

              span {
                font-size: 14px;
                transition: all 0.3s ease;
              }

              &::before {
                content: '';
                position: absolute;
                left: 0;
                top: 0;
                height: 100%;
                width: 0;
                background: linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
                transition: width 0.3s ease;
              }

              &:hover {
                background: rgba(255, 255, 255, 0.08);

                &::before {
                  width: 100%;
                }

                .mat-icon {
                  color: white !important;
                  transform: scale(1.1);
                }

                span {
                  transform: translateX(4px);
                  color: white !important;
                }
              }

              &.active {
                background: rgba(255, 255, 255, 0.15);
                font-weight: 500;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

                .mdc-list-item__content {
                  color: white;
                }

                .mat-icon {
                  color: #64b5f6 !important;
                  transform: scale(1.1);
                }

                span {
                  transform: translateX(4px);
                  color: white !important;
                }

                &::after {
                  content: '';
                  position: absolute;
                  left: 0;
                  top: 0;
                  bottom: 0;
                  width: 4px;
                  background: #64b5f6;
                  box-shadow: 0 0 8px rgba(100, 181, 246, 0.5);
                  border-radius: 0 4px 4px 0;
                }

                &:hover {
                  background: rgba(255, 255, 255, 0.2);
                }
              }
            }
          }
        }
      }
    }

    // Toolbar styles
    .app-toolbar {
      background: white;
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);
      height: 64px;

      .toolbar-logo {
        margin-left: 16px;
        font-size: 20px;
        font-weight: 500;
        color: #1a237e;
      }

      .flex-spacer {
        flex: 1;
      }

      .toolbar-action {
        margin-left: 8px;
        color: rgba(0, 0, 0, 0.54);

        &:hover {
          color: #1a237e;
        }
      }
    }

    // Main content styles
    .main-content {
      padding: 24px;
      height: calc(100vh - 64px);
      overflow-y: auto;
      background: linear-gradient(135deg, #f6f8ff 0%, #f0f4ff 100%);
    }

    .nav-section {
      margin: 8px 0;

      .nav-section-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 24px 8px;
        color: rgba(255, 255, 255, 0.7);
        font-size: 13px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;

        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
          opacity: 0.9;
        }
      }
    }

    .nav-divider {
      margin: 16px 0;
      border-color: rgba(255, 255, 255, 0.1);
    }
  `]
})
export class MainLayoutComponent { } 