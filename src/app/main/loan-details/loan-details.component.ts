import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { environment } from '../../../environments/environment';
import { decryptResponse } from '../../utils/crypto.util';

@Component({
  selector: 'app-loan-details',
  standalone: false,
  templateUrl: './loan-details.component.html',
  styleUrls: ['./loan-details.component.scss'],
  providers: [DatePipe]
})
export class LoanDetailsComponent implements OnInit {
  loanDetails: any = null;
  makerDetails: any = null;
  comakerDetails: any = null;
  amortizationSchedule: any[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<LoanDetailsComponent>,
    private http: HttpClient,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    if (this.data && this.data.loanId) {
      this.fetchLoanDetails(this.data.loanId);
    } else {
      this.error = 'No Loan ID provided.';
      this.loading = false;
    }
  }

  private encryptionKey = environment.encryptionKey;

  fetchLoanDetails(loanId: string | number): void {
    this.loading = true;
    this.http.get<any>(`${environment.baseUrl}/api/loan/${loanId}`).subscribe({
      next: (response) => {
        const decrypted = decryptResponse(response.encrypted, this.encryptionKey);
        
        this.loanDetails = decrypted.loan;
        this.makerDetails = decrypted.loan.applicant;
        this.comakerDetails = decrypted.loan.coMakers?.[0] || null;

        this.amortizationSchedule = decrypted.loan.loan_amortizations || [];
        
        // Sort amortization schedule by installment number
        this.amortizationSchedule.sort((a, b) => a.installment_no - b.installment_no);
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching loan details:', err);
        this.error = 'Failed to fetch loan details.';
        this.loading = false;
      }
    });
  }

  formatDate(date: string): string {
    return this.datePipe.transform(date, 'MMM d, y') || '';
  }

  closeModal(): void {
    this.dialogRef.close();
  }

  getStatusClass(status: string | null | undefined): string {
  switch ((status || '').toLowerCase()) {
    case 'approved':
      return 'status-approved';
    case 'pending':
      return 'status-pending';
    case 'rejected':
      return 'status-rejected';
    case 'paid':
      return 'status-paid';
    case 'unpaid':
      return 'status-unpaid';
    default:
      return 'status-unknown';
  }
}
}