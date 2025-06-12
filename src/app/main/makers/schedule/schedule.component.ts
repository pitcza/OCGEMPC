import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { decryptResponse } from '../../../utils/crypto.util';

@Component({
  selector: 'app-schedule',
  standalone: false,
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.scss',
})
export class ScheduleComponent implements OnInit {
  firstName: string = '';
  lastName: string = '';
  amortizationData: any[] = [];
  loading = true;
  error: string | null = null;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ScheduleComponent>,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    if (this.data && this.data.id) {
      this.fetchAmortizationData(this.data.id);
    } else {
      this.error = 'No Maker ID provided.';
      this.loading = false;
    }
  }

  private encryptionKey = environment.encryptionKey;

  fetchAmortizationData(id: string | number): void {
    this.http.get<any>(`${environment.baseUrl}/api/maker/${id}`).subscribe({
      next: (response) => {
        const decrypted = decryptResponse(
          response.encrypted,
          this.encryptionKey
        );

        this.firstName = decrypted.first_name;
        this.lastName = decrypted.last_name;
        
        const amortizations = decrypted.loan_amortizations || [];
        const loanApplications = decrypted.loan_applications || [];

        // filter loan applications that are not completed
        const activeLoanIds = loanApplications
          .filter((loan: any) => loan.loan_status !== 'completed')
          .map((loan: any) => loan.id);

        // filter amortizations linked to active loans
        const filteredAmortizations = amortizations.filter((amort: any) =>
          activeLoanIds.includes(amort.loan_id)
        );

        // sort
        filteredAmortizations.sort(
          (a: any, b: any) => a.installment_no - b.installment_no
        );

        let totalLoanAmount = 0;
        let totalPrincipalPaid = 0;
        let amortizationPaidSoFar = 0;

        if (filteredAmortizations.length > 0) {
          const first = filteredAmortizations[0];
          const firstPrincipal = parseFloat(first.principal) || 0;
          const firstBalance = parseFloat(first.remaining_balance) || 0;
          totalLoanAmount = firstPrincipal + firstBalance;
        }

        this.amortizationData = filteredAmortizations.map((item: any) => {
          const principalAmortization = parseFloat(item.principal) || 0;
          const monthlyInterest = parseFloat(item.interest) || 0;
          const totalAmortization = principalAmortization + monthlyInterest;
          const biMonthlyAmortization = totalAmortization / 2;
          const monthlyBalance = parseFloat(item.remaining_balance) || 0;

          amortizationPaidSoFar += totalAmortization;
          totalPrincipalPaid += principalAmortization;

          return {
            id: item.id,
            month: item.installment_no,
            principal: totalLoanAmount - amortizationPaidSoFar,
            principalAmortization,
            monthlyInterest,
            totalAmortization,
            biMonthlyAmortization,
            monthlyBalance,
            amountDeducted: item.total_payment,
            status: item.status,
            dateDeducted: '',
          };
        });

        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.amortizationData = [];
      },
    });
  }

  formatMonth(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  }

  closeModal(): void {
    this.dialogRef.close();
  }

  addDeduction(index: number): void {
    const entry = this.amortizationData[index];
    entry.amountDeducted = entry.amountDeductedInput;
    entry.dateDeducted = new Date().toISOString().split('T')[0]; // current date
    entry.added = true;
  }

  exportToCSV(): void {
    const headers = [
      'Month',
      'Principal',
      'Principal Amortization',
      'Monthly Interest',
      'Total Amortization',
      'Bi-Monthly Amortization',
      'Monthly Balance',
      'Amount Deducted',
      'Status',
    ];

    const rows = this.amortizationData.map((row) => [
      row.month,
      row.principal,
      row.principalAmortization,
      row.monthlyInterest,
      row.totalAmortization,
      row.biMonthlyAmortization,
      row.monthlyBalance,
      row.amountDeducted || row.amountDeductedInput || '',
      row.status,
    ]);

    const csvContent = [headers, ...rows].map((e) => e.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    const fileName = `Amortization_Schedule_${this.firstName}_${this.lastName}.csv`;
    a.setAttribute('download', fileName);
    a.click();
  }

  updateStatus(amortization: any, newStatus: string): void {
    this.http
      .patch(
        `${environment.baseUrl}/api/amortization/${amortization.id}/status`,
        { status: newStatus },
        { headers: { 'Content-Type': 'application/json' } }
      )
      .subscribe({
        next: () => {
          amortization.status = newStatus;
          // Optionally refresh the data
          this.fetchAmortizationData(this.data.id);
        },
        error: (err) => {
          console.error('Failed to update status:', err);
        },
      });
  }
}
