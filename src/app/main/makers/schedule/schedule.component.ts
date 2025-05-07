import { Component, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-schedule',
  standalone: false,
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.scss'
})
export class ScheduleComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ScheduleComponent>
  ) {}

  closeModal(): void {
    this.dialogRef.close();
  }


  amortizationData = [
    {
      month: 'January',
      principal: 50000,
      principalAmortization: 4000,
      monthlyInterest: 500,
      totalAmortization: 4500,
      biMonthlyAmortization: 2250,
      monthlyBalance: 46000,
      amountDeducted: 4500,
      dateDeducted: '2025-01-30'
    },
    {
      month: 'February',
      principal: 46000,
      principalAmortization: 4000,
      monthlyInterest: 460,
      totalAmortization: 4460,
      biMonthlyAmortization: 2230,
      monthlyBalance: 42000,
      amountDeducted: 4460,
      dateDeducted: '2025-02-28'
    },
    {
      month: 'March',
      principal: 42000,
      principalAmortization: 4000,
      monthlyInterest: 420,
      totalAmortization: 4420,
      biMonthlyAmortization: 2210,
      monthlyBalance: 38000,
      amountDeducted: 4420,
      dateDeducted: '2025-03-30'
    }
    // Add more entries as needed
  ];
}
