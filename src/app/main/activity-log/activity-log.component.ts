import { Component, OnInit, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { decryptResponse } from '../../utils/crypto.util';
interface StaffLog {
  user_id: number;
  action: 'login' | 'logout' | 'create loan' | 'approve loan' | 'decline loan' | 'deleted loan' | 'updated loan';
  description?: string;
  related_data?: any;
  createdAt: string;
  // Optionally, include user info if your backend populates it
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    // add other user fields as needed
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
    dataSource: ActivityLog[] = [];
    loading = true;
    error: string | null = null;

    constructor(private http: HttpClient) { }

  private encryptionKey = environment.encryptionKey;
  private decryptApiResponse<T>() {
    return map((res: { encrypted: string }) => decryptResponse(res.encrypted, this.encryptionKey) as T);
  }


  ngOnInit(): void {
    this.getStaffLogs().subscribe({
      next: (logs: StaffLog[]) => {
        this.dataSource = logs.map(log => ({
          timestamp: this.formatDate(log.createdAt),
          who: log.user
            ? `${log.user.first_name} ${log.user.last_name}`
            : `User #${log.user_id}`,
          role: log.user && (log.user as any).role ? (log.user as any).role : 'N/A',
          action: this.formatAction(log.action),
          details: log.description || this.generateDetails(log)
        }));
        this.loading = false;
      },
      error: err => {
        this.error = 'Failed to load activity logs.';
        this.loading = false;
      }
    });
  }

   private formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    // Format as 'YYYY-MM-DD hh:mm AM/PM'
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: true
    };
    return date.toLocaleString(undefined, options);
  }

  private formatAction(action: string): string {
    // Capitalize and remove underscores if any
    return action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  private generateDetails(log: StaffLog): string {
    // Fallback if description is missing
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
      default:
        return '';
    }
  }

  getStaffLogs(): Observable<StaffLog[]> {
  return this.http.get<{ encrypted: string }>(`${environment.baseUrl}/api/staffLogs`)
    .pipe(
      this.decryptApiResponse<StaffLog[]>()
    );
}
}


