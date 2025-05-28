import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ViewApplicationComponent } from '../view-application/view-application.component';
import Swal from 'sweetalert2';
import { SetScheduleComponent } from '../set-schedule/set-schedule.component';
import { AuthService } from '../../../services/auth.services';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-application-list',
  standalone: false,
  templateUrl: './application-list.component.html',
  styleUrl: './application-list.component.scss'
})
export class ApplicationListComponent implements OnInit {
  selectedMaker = 'all';
  searchQuery = '';
  itemsPerPage = 10;
  currentPage = 1;
  userRole: string | null = null;

  loans: any[] = [];
  filteredLoans: any[] = [];

  constructor(
    private dialog: MatDialog,
    private authService: AuthService,
    private http: HttpClient,
  ) {
    this.userRole = this.authService.cookieService.get('roleName');
  }

  ngOnInit() {
    this.fetchLoans();
  }

  fetchLoans() {
    this.http.get<any[]>('http://localhost:3000/api/loans').subscribe({
      next: (data) => {
        // Filter for pending loans
        this.loans = data.filter(loan => loan.loan_status && loan.loan_status.toLowerCase() === 'pending');
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

 approve(loan: any) {
    Swal.fire({
      title: 'Approve Application',
      text: `Are you sure you want to approve this application?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#508D4E',
      cancelButtonColor: '#7c7777',
      confirmButtonText: 'Yes, approve it!'
    }).then((result) => {
      if (result.isConfirmed) {
        // Call the approve API
        this.http.post(`http://localhost:3000/api/approve-loan/${loan.id}`, {}).subscribe({
          next: () => {
            Swal.fire({
              title: 'Application Approved',
              text: `${loan.name} has been approved.`,
              icon: 'success',
              confirmButtonColor: '#508D4E',
              confirmButtonText: 'SET SCHEDULE'
            }).then((result) => {
              if (result.isConfirmed) {
                this.setSchedule();
              }
              this.fetchLoans(); // Refresh the list
            });
          },
          error: () => {
            Swal.fire('Error', 'Failed to approve the loan.', 'error');
          }
        });
      }
    });
  }

  setSchedule() {
    this.dialog.open(SetScheduleComponent);
  }

 decline(loan: any) {
    Swal.fire({
      title: 'Decline Application',
      text: `Are you sure you want to decline this application?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#be1010',
      cancelButtonColor: '#7c7777',
      confirmButtonText: 'Yes, decline it!'
    }).then((result) => {
      if (result.isConfirmed) {
        // Prompt for remarks
        Swal.fire({
          title: 'Decline Remarks',
          input: 'textarea',
          inputLabel: 'Please provide a reason for declining:',
          inputPlaceholder: 'Enter your remarks here...',
          inputAttributes: {
            'aria-label': 'Type your message here'
          },
          showCancelButton: true,
          confirmButtonText: 'Submit',
          cancelButtonColor: '#7c7777',
          confirmButtonColor: '#be1010',
          preConfirm: (remarks) => {
            if (!remarks) {
              Swal.showValidationMessage('Remarks are required to proceed.');
            }
            return remarks;
          }
        }).then((remarksResult) => {
          if (remarksResult.isConfirmed) {
            const remarks = remarksResult.value;
            // Call the decline API
            this.http.post(`http://localhost:3000/api/decline-loan/${loan.id}`, { remarks }).subscribe({
              next: () => {
                Swal.fire('Declined!', `${loan.name} has been declined.`, 'error');
                this.fetchLoans(); // Refresh the list
              },
              error: () => {
                Swal.fire('Error', 'Failed to decline the loan.', 'error');
              }
            });
          }
        });
      }
    });
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
