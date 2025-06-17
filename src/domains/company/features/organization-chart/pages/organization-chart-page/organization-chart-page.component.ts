import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Subject, takeUntil } from 'rxjs';

import { OrganizationService } from '../../../../data/organization.service';
import { OrganizationNode, Employee } from '../../../../models/organization.model';

@Component({
  selector: 'app-organization-chart-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatMenuModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    DragDropModule
  ],
  templateUrl: './organization-chart-page.component.html',
  styleUrl: './organization-chart-page.component.scss'
})
export class OrganizationChartPageComponent implements OnInit, OnDestroy {
  organizationTree: OrganizationNode[] = [];
  isLoading = true;
  viewMode: 'tree' | 'compact' = 'tree';
  showLevels = true;
  private destroy$ = new Subject<void>();

  constructor(
    private organizationService: OrganizationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadOrganizationChart();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadOrganizationChart(): void {
    this.isLoading = true;
    this.organizationService.buildOrganizationTree()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tree) => {
          this.organizationTree = tree;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading organization chart:', error);
          this.isLoading = false;
        }
      });
  }

  toggleNode(node: OrganizationNode): void {
    node.expanded = !node.expanded;
  }

  onEditEmployee(employee: Employee): void {
    console.log('Edit employee:', employee);
    // TODO: Open edit dialog
  }

  onViewEmployee(employee: Employee): void {
    console.log('View employee:', employee);
    // TODO: Open view dialog
  }

  onAddDirectReport(manager: Employee | null): void {
    console.log('Add direct report to:', manager);
    // TODO: Open add employee dialog
  }

  onDeleteEmployee(employee: Employee): void {
    if (confirm('Are you sure you want to remove this employee from the organization?')) {
      this.organizationService.deleteEmployee(employee.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.loadOrganizationChart();
        });
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return '#4caf50';
      case 'inactive': return '#f44336';
      case 'on-leave': return '#ff9800';
      default: return '#9e9e9e';
    }
  }

  getDepartmentColor(department: string): string {
    const colors: { [key: string]: string } = {
      'Executive': '#1a237e',
      'Technology': '#0d47a1',
      'Human Resources': '#e65100',
      'Product': '#2e7d32',
      'Design': '#7b1fa2',
      'Marketing': '#c62828',
      'Sales': '#5d4037',
      'Finance': '#455a64'
    };
    return colors[department] || '#616161';
  }

  refreshChart(): void {
    this.loadOrganizationChart();
  }

  onDrop(event: CdkDragDrop<Employee[]>, targetManagerId?: string): void {
    const draggedEmployee = event.item.data as Employee;
    
    if (event.previousContainer === event.container) {
      // Reordering within same manager
      return;
    }

    // Update employee's manager
    this.organizationService.updateEmployee(draggedEmployee.id, { 
      managerId: targetManagerId 
    }).pipe(takeUntil(this.destroy$))
    .subscribe(() => {
      this.loadOrganizationChart();
    });
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'tree' ? 'compact' : 'tree';
  }

  toggleLevels(): void {
    this.showLevels = !this.showLevels;
  }

  getNodeLevel(node: OrganizationNode): string {
    const levels = ['CEO', 'C-Level', 'Director', 'Manager', 'Senior', 'Associate', 'Junior'];
    return levels[Math.min(node.level, levels.length - 1)] || `Level ${node.level}`;
  }

  isRootNode(node: OrganizationNode): boolean {
    return node.level === 0;
  }

  getTreeConnectorStyle(node: OrganizationNode): any {
    return {
      'height': `${Math.max(60, node.children.length * 20)}px`,
      'left': '50%',
      'top': '100%'
    };
  }

  getLevelColor(level: number): string {
    const colors = ['#1a237e', '#3f51b5', '#2196f3', '#00bcd4', '#4caf50', '#ff9800', '#f44336'];
    return colors[level % colors.length];
  }

  getLevelLabel(index: number): string {
    const levels = ['CEO', 'C-Level', 'Director', 'Manager', 'Senior', 'Associate', 'Junior'];
    return levels[index] || `Level ${index}`;
  }

  getChildEmployees(node: OrganizationNode): Employee[] {
    return node.children.map(child => child.employee);
  }
} 