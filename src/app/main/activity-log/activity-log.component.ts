import { Component, OnInit, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { decryptResponse } from '../../utils/crypto.util';
interface StaffLog {
  user_id: number;
  action: string;
  description?: string;
  related_data?: any;
  createdAt: string;
  // Optionally, include user info if your backend populates it
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    roles: any;
  };
}
export interface ActivityLog {
  timestamp: string;
  who: string;
  role: string;
  action: string;
  details: string;
}

@Component({
  selector: 'app-activity-log',
  standalone: false,
  templateUrl: './activity-log.component.html',
  styleUrls: ['./activity-log.component.scss']
})


export class ActivityLogComponent implements OnInit {
  displayedColumns: string[] = ['timestamp', 'who', 'role', 'action', 'details'];
  dataSource: ActivityLog[] = [];      // all data
  paginatedData: ActivityLog[] = [];   // visible data

  loading = true;
  error: string | null = null;

  // Pagination state
  itemsPerPage = 10;
  currentPage = 1;
  totalItems = 0;
  totalPages = 0;
  startIndex = 0;
  endIndex = 0;
  totalPagesArray: number[] = [];

  constructor(private http: HttpClient) {}

  private encryptionKey = environment.encryptionKey;
  private decryptApiResponse<T>() {
    return map((res: { encrypted: string }) =>
      decryptResponse(res.encrypted, this.encryptionKey) as T
    );
  }

  ngOnInit(): void {
    this.getStaffLogs().subscribe({
      next: (logs: StaffLog[]) => {
        this.dataSource = logs.map(log => ({
          timestamp: this.formatDate(log.createdAt),
          who: log.user
            ? `${log.user.first_name} ${log.user.last_name}`
            : `User #${log.user_id}`,
          role: log.user?.roles?.[0]?.role_name ?? 'N/A',
          action: this.formatAction(log.action),
          details: log.description || this.generateDetails(log),
        }));

        this.totalItems = this.dataSource.length;
        this.updatePagination();
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load activity logs.';
        this.loading = false;
      },
    });
  }

  private formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };
    return date.toLocaleString(undefined, options);
  }

  private formatAction(action: string): string {
    return action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  private generateDetails(log: StaffLog): string {
    switch (log.action) {
      case 'create loan':
        return `Created a new loan${log.related_data?.loan_id ? ` (#${log.related_data.loan_id})` : ''}.`;
      case 'approve loan':
        return `Approved loan${log.related_data?.loan_id ? ` (#${log.related_data.loan_id})` : ''}.`;
      case 'decline loan':
        return `Declined loan${log.related_data?.loan_id ? ` (#${log.related_data.loan_id})` : ''}.`;
      case 'deleted loan':
        return `Deleted loan${log.related_data?.loan_id ? ` (#${log.related_data.loan_id})` : ''}.`;
      case 'updated loan':
        return `Updated loan${log.related_data?.loan_id ? ` (#${log.related_data.loan_id})` : ''}.`;
      case 'login':
        return `User logged in.`;
      case 'logout':
        return `User logged out.`;
      case 'create maker account':
        return `Created a maker account for ${log.related_data?.name ?? 'a user'}.`;
      case 'create co-maker account':
        return `Created a co-maker account for ${log.related_data?.name ?? 'a user'}.`;
      default:
        return log.description || '';
    }
  }

  getStaffLogs(): Observable<StaffLog[]> {
    return this.http
      .get<{ encrypted: string }>(`${environment.baseUrl}/api/staffLogs`)
      .pipe(this.decryptApiResponse<StaffLog[]>());
  }

  // --- Pagination Helpers ---
  updatePagination(): void {
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.totalPagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);

    this.startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.endIndex = Math.min(this.startIndex + this.itemsPerPage, this.totalItems);

    this.paginatedData = this.dataSource.slice(this.startIndex, this.endIndex);
  }

  onItemsPerPageChange(): void {
    this.currentPage = 1;
    this.updatePagination();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }
}