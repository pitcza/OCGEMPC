import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { DetailsComponent } from './details/details.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { environment } from '../../../environments/environment';
import { decryptResponse } from '../../utils/crypto.util';
import { NewMakerComponent } from '../makers/new-maker/new-maker.component';
import { LoanDetailsComponent } from '../loan-details/loan-details.component';
import { RouterModule, Router } from '@angular/router';
import { AddApplicationComponent } from '../loan-application/add-application/add-application.component';

interface MakerUser {
  first_name: string;
  middle_name: string;
  last_name: string;
  ext_name: string;
  address: string;
  phone_num: string;
  birthdate: string;
  makerType: string;
  age: number;
  dept: string;
  position: string;
  salary: GLfloat;
  ee_status: string;
  years_coop: string;
  share_amount: GLfloat;
  saving_amount: GLfloat;
  createdAt?: string;
  // Add other fields as needed
}
@Component({
  selector: 'app-makers',
  standalone: false,
  templateUrl: './makers.component.html',
  styleUrls: ['./makers.component.scss'],
})
export class MakersComponent implements OnInit {
  selectedMaker = 'all';
  searchQuery = '';
  itemsPerPage = 10;
  currentPage = 1;
  users: MakerUser[] = [];
  filteredUsers: MakerUser[] = [];
  pagedUsers: MakerUser[] = [];

  private encryptionKey = environment.encryptionKey;

  constructor(
    private dialog: MatDialog,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    const storedItemsPerPage = localStorage.getItem('makersItemsPerPage');
    const storedCurrentPage = localStorage.getItem('makersCurrentPage');

    if (storedItemsPerPage) this.itemsPerPage = +storedItemsPerPage;
    if (storedCurrentPage) this.currentPage = +storedCurrentPage;

    this.fetchUsers();
  }

  fetchUsers(): void {
    this.http.get<any>(`${environment.baseUrl}/api/makers`).subscribe({
      next: (data) => {
        const decrypted = decryptResponse(data.encrypted, this.encryptionKey);

        const makersWithSortKey = decrypted.map((maker: any) => {
          let statusPriority = 3; // Default: no loan
          let latestTimestamp = 0;

          if (maker.loan_applications?.length > 0) {
            for (const loan of maker.loan_applications) {
              const status = loan.loan_status?.toLowerCase();
              const updatedTime = new Date(
                loan.updatedAt || loan.createdAt
              ).getTime();

              if (updatedTime > latestTimestamp) {
                latestTimestamp = updatedTime;
              }

              // Assign best status found
              if (['pending', 'approved'].includes(status)) {
                statusPriority = Math.min(statusPriority, 1);
              } else if (['declined', 'completed'].includes(status)) {
                statusPriority = Math.min(statusPriority, 2);
              }
            }
          }

          const sortKey = statusPriority * 1_000_000_000_000 - latestTimestamp;

          return { ...maker, _sortKey: sortKey };
        });

        makersWithSortKey.sort((a: any, b: any) => a._sortKey - b._sortKey);

        const sortedMakers = makersWithSortKey.map(
          (maker: { _sortKey: number } & MakerUser) => {
            const { _sortKey, ...rest } = maker;
            return rest;
          }
        );

        this.users = sortedMakers;
        this.filteredUsers = [...this.users];
        this.updatePagedUsers();
      },
      error: (err) => {
        this.users = [];
        this.filteredUsers = [];
        this.pagedUsers = [];
      },
    });
  }

  get totalItems() {
    return this.filteredUsers.length;
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
    return Array(this.totalPages)
      .fill(0)
      .map((_, i) => i + 1);
  }

