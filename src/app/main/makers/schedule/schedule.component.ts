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
  dept: string = '';
  loanType: string = '';
  appliedAmount: string = '';
  coFirstName: string = '';
  coLastName: string = '';

  loanAmortizations: { 
    loanType: string; 
    approvedLoanAmount: number; 
    amortizations: any[]; 
  }[] = [];
  
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
      'applied_amount',
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
        const decrypted = decryptResponse(response.encrypted, this.encryptionKey);

        this.firstName = decrypted.first_name ?? '';
        this.lastName = decrypted.last_name ?? '';
        this.dept = decrypted.dept ?? '';

        const loanApplications = decrypted.applications || [];
        if (loanApplications.length > 0) {
          const firstLoan = loanApplications[0];
          if (firstLoan.coMakers && firstLoan.coMakers.length > 0) {
            this.coFirstName = firstLoan.coMakers[0].first_name ?? '';
            this.coLastName = firstLoan.coMakers[0].last_name ?? '';
          }
        }
        this.loanAmortizations = []; // reset

        loanApplications
        .filter((loan: any) => loan.loan_status?.toLowerCase() === 'approved')
        .forEach((loan: any) => {
          this.approvedLoanAmount = this.extractLoanAmountFromLoanObj(loan);
          const amortizations = (loan.loan_amortizations || []).map((item: any, idx: number) => {
            const principalAmortization = this.toNumber(item.principal);
            const monthlyInterest = this.toNumber(item.interest);
            const totalAmortization = this.toNumber(item.total_payment);
            const biMonthlyAmortization = totalAmortization / 2;
            const monthlyBalance = this.toNumber(item.remaining_balance);

            return {
              id: item.id,
              month: this.getScheduleDate(this.data?.approvalDate ?? new Date().toISOString(), idx),
              principal: monthlyBalance + principalAmortization,
              principalAmortization,
              monthlyInterest,
              totalAmortization,
              biMonthlyAmortization,
              monthlyBalance,
              amountDeducted: totalAmortization,
              status: item.status,
              dateDeducted: item.date_deducted ?? '',
            };
          });

          // push each loan type + its amortizations
          this.loanAmortizations.push({
            loanType: loan.loan_type,
            approvedLoanAmount: this.extractLoanAmountFromLoanObj(loan),
            amortizations,
          });
        });

        this.loading = false;
      },
      error: (err) => {
        console.error('fetchAmortizationData error', err);
        this.loading = false;
        this.loanAmortizations = [];
      },
    });
  }

  formatMonth(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleString('default', { month: 'short', year: 'numeric' });
  }

  private getScheduleDate(startDateStr: string, installmentIndex: number): string {
    const start = new Date(startDateStr);
    // First payment = +1 month from approval
    const paymentDate = new Date(start);
    paymentDate.setMonth(paymentDate.getMonth() + installmentIndex + 1);

    return paymentDate.toLocaleDateString('default', { month: 'short', year: 'numeric' });
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
      confirmButtonColor: '#508D4E',
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
                confirmButtonColor: '#508D4E',
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

  async exportSchedule(loan: { loanType: string; approvedLoanAmount: number; amortizations: any[] }): Promise<void> {
    if (!loan || !loan.amortizations || loan.amortizations.length === 0) {
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

      const fullName = `${this.lastName}, ${this.firstName}`.trim();
      const coFullName = `${this.coLastName}, ${this.coFirstName}`.trim();

      ws.getCell('D8').value = (fullName).toUpperCase();
      ws.getCell('D9').value = (this.dept ?? '').toUpperCase();
      ws.getCell('D10').value = coFullName ? coFullName.toUpperCase() : 'N/A';
      ws.getCell('D14').value = (loan.loanType ?? '').toUpperCase();

      ws.getCell('K8').value = this.approvedLoanAmount;

      const loanTerm = loan.amortizations.length;
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

      loan.amortizations.forEach((item, idx) => {
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

      const today = new Date().toISOString().slice(0, 10);
      const makerName = `${this.firstName}_${this.lastName}`.replace(/\s+/g, '_').toUpperCase();

      const fileName = `AMORTIZATION_SCHEDULE_${makerName}_${today}.xlsx`;
      saveAs(blob, fileName);
    } catch (err) {
      console.error('Export failed:', err);
      Swal.fire('Export Error', 'Failed to generate the amortization report.', 'error');
    }
  }

  async exportLedger(loan: { loanType: string; approvedLoanAmount: number; amortizations: any[] }): Promise<void> {
    if (!loan || !loan.amortizations || loan.amortizations.length === 0) {
      Swal.fire('No Data', 'There are no ledger records to export.', 'info');
      return;
    }

    try {
      const arrayBuffer = await lastValueFrom(
        this.http.get('assets/LEDGER.xlsx', { responseType: 'arraybuffer' })
      );

      const wb = new Workbook();
      await wb.xlsx.load(arrayBuffer);
      const ws = wb.worksheets[0];

      const fullName = `${this.lastName}, ${this.firstName}`.trim();
      const coFullName = `${this.coLastName}, ${this.coFirstName}`.trim();

      ws.getCell('D7').value = (fullName).toUpperCase();
      ws.getCell('D8').value = (this.dept ?? '').toUpperCase();
      ws.getCell('D9').value = coFullName ? coFullName.toUpperCase() : 'N/A';
      ws.getCell('D13').value = (loan.loanType ?? '').toUpperCase();

      ws.getCell('O7').value = this.approvedLoanAmount;

      const loanTerm = loan.amortizations.length;
      ws.getCell('E14').value = `${loanTerm}`;

      const headerRowIndex = 17;
      const dataStartRow = headerRowIndex + 1;

      const colMap: Record<string, number> = {
        no: 2,
        month: 3,
        principal: 4,
        principalAmortization: 5,
        monthlyInterest: 6,
        totalAmortization: 7,
        biMonthlyAmortization: 8,
        monthlyBalance: 9
      };

      loan.amortizations.forEach((item, idx) => {
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
        row.commit();
      });

      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const today = new Date().toISOString().slice(0, 10);
      const makerName = `${this.firstName}_${this.lastName}`.replace(/\s+/g, '_').toUpperCase();

      const fileName = `LEDGER_${makerName}_${today}.xlsx`;
      saveAs(blob, fileName);
    } catch (err) {
      console.error('Export failed:', err);
      Swal.fire('Export Error', 'Failed to generate the ledger report.', 'error');
    }
  }

}