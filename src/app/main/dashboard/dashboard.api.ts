import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
    return this.http.get<number>('http://localhost:3000/api/loans-this-month');
  }

  getTotalLoanAmountThisMonth(): Observable<number> {
    return this.http.get<number>('http://localhost:3000/api/total-loan-amount');
  }

  getActiveLoans(): Observable<number> {
    return this.http.get<number>('http://localhost:3000/api/active-loans');
  }

  getFullyPaidLoans(): Observable<number> {
    return this.http.get<number>('http://localhost:3000/api/paid-loans');
  }

  getLoanApplicationsByMonth(): Observable<{ [month: string]: number }> {
    return this.http.get<{ [month: string]: number }>('http://localhost:3000/api/total-monthly-applications');
  }

  getLoanStatusOverview(): Observable<{ [status: string]: number }> {
    return this.http.get<{ [status: string]: number }>('http://localhost:3000/api/loans-per-status');
  }

  getRecentPayments(): Observable<RecentPayment[]> {
    return this.http.get<RecentPayment[]>('http://localhost:3000/api/recent-payments');
  }

}
