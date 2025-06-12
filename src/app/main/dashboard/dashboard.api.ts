import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { decryptResponse } from '../../utils/crypto.util';
export interface RecentPayment {
  id: string;
  first_name: string;
  last_name: string;
  amount: string;
  date: string;
  status: string;
  total_payment: string;
  updatedAt: any;
  maker: Maker
}

export interface Maker {
  id: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  ext_name: string;
  position: string;
  dept: string;
}


interface RecentPaymentsResponse {
  mostRecentPayments: RecentPayment[];
}

@Injectable({ providedIn: 'root' })
export class DashboardApiService {
   private encryptionKey = environment.encryptionKey;
  constructor(private http: HttpClient) {}

  private decryptApiResponse<T>() {
    return map((res: { encrypted: string }) => decryptResponse(res.encrypted, this.encryptionKey) as T);
  }

  // Replace 'api/route' with your actual endpoints
 getTotalApplications(): Observable<number> {
    return this.http.get<{ encrypted: string }>(`${environment.baseUrl}/api/loans-this-month`)
      .pipe(
        this.decryptApiResponse<{ loanCount: number }>(),
        map(decrypted => decrypted.loanCount)
      );
  }

  getTotalLoanAmountThisMonth(): Observable<number> {
    return this.http.get<{ encrypted: string }>(`${environment.baseUrl}/api/total-loan-amount`)
      .pipe(
        this.decryptApiResponse<{ formattedResult: number }>(),
        map(decrypted => decrypted.formattedResult)
      );
  }

  getActiveLoans(): Observable<number> {
    return this.http.get<{ encrypted: string }>(`${environment.baseUrl}/api/active-loans`)
      .pipe(
        this.decryptApiResponse<{ totalActiveLoans: number }>(),
        map(decrypted => decrypted.totalActiveLoans)
      );
  }

  getFullyPaidLoans(): Observable<number> {
    return this.http.get<{ encrypted: string }>(`${environment.baseUrl}/api/paid-loans`)
      .pipe(
        this.decryptApiResponse<{ totalPaidLoans: number }>(),
        map(decrypted => decrypted.totalPaidLoans)
      );
  }

  getLoanApplicationsByMonth(): Observable<{ [month: string]: number }> {
    return this.http.get<{ encrypted: string }>(`${environment.baseUrl}/api/total-monthly-applications`)
      .pipe(
        this.decryptApiResponse<{ [month: string]: number }>()
      );
  }

  getLoanStatusOverview(): Observable<{ [status: string]: number }> {
    return this.http.get<{ encrypted: string }>(`${environment.baseUrl}/api/loans-per-status`)
      .pipe(
        this.decryptApiResponse<{ [status: string]: number }>()
      );
  }

  getRecentPayments(): Observable<RecentPaymentsResponse> {
    return this.http.get<{ encrypted: string }>(`${environment.baseUrl}/api/recent-payments`)
    .pipe(
      this.decryptApiResponse<RecentPaymentsResponse>()
    );
  }
}
