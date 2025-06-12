import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';

// Update service and model imports

import { CompanyProfile } from '../../../../../../shared/models/company-profile.model';
import { CompanyProfileService } from '../../../../data/company-profile.service';

@Component({
  selector: 'app-history-page', // Selector name
  templateUrl: './history-page.component.html',
  styleUrls: ['./history-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatSnackBarModule,
    MatCardModule,
    MatProgressBarModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatTooltipModule,
    RouterModule
  ]
})
export class HistoryPageComponent implements OnInit {
  displayedColumns: string[] = ['legalName', 'tagline', 'actions']; // Updated column names
  dataSource = new MatTableDataSource<CompanyProfile>([]);
  isLoading: boolean = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private companyProfileService: CompanyProfileService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.companyProfileService.getProfileHistory().subscribe({
      next: (history) => {
        this.dataSource.data = history;
        this.isLoading = false;
        // Assign paginator and sort AFTER data is set and view children are ready
        setTimeout(() => {
          if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage(); // Reset paginator to first page
            this.dataSource.paginator = this.paginator;
          }
          if (this.dataSource.sort) {
            this.dataSource.sort = this.sort;
          }
        });
      },
      error: (err) => {
        console.error('Failed to load history:', err);
        this.snackBar.open('Failed to load profile history.', 'Close', { duration: 3000, panelClass: ['snackbar-error'] });
        this.isLoading = false;
      }
    });
  }
}
