import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { OrganizationService } from '../../../../data/organization.service';
import { Employee, Department } from '../../../../models/organization.model';

@Component({
  selector: 'app-directory-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatTooltipModule,
    MatButtonToggleModule,
    MatBadgeModule,
    MatDividerModule
  ],
  templateUrl: './directory-page.component.html',
  styleUrl: './directory-page.component.scss'
})
export class DirectoryPageComponent implements OnInit, OnDestroy {
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  departments: Department[] = [];
  selectedEmployee: Employee | null = null;
  isLoading = true;
  searchQuery = '';
  selectedDepartment = '';
  selectedStatus = '';
  viewMode: 'list' | 'grid' = 'grid';
  
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(private organizationService: OrganizationService) {
    // Setup search debouncing
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.performSearch(query);
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(): void {
    this.isLoading = true;
    
    // Load employees and departments
    this.organizationService.getEmployees()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (employees) => {
          this.employees = employees;
          this.filteredEmployees = employees;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading employees:', error);
          this.isLoading = false;
        }
      });

    this.organizationService.getDepartments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (departments) => {
          this.departments = departments;
        },
        error: (error) => {
          console.error('Error loading departments:', error);
        }
      });
  }

  onSearch(query: string): void {
    this.searchQuery = query;
    this.searchSubject.next(query);
  }

  private performSearch(query: string): void {
    if (!query.trim()) {
      this.applyFilters();
      return;
    }

    this.organizationService.searchEmployees(query)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (employees) => {
          this.filteredEmployees = employees;
          this.applyFilters();
        },
        error: (error) => {
          console.error('Error searching employees:', error);
        }
      });
  }

  onDepartmentFilter(department: string): void {
    this.selectedDepartment = department;
    this.applyFilters();
  }

  onStatusFilter(status: string): void {
    this.selectedStatus = status;
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = this.searchQuery.trim() ? this.filteredEmployees : this.employees;

    if (this.selectedDepartment) {
      filtered = filtered.filter(emp => emp.department === this.selectedDepartment);
    }

    if (this.selectedStatus) {
      filtered = filtered.filter(emp => emp.status === this.selectedStatus);
    }

    this.filteredEmployees = filtered;
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedDepartment = '';
    this.selectedStatus = '';
    this.filteredEmployees = this.employees;
  }

  onViewEmployee(employee: Employee): void {
    this.selectedEmployee = employee;
  }

  onEditEmployee(employee: Employee): void {
    console.log('Edit employee:', employee);
    // TODO: Open edit dialog
  }

  onDeleteEmployee(employee: Employee): void {
    if (confirm(`Are you sure you want to remove ${employee.name} from the directory?`)) {
      this.organizationService.deleteEmployee(employee.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.loadData();
          if (this.selectedEmployee?.id === employee.id) {
            this.selectedEmployee = null;
          }
        });
    }
  }

  closeEmployeeDetail(): void {
    this.selectedEmployee = null;
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

  getEmployeeTypeColor(type: string): string {
    switch (type) {
      case 'full-time': return '#2e7d32';
      case 'part-time': return '#ff9800';
      case 'contractor': return '#9c27b0';
      case 'intern': return '#3f51b5';
      default: return '#616161';
    }
  }

  formatJoinDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  }

  getYearsOfService(joinDate: Date): number {
    const now = new Date();
    const join = new Date(joinDate);
    return Math.floor((now.getTime() - join.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  }
} 