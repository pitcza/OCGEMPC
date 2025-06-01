import { Component, Inject, OnInit} from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-schedule',
  standalone: false,
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.scss'
})
export class ScheduleComponent implements OnInit {
  amortizationData: any[] = [];
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ScheduleComponent>,
    private http: HttpClient
  ) {}

    ngOnInit(): void {
    this.fetchAmortizationData();
  }

  fetchAmortizationData(): void {
    this.http.get<any>('/makers').subscribe({
      next: (response) => {
        this.amortizationData = response.loan_amortization || [];
      },
      error: (err) => {
        // Optionally handle error, e.g., show a message or fallback data
        this.amortizationData = [];
      }
    });
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
    'Date Deducted'
  ];

  const rows = this.amortizationData.map(row => [
    row.month,
    row.principal,
    row.principalAmortization,
    row.monthlyInterest,
    row.totalAmortization,
    row.biMonthlyAmortization,
    row.monthlyBalance,
    row.amountDeducted || row.amountDeductedInput || '',
    row.dateDeducted || ''
  ]);

  const csvContent = [headers, ...rows]
    .map(e => e.join(','))
    .join('\n');

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
