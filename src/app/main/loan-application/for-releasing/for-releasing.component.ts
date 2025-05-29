import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ViewApplicationComponent } from '../view-application/view-application.component';
import Swal from 'sweetalert2';
import { AuthService } from '../../../services/auth.services';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
// import { environment } from '../../../../environments/environment.prod';

@Component({
  selector: 'app-for-releasing',
  standalone: false,
  templateUrl: './for-releasing.component.html',
  styleUrl: './for-releasing.component.scss'
})
export class ForReleasingComponent implements OnInit {
  selectedMaker = 'all';
  searchQuery = '';
  itemsPerPage = 10;
  currentPage = 1;

  loans: any[] = [];
  filteredLoans: any[] = [];

  constructor(private dialog: MatDialog, private http: HttpClient) {}

  ngOnInit() {
      this.fetchLoans();
    }

  fetchLoans() {
    this.http.get<any[]>(`${environment.baseUrl}/api/loans`).subscribe({
      next: (data) => {
        // Filter for pending loans
        this.loans = data.filter(loan => loan.loan_status && loan.loan_status.toLowerCase() === 'approved');
        this.filteredLoans = [...this.loans];
      },
      error: (err) => {
        Swal.fire('Error', 'Failed to fetch loans from server.', 'error');
      }
    });
  }
    viewLoan() {
    this.dialog.open(ViewApplicationComponent);
  }


  get totalItems() {
    return this.filteredLoans.length;
  }

  get startIndex() {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  get endIndex() {
    return Math.min(this.startIndex + this.itemsPerPage, this.totalItems);
  }

  get totalPages() {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get totalPagesArray() {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get paginatedUsers() {
    return this.filteredLoans.slice(this.startIndex, this.endIndex);
  }

  applyFilters() {
    const query = this.searchQuery.toLowerCase();
    this.filteredLoans = this.loans.filter(loan =>
      loan.name.toLowerCase().includes(query)
    );
    this.currentPage = 1;
  }

  goToPage(page: number) {
    this.currentPage = page;
  }

  goToPreviousPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  goToNextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  onItemsPerPageChange() {
    this.currentPage = 1;
  }
}
