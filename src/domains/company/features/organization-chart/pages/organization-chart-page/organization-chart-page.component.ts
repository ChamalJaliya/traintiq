import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
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

interface DepartmentBranch {
  name: string;
  employees: Employee[];
}

interface TreeConnection {
  path: string;
  highlighted?: boolean;
}

interface NodePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

@Component({
  selector: 'app-organization-chart-page',
  standalone: true,
  imports: [
    CommonModule,
    TitleCasePipe,
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
  departmentBranches: DepartmentBranch[] = [];
  isLoading = true;
  viewMode: 'tree' | 'compact' | 'branch' = 'tree';
  showLevels = true;
  isFullscreen = false;
  
  // Zoom and Pan properties
  zoomLevel = 1;
  panX = 0;
  panY = 0;
  isAnimating = false;
  isPanning = false;
  lastPanPoint = { x: 0, y: 0 };
  
  // Tree layout properties
  svgWidth = 1600;
  svgHeight = 1000;
  treeConnections: TreeConnection[] = [];
  nodePositions = new Map<string, NodePosition>();
  
  // Math reference for template
  Math = Math;

  getZoomPercentage(): number {
    return Math.round(this.zoomLevel * 100);
  }
  
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

  // Zoom and Pan methods
  zoomIn(): void {
    this.zoomLevel = Math.min(this.zoomLevel * 1.2, 3);
  }

  zoomOut(): void {
    this.zoomLevel = Math.max(this.zoomLevel / 1.2, 0.2);
  }

  resetZoom(): void {
    this.isAnimating = true;
    this.zoomLevel = 1;
    this.panX = 0;
    this.panY = 0;
    setTimeout(() => this.isAnimating = false, 300);
  }

  fitToScreen(): void {
    this.isAnimating = true;
    this.calculateFitToScreen();
    setTimeout(() => this.isAnimating = false, 300);
  }

  private calculateFitToScreen(): void {
    // Calculate bounds of all nodes
    const bounds = this.calculateTreeBounds();
    if (!bounds) return;

    // Use the actual viewport dimensions
    const viewportWidth = 1000; // Width of the interactive viewport
    const viewportHeight = 600; // Height of the interactive viewport
    const padding = 40;

    // Calculate scale to fit content with padding
    const scaleX = (viewportWidth - padding * 2) / bounds.width;
    const scaleY = (viewportHeight - padding * 2) / bounds.height;
    this.zoomLevel = Math.min(scaleX, scaleY, 1); // Don't scale up beyond 100%

    // Calculate pan to center the content in the viewport
    const scaledWidth = bounds.width * this.zoomLevel;
    const scaledHeight = bounds.height * this.zoomLevel;
    
    this.panX = (viewportWidth - scaledWidth) / 2 - bounds.x * this.zoomLevel;
    this.panY = (viewportHeight - scaledHeight) / 2 - bounds.y * this.zoomLevel;
  }

  private calculateTreeBounds(): { x: number, y: number, width: number, height: number } | null {
    if (this.nodePositions.size === 0) return null;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    this.nodePositions.forEach(pos => {
      minX = Math.min(minX, pos.x);
      minY = Math.min(minY, pos.y);
      maxX = Math.max(maxX, pos.x + pos.width);
      maxY = Math.max(maxY, pos.y + pos.height);
    });

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  onMouseWheel(event: WheelEvent): void {
    event.preventDefault();
    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(Math.max(this.zoomLevel * delta, 0.2), 3);
    
    // Zoom towards mouse position
    const rect = (event.target as Element).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    this.panX = x - (x - this.panX) * (newZoom / this.zoomLevel);
    this.panY = y - (y - this.panY) * (newZoom / this.zoomLevel);
    this.zoomLevel = newZoom;
  }

  onPanStart(event: MouseEvent): void {
    this.isPanning = true;
    this.lastPanPoint = { x: event.clientX, y: event.clientY };
    event.preventDefault();
  }

  onPanMove(event: MouseEvent): void {
    if (!this.isPanning) return;
    
    const deltaX = event.clientX - this.lastPanPoint.x;
    const deltaY = event.clientY - this.lastPanPoint.y;
    
    this.panX += deltaX;
    this.panY += deltaY;
    
    this.lastPanPoint = { x: event.clientX, y: event.clientY };
    event.preventDefault();
  }

  onPanEnd(event: MouseEvent): void {
    this.isPanning = false;
  }

  getTransform(): string {
    return `translate(${this.panX}px, ${this.panY}px) scale(${this.zoomLevel})`;
  }

  trackByEmployee(index: number, node: OrganizationNode): string {
    return node.employee.id;
  }

  private loadOrganizationChart(): void {
    this.isLoading = true;
    this.organizationService.buildOrganizationTree()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tree) => {
          this.organizationTree = tree;
          if (this.organizationTree.length === 0) {
            // Create mock data for testing
            this.createMockData();
          }
          this.buildDepartmentBranches();
          this.calculateTreeLayout();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading organization chart:', error);
          // Create mock data on error
          this.createMockData();
          this.buildDepartmentBranches();
          this.calculateTreeLayout();
          this.isLoading = false;
        }
      });
  }

  private createMockData(): void {
    // Create comprehensive mock employees for testing
    const mockEmployees: Employee[] = [
      {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@company.com',
        position: 'Chief Executive Officer',
        department: 'Executive',
        managerId: undefined,
        joinDate: new Date('2020-01-01'),
        status: 'active',
        employeeType: 'full-time'
      },
      {
        id: '2', 
        name: 'Michael Chen',
        email: 'michael.chen@company.com',
        position: 'Chief Technology Officer',
        department: 'Technology',
        managerId: '1',
        joinDate: new Date('2020-02-01'),
        status: 'active',
        employeeType: 'full-time'
      },
      {
        id: '3',
        name: 'Emily Rodriguez',
        email: 'emily.rodriguez@company.com', 
        position: 'Head of Human Resources',
        department: 'Human Resources',
        managerId: '1',
        joinDate: new Date('2020-03-01'),
        status: 'active',
        employeeType: 'full-time'
      },
      {
        id: '4',
        name: 'David Wilson',
        email: 'david.wilson@company.com',
        position: 'Senior Software Engineer',
        department: 'Technology',
        managerId: '2',
        joinDate: new Date('2021-01-01'),
        status: 'active',
        employeeType: 'full-time'
      },
      {
        id: '5',
        name: 'Lisa Thompson',
        email: 'lisa.thompson@company.com',
        position: 'Product Manager',
        department: 'Product',
        managerId: '1',
        joinDate: new Date('2021-02-01'),
        status: 'active',
        employeeType: 'full-time'
      },
      {
        id: '6',
        name: 'James Anderson',
        email: 'james.anderson@company.com',
        position: 'UX Designer',
        department: 'Design',
        managerId: '5',
        joinDate: new Date('2021-06-01'),
        status: 'active',
        employeeType: 'full-time'
      },
      {
        id: '7',
        name: 'Maria Garcia',
        email: 'maria.garcia@company.com',
        position: 'Marketing Manager',
        department: 'Marketing',
        managerId: '1',
        joinDate: new Date('2021-08-01'),
        status: 'active',
        employeeType: 'full-time'
      },
      {
        id: '8',
        name: 'Robert Kim',
        email: 'robert.kim@company.com',
        position: 'DevOps Engineer',
        department: 'Technology',
        managerId: '2',
        joinDate: new Date('2022-01-01'),
        status: 'active',
        employeeType: 'full-time'
      }
    ];

    // Build the organization tree from mock data
    this.organizationTree = this.buildTreeFromEmployees(mockEmployees);
    console.log('Mock organization tree created:', this.organizationTree);
    
    // Calculate layout for branch view
    setTimeout(() => {
      this.calculateTreeLayout();
    }, 100);
  }

  private buildTreeFromEmployees(employees: Employee[]): OrganizationNode[] {
    const nodeMap = new Map<string, OrganizationNode>();
    const rootNodes: OrganizationNode[] = [];

    // Create nodes for all employees
    employees.forEach(employee => {
      nodeMap.set(employee.id, {
        employee,
        children: [],
        level: 0,
        expanded: true
      });
    });

    // Build the hierarchy and calculate levels
    employees.forEach(employee => {
      const node = nodeMap.get(employee.id)!;
      
      if (employee.managerId) {
        const manager = nodeMap.get(employee.managerId);
        if (manager) {
          manager.children.push(node);
          node.level = manager.level + 1;
        }
      } else {
        rootNodes.push(node);
      }
    });

    return rootNodes;
  }

  private calculateTreeLayout(): void {
    if (this.organizationTree.length === 0) return;

    this.nodePositions.clear();
    this.treeConnections = [];

    const nodeWidth = 280; // Increased to account for margins
    const nodeHeight = 160; // Increased to account for margins
    const horizontalSpacing = 100; // Increased spacing
    const verticalSpacing = 140; // Increased vertical spacing

    // Find root nodes and calculate layout for each tree
    const rootNodes = this.organizationTree.filter(node => node.level === 0);
    let startX = 50; // Start with some padding

    rootNodes.forEach(rootNode => {
      const treeWidth = this.calculateSubtreeWidth(rootNode, nodeWidth, horizontalSpacing);
      const rootX = startX + treeWidth / 2 - nodeWidth / 2;
      
      this.layoutTreeHierarchy(rootNode, rootX, 50, nodeWidth, nodeHeight, horizontalSpacing, verticalSpacing);
      startX += treeWidth + 200; // Space between different root trees
    });
    
    // Generate connection lines
    this.generateConnections();
    
    // Update SVG dimensions
    this.updateSVGDimensions();
  }

  private calculateSubtreeWidth(node: OrganizationNode, nodeWidth: number, hSpacing: number): number {
    if (!node.children || node.children.length === 0) {
      return nodeWidth;
    }

    let totalChildrenWidth = 0;
    node.children.forEach(child => {
      totalChildrenWidth += this.calculateSubtreeWidth(child, nodeWidth, hSpacing);
    });

    return Math.max(nodeWidth, totalChildrenWidth + (node.children.length - 1) * hSpacing);
  }

  private layoutTreeHierarchy(
    node: OrganizationNode,
    centerX: number,
    y: number,
    nodeWidth: number,
    nodeHeight: number,
    hSpacing: number,
    vSpacing: number
  ): void {
    // Position current node
    const x = centerX - nodeWidth / 2;
    
    this.nodePositions.set(node.employee.id, {
      x,
      y,
      width: nodeWidth,
      height: nodeHeight
    });

    // Add position properties to node for template binding
    (node as any).x = x;
    (node as any).y = y;

    // Layout children if any
    if (node.children && node.children.length > 0) {
      const childY = y + nodeHeight + vSpacing;
      
      // Calculate total width needed for all children
      let totalChildrenWidth = 0;
      const childWidths: number[] = [];
      
      node.children.forEach(child => {
        const childWidth = this.calculateSubtreeWidth(child, nodeWidth, hSpacing);
        childWidths.push(childWidth);
        totalChildrenWidth += childWidth;
      });
      
      totalChildrenWidth += (node.children.length - 1) * hSpacing;
      
      // Starting position for children (centered under parent)
      let childStartX = centerX - totalChildrenWidth / 2;
      
      // Position each child
      node.children.forEach((child, index) => {
        const childCenterX = childStartX + childWidths[index] / 2;
        this.layoutTreeHierarchy(child, childCenterX, childY, nodeWidth, nodeHeight, hSpacing, vSpacing);
        childStartX += childWidths[index] + hSpacing;
      });
    }
  }

  private generateConnections(): void {
    this.treeConnections = [];

    this.organizationTree.forEach(node => {
      this.generateNodeConnections(node);
    });
  }

  private generateNodeConnections(node: OrganizationNode): void {
    if (!node.children || node.children.length === 0) return;

    const parentPos = this.nodePositions.get(node.employee.id);
    if (!parentPos) return;

    const parentCenterX = parentPos.x + parentPos.width / 2;
    const parentBottomY = parentPos.y + parentPos.height;

    node.children.forEach(child => {
      const childPos = this.nodePositions.get(child.employee.id);
      if (!childPos) return;

      const childCenterX = childPos.x + childPos.width / 2;
      const childTopY = childPos.y;

      // Create connection path (L-shaped)
      const midY = parentBottomY + (childTopY - parentBottomY) / 2;
      
      const path = `M ${parentCenterX} ${parentBottomY} 
                    L ${parentCenterX} ${midY} 
                    L ${childCenterX} ${midY} 
                    L ${childCenterX} ${childTopY}`;

      this.treeConnections.push({
        path: path.replace(/\s+/g, ' ').trim(),
        highlighted: false
      });

      // Recursively generate connections for children
      this.generateNodeConnections(child);
    });
  }

  private updateSVGDimensions(): void {
    if (this.nodePositions.size === 0) return;

    let maxX = 0, maxY = 0;
    this.nodePositions.forEach(pos => {
      maxX = Math.max(maxX, pos.x + pos.width);
      maxY = Math.max(maxY, pos.y + pos.height);
    });

    this.svgWidth = maxX + 100; // Add padding
    this.svgHeight = maxY + 100; // Add padding
  }

  private buildDepartmentBranches(): void {
    this.organizationService.getEmployees()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (employees) => {
          const departmentMap = new Map<string, Employee[]>();
          
          employees.forEach(employee => {
            if (!departmentMap.has(employee.department)) {
              departmentMap.set(employee.department, []);
            }
            departmentMap.get(employee.department)!.push({
              ...employee,
              isManager: this.isEmployeeManager(employee, employees)
            } as Employee & { isManager: boolean });
          });

          this.departmentBranches = Array.from(departmentMap.entries()).map(([name, employees]) => ({
            name,
            employees: employees.sort((a, b) => {
              // Sort by manager status first, then by position
              if ((a as any).isManager && !(b as any).isManager) return -1;
              if (!(a as any).isManager && (b as any).isManager) return 1;
              return a.position.localeCompare(b.position);
            })
          }));
        },
        error: () => {
          // Fallback to mock data departments
          this.buildMockDepartments();
        }
      });
  }

  private buildMockDepartments(): void {
    // Build departments from organization tree
    const departmentMap = new Map<string, Employee[]>();
    
    const getAllEmployees = (nodes: OrganizationNode[]): Employee[] => {
      const employees: Employee[] = [];
      nodes.forEach(node => {
        employees.push(node.employee);
        if (node.children) {
          employees.push(...getAllEmployees(node.children));
        }
      });
      return employees;
    };

    const allEmployees = getAllEmployees(this.organizationTree);
    
    allEmployees.forEach(employee => {
      if (!departmentMap.has(employee.department)) {
        departmentMap.set(employee.department, []);
      }
      departmentMap.get(employee.department)!.push(employee);
    });

    this.departmentBranches = Array.from(departmentMap.entries()).map(([name, employees]) => ({
      name,
      employees
    }));
  }

  private isEmployeeManager(employee: Employee, allEmployees: Employee[]): boolean {
    return allEmployees.some(emp => emp.managerId === employee.id);
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

  setViewMode(mode: 'tree' | 'compact' | 'branch'): void {
    this.viewMode = mode;
    if (mode === 'branch') {
      setTimeout(() => {
        this.calculateTreeLayout();
      }, 100);
    }
  }

  toggleLevels(): void {
    this.showLevels = !this.showLevels;
  }

  toggleFullscreen(): void {
    this.isFullscreen = !this.isFullscreen;
    this.onPanelFullscreenChange();
  }

  private onPanelFullscreenChange(): void {
    // Recalculate layout when panel size changes
    setTimeout(() => {
      if (this.viewMode === 'branch') {
        this.calculateTreeLayout();
        this.generateConnections();
      }
      this.fitToScreen();
    }, 100);
  }

  onFullscreenOverlayClick(event: MouseEvent): void {
    // Check if click is on the close button area (top-right corner)
    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    
    // Close button is in top-right corner (40x40px area)
    if (this.isFullscreen && clickX >= rect.width - 50 && clickY <= 50) {
      this.isFullscreen = false;
      this.onPanelFullscreenChange();
    }
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
      width: '2px',
      height: '60px',
      background: this.getLevelColor(node.level)
    };
  }

  getLevelColor(level: number): string {
    const colors = ['#1a237e', '#3f51b5', '#2196f3', '#00bcd4', '#4caf50'];
    return colors[Math.min(level, colors.length - 1)] || '#616161';
  }

  getLevelLabel(index: number): string {
    const labels = ['CEO', 'C-Level', 'Director', 'Manager', 'Senior'];
    return labels[index] || `Level ${index}`;
  }

  getChildEmployees(node: OrganizationNode): Employee[] {
    return node.children.map(child => child.employee);
  }

  // Get all nodes in a flattened structure for Tree and Compact views
  getAllNodesFlattened(): OrganizationNode[] {
    const result: OrganizationNode[] = [];
    
    const flattenNodes = (nodes: OrganizationNode[]) => {
      nodes.forEach(node => {
        result.push(node);
        if (node.children && node.children.length > 0 && node.expanded) {
          flattenNodes(node.children);
        }
      });
    };
    
    flattenNodes(this.organizationTree);
    return result;
  }

  // Get node X position for branch view
  getNodeX(node: OrganizationNode): number {
    return (node as any).x || 0;
  }

  // Get node Y position for branch view
  getNodeY(node: OrganizationNode): number {
    return (node as any).y || 0;
  }
} 