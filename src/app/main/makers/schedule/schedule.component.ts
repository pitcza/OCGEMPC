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

        const amortizations = decrypted.loan_amortizations || [];

        // Sort by installment_no if needed
        amortizations.sort(
          (a: any, b: any) => a.installment_no - b.installment_no
        );

        let totalLoanAmount = 0;
        let totalPrincipalPaid = 0;
        let amortizationPaidSoFar = 0;

        if (amortizations.length > 0) {
          const first = amortizations[0];
          const firstPrincipal = parseFloat(first.principal) || 0;
          const firstBalance = parseFloat(first.remaining_balance) || 0;

          // Calculate total loan amount
          totalLoanAmount = firstPrincipal + firstBalance;
        }

        this.amortizationData = amortizations.map(
          (item: any, index: number) => {
            const principalAmortization = parseFloat(item.principal) || 0; //goods
            const monthlyInterest = parseFloat(item.interest) || 0; //goods
            const totalAmortization = principalAmortization + monthlyInterest; //goods
            const biMonthlyAmortization = totalAmortization / 2; //goods
            const monthlyBalance = parseFloat(item.remaining_balance) || 0; //goods

            amortizationPaidSoFar += totalAmortization;
            totalPrincipalPaid += principalAmortization;

            return {
              month: item.installment_no,
              principal: totalLoanAmount - amortizationPaidSoFar,
              principalAmortization,
              monthlyInterest,
              totalAmortization,
              biMonthlyAmortization,
              monthlyBalance,
              amountDeducted: item.total_payment,
              dateDeducted: '',
            };
          }
        );

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
      'Date Deducted',
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
      row.dateDeducted || '',
    ]);

    const csvContent = [headers, ...rows].map((e) => e.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'amortization_schedule.csv');
    a.click();
  }

  // amortizationData = [
  //   {
  //     month: 'January',
  //     principal: 50000,
  //     principalAmortization: 4000,
  //     monthlyInterest: 500,
  //     totalAmortization: 4500,
  //     biMonthlyAmortization: 2250,
  //     monthlyBalance: 46000,
  //     amountDeducted: 4500,
  //     dateDeducted: '2025-01-30'
  //   },
  //   {
  //     month: 'February',
  //     principal: 46000,
  //     principalAmortization: 4000,
  //     monthlyInterest: 460,
  //     totalAmortization: 4460,
  //     biMonthlyAmortization: 2230,
  //     monthlyBalance: 42000,
  //     amountDeducted: 4460,
  //     dateDeducted: '2025-02-28'
  //   },
  //   {
  //     month: 'March',
  //     principal: 42000,
  //     principalAmortization: 4000,
  //     monthlyInterest: 420,
  //     totalAmortization: 4420,
  //     biMonthlyAmortization: 2210,
  //     monthlyBalance: 38000,
  //     amountDeducted: 4420,
  //     dateDeducted: '2025-03-30'
  //   }
  //   // Add more entries as needed
  // ];
}