  applyFilters() {
    this.filteredUsers = this.users.filter((user) => {
      const hasActiveLoan = this.getLatestRelevantLoan(user) !== null;

      const matchesFilter =
        this.selectedMaker === 'all' ||
        (this.selectedMaker === 'withActiveLoan' && hasActiveLoan);

      const matchesSearch =
        user.first_name
          .toLowerCase()
          .includes(this.searchQuery.toLowerCase()) ||
        user.last_name.toLowerCase().includes(this.searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });

    this.currentPage = 1;
    this.updatePagedUsers();
  }

  updatePagedUsers(): void {
    const start = this.startIndex;
    const end = this.endIndex;
    this.pagedUsers = this.filteredUsers.slice(start, end);
  }

  getLatestRelevantLoan(user: any): any | null {
    if (!user.applications || user.applications.length === 0)
      return null;
    const sortedLoans = [...user.applications].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const latestLoan = sortedLoans[0];
    return ['approved', 'pending'].includes(
      latestLoan.loan_status.toLowerCase()
    )
      ? latestLoan
      : null;
  }

  goToPage(page: number) {
    this.currentPage = page;
    localStorage.setItem('makersCurrentPage', String(this.currentPage));
    this.updatePagedUsers();
  }

  onItemsPerPageChange() {
    this.currentPage = 1;
    localStorage.setItem('makersItemsPerPage', String(this.itemsPerPage));
    localStorage.setItem('makersCurrentPage', String(this.currentPage));
    this.updatePagedUsers();
  }

  goToPreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      localStorage.setItem('makersCurrentPage', String(this.currentPage));
      this.updatePagedUsers();
    }
  }

  goToNextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      localStorage.setItem('makersCurrentPage', String(this.currentPage));
      this.updatePagedUsers();
    }
  }

  viewDetails(user: any) {
    this.dialog.open(DetailsComponent, {
      data: user,
    });
  }

  viewSchedule(user: any) {
    this.dialog.open(ScheduleComponent, {
      data: user,
    });
  }

  viewNewMaker() {
    const dialogRef = this.dialog.open(NewMakerComponent);

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.loanCreated) {
        this.router.navigate(['/main/loan'], {
          queryParams: {
            loanId: result.loanId,
            status: result.status,
          },
        });
      }
    });
  }

  getFullName(user: any): string {
    return [user.first_name, user.last_name].filter(Boolean).join(' ');
  }

  hasSchedule(user: any): boolean {
    if (!user.loan_amortizations || user.loan_amortizations.length === 0)
      return false;

    if (!user.applications || user.applications.length === 0)
      return false;

    // Create a Set of loan IDs where the loan is NOT completed
    const activeLoanIds = new Set(
      user.applications
        .filter(
          (loan: any) =>
            loan.loan_status && loan.loan_status.toLowerCase() !== 'completed'
        )
        .map((loan: any) => loan.id)
    );

    // Return true if there's at least one amortization associated with an active loan
    return user.loan_amortizations.some((amort: any) =>
      activeLoanIds.has(amort.loan_id)
    );
  }

  getLoanStatusMessage(user: any): string {
    const hasLoanApps =
      user.applications && user.applications.length > 0;
    const hasActiveLoan = this.getLatestRelevantLoan(user) !== null;
    const hasAmortization = this.hasSchedule(user);

    if (!hasLoanApps && !hasAmortization)
      return 'No active loans or schedule available.';
    if (!hasActiveLoan && !hasAmortization)
      return 'No active loans or schedule available.';
    return '';
  }

  viewLoanDetails(loanId: number) {
    this.dialog.open(LoanDetailsComponent, {
      data: { loanId },
      panelClass: 'loan-details-dialog',
    });
  }

  createNewLoanForMaker(user: any) {
    const dialogRef = this.dialog.open(AddApplicationComponent, {
      width: '800px',
      data: { preSelectedMaker: user },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.success) {
        this.router.navigate(['/main/loan'], {
          queryParams: {
            loanId: result.loanId,
            status: result.status,
          },
        });
      }
    });
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    return new Date(dateString).toLocaleDateString('en-PH', options);
  } 
}
