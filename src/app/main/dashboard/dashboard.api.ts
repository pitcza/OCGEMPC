import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RecentPayment {
  id: string;
  first_name: string;
  last_name: string;
  amount: string;
  date: string;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class DashboardApiService {
  constructor(private http: HttpClient) {}

  // Replace 'api/route' with your actual endpoints
  getTotalApplications(): Observable<number> {
  return this.http.get<{ message: string, loanCount: number }>(`${environment.baseUrl}/api/loans-this-month`)
    .pipe(map(res => res.loanCount));
}
  getTotalLoanAmountThisMonth(): Observable<number> {
    return this.http.get<{ message: string, formattedResult: number }>(`${environment.baseUrl}/api/total-loan-amount`)
    .pipe(map(res => res.formattedResult));
  }

  getActiveLoans(): Observable<number> {
    return this.http.get<{ message: string, activeLoans: number }>(`${environment.baseUrl}/api/active-loans`)
     .pipe(map(res => res.activeLoans));
  }

  getFullyPaidLoans(): Observable<number> {
    return this.http.get<{ message: string, totalPaidLoans: number }>(`${environment.baseUrl}/api/paid-loans`)
      .pipe(map(res => res.totalPaidLoans));
  }

  getLoanApplicationsByMonth(): Observable<{ [month: string]: number }> {
    return this.http.get<{ [month: string]: number }>(`${environment.baseUrl}/api/total-monthly-applications`);
  }

  getLoanStatusOverview(): Observable<{ [status: string]: number }> {
    return this.http.get<{ [status: string]: number }>(`${environment.baseUrl}/api/loans-per-status`);
  }

  getRecentPayments(): Observable<RecentPayment[]> {
    return this.http.get<RecentPayment[]>(`${environment.baseUrl}/api/recent-payments`);
  }

}
