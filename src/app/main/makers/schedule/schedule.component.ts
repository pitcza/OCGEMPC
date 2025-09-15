import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { decryptResponse } from '../../../utils/crypto.util';
import Swal from 'sweetalert2';

import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';
import { lastValueFrom } from 'rxjs';

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
  approvedLoanAmount: number = 0;

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

  // safe number parser (strip commas/currency and return 0 on bad values)
  private toNumber(value: any): number {
    if (value == null) return 0;
    if (typeof value === 'number') return value;
    let s = String(value);
    // remove commas and non-numeric except dot and minus
    s = s.replace(/,/g, '').replace(/[^\d.\-]/g, '');
    const n = Number(s);
    return isNaN(n) ? 0 : n;
  }

  // Try multiple keys for loan amount (safe fallback)
  private extractLoanAmountFromLoanObj(loanObj: any): number {
    if (!loanObj) return 0;
    const keys = [
      'loan_amount',
      'approved_loan_amount',
      'approved_amount',
      'amount',
      'principal_amount',
      'loan_amount_approved',
      'amount_approved',
      'approved'
    ];
    for (const k of keys) {
      if (loanObj[k] !== undefined && loanObj[k] !== null && loanObj[k] !== '') {
        return this.toNumber(loanObj[k]);
      }
    }
    return 0;
  }

  fetchAmortizationData(id: string | number): void {
    this.http.get<any>(`${environment.baseUrl}/api/maker/${id}`).subscribe({
      next: (response) => {
        // decrypted payload from backend
        const decrypted = decryptResponse(response.encrypted, this.encryptionKey);

        // DEBUG: inspect payload in console (open browser devtools -> Console)
        console.log('[Amortization] decrypted payload:', decrypted);

        this.firstName = decrypted.first_name ?? '';
        this.lastName = decrypted.last_name ?? '';

        const amortizations = decrypted.loan_amortizations || [];
        const loanApplications = decrypted.applications || [];

        // filter active (not completed) loans
        const activeLoans = loanApplications.filter(
          (loan: any) => loan.loan_status !== 'completed'
        );

        // If active loan exists, extract loan amount robustly
        if (activeLoans.length > 0) {
          const amt = this.extractLoanAmountFromLoanObj(activeLoans[0]);
          this.approvedLoanAmount = amt;
        }

        // If approvedLoanAmount still 0, try to derive from amortization rows (fallback)
        if (!this.approvedLoanAmount && amortizations && amortizations.length > 0) {
          // If amortizations contain principal & remaining_balance, derive original:
          const first = amortizations[0];
          const principalVal = this.toNumber(first.principal);
          const remainingBalanceVal = this.toNumber(first.remaining_balance);
          if (principalVal || remainingBalanceVal) {
            this.approvedLoanAmount = principalVal + remainingBalanceVal;
            console.warn('[Amortization] fallback computed approvedLoanAmount:', this.approvedLoanAmount);
          }
        }

        // filter amortizations linked to active loans (careful with types)
        const activeLoanIds = activeLoans.map((l: any) => String(l.id));
        const filteredAmortizations = amortizations.filter(
          (amort: any) => activeLoanIds.length === 0 || activeLoanIds.includes(String(amort.loan_id))
        );

        // sort by installment number (numeric)
        filteredAmortizations.sort((a: any, b: any) => {
          return (this.toNumber(a.installment_no) - this.toNumber(b.installment_no));
        });

        // Debug approved loan amount
        console.log('[Amortization] approvedLoanAmount:', this.approvedLoanAmount);

        // Build amortization rows with running balance
        let runningBalance = this.approvedLoanAmount;

        this.amortizationData = filteredAmortizations.map((item: any) => {
          const principalAmortization = this.toNumber(item.principal);
          const monthlyInterest = this.toNumber(item.interest);
          const totalAmortization = principalAmortization + monthlyInterest;
          const biMonthlyAmortization = totalAmortization / 2;

          const principalBeforePayment = runningBalance; // show starting balance for this row
          runningBalance = +(runningBalance - principalAmortization); // update running balance

          // ensure non-negative final display (avoid -0.00)
          const monthlyBalanceDisplay = runningBalance < 0.005 ? 0 : runningBalance;

          return {
            id: item.id,
            month: this.toNumber(item.installment_no),
            principal: principalBeforePayment,
            principalAmortization,
            monthlyInterest,
            totalAmortization,
            biMonthlyAmortization,
            monthlyBalance: monthlyBalanceDisplay,
            amountDeducted: item.total_payment ?? totalAmortization,
            status: item.status,
            dateDeducted: item.date_deducted ?? '',
          };
        });

        this.loading = false;
      },
      error: (err) => {
        console.error('fetchAmortizationData error', err);
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

  updateStatus(amortization: any, newStatus: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to update the status to "${newStatus}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, update it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.http
          .patch(
            `${environment.baseUrl}/api/amortization/${amortization.id}/status`,
            { status: newStatus },
            { headers: { 'Content-Type': 'application/json' } }
          )
          .subscribe({
            next: () => {
              amortization.status = newStatus;
              this.fetchAmortizationData(this.data.id);
              Swal.fire({
                icon: 'success',
                title: 'Status Updated',
                text: `The status has been successfully updated to "${newStatus}".`,
                confirmButtonColor: '#3085d6',
              });
            },
            error: (err) => {
              console.error('Failed to update status:', err);
              Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: 'There was an error updating the status. Please try again.',
                confirmButtonColor: '#d33',
              });
            },
          });
      }
    });
  }

  async exportExcel(): Promise<void> {
    if (!this.amortizationData || this.amortizationData.length === 0) {
      Swal.fire('No Data', 'There are no amortization records to export.', 'info');
      return;
    }

    try {
      const arrayBuffer = await lastValueFrom(
        this.http.get('assets/AMORTIZATION_SCHEDULE.xlsx', { responseType: 'arraybuffer' })
      );

      const wb = new Workbook();
      await wb.xlsx.load(arrayBuffer);
      const ws = wb.worksheets[0];

      const fullName = `${this.firstName} ${this.lastName}`.trim();
      ws.getCell('D8').value = fullName; // Maker Full Name
      ws.getCell('D10').value = this.data?.comakerName ?? '';
      ws.getCell('K8').value = this.approvedLoanAmount; // loan amount

      const loanTerm =
        this.data?.loanTerm ??
        this.amortizationData.length; // fallback: amortization count
      ws.getCell('E15').value = `${loanTerm}`;

      const headerRowIndex = 18;
      const dataStartRow = headerRowIndex + 1;

      const colMap: Record<string, number> = {
        no: 2,
        month: 3,
        principal: 4,
        principalAmortization: 5,
        monthlyInterest: 6,
        totalAmortization: 7,
        biMonthlyAmortization: 8,
        monthlyBalance: 9,
        amountDeducted: 11,
      };

      this.amortizationData.forEach((item, idx) => {
        const r = dataStartRow + idx;
        const row = ws.getRow(r);

        row.getCell(colMap['no']).value = idx + 1;
        row.getCell(colMap['month']).value = item.month;
        row.getCell(colMap['principal']).value = item.principal;
        row.getCell(colMap['principalAmortization']).value = item.principalAmortization;
        row.getCell(colMap['monthlyInterest']).value = item.monthlyInterest;
        row.getCell(colMap['totalAmortization']).value = item.totalAmortization;
        row.getCell(colMap['biMonthlyAmortization']).value = item.biMonthlyAmortization;
        row.getCell(colMap['monthlyBalance']).value = item.monthlyBalance;
        row.getCell(colMap['amountDeducted']).value = item.amountDeducted;

        row.commit();
      });

      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      saveAs(blob, `Amortization_Schedule_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (err) {
      console.error('Export failed:', err);
      Swal.fire('Export Error', 'Failed to generate the amortization report.', 'error');
    }
  }
}
