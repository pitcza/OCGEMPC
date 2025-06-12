// duplicate-confirmation-dialog.component.ts
import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-duplicate-confirmation-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, CommonModule],
  templateUrl: './duplicate-confirmation-dialog.component.html',
  styleUrls: ['./duplicate-confirmation-dialog.component.scss'],
})
export class DuplicateConfirmationDialogComponent {
  newMakerForm: FormGroup;
  existingMakers: any[];
  highestMatch: any;
  showAllMatches = false;

  constructor(
    public dialogRef: MatDialogRef<DuplicateConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.newMakerForm = data.form;
    this.existingMakers = data.matches;
    this.highestMatch = this.existingMakers[0]; // Highest confidence comes first
  }

  useExisting(maker: any): void {
    this.dialogRef.close({ action: 'use-existing', maker });
  }

  createNew(): void {
    this.dialogRef.close({ action: 'create-new' });
  }

  toggleMatches(): void {
    this.showAllMatches = !this.showAllMatches;
  }

  compareFields(field: string): boolean {
    if (!this.highestMatch || !this.newMakerForm) return false;

    const formValue = this.newMakerForm.get(field)?.value;
    const matchValue = this.highestMatch[field];

    // String comparison (case-insensitive)
    if (typeof formValue === 'string' && typeof matchValue === 'string') {
      return formValue.toLowerCase() === matchValue.toLowerCase();
    }

    // Number comparison (including numeric strings like "100.00")
    const formNumber = parseFloat(formValue);
    const matchNumber = parseFloat(matchValue);
    if (!isNaN(formNumber) && !isNaN(matchNumber)) {
      return formNumber === matchNumber;
    }

    // Fallback (strict equality)
    return formValue === matchValue;
  }

  getFormFields(): string[] {
    return [
      'first_name',
      'middle_name',
      'last_name',
      'ext_name',
      'address',
      'phone_num',
      'birthdate',
      'age',
      'dept',
      'position',
      'salary',
      'ee_status',
      'years_coop',
      'share_amount',
      'saving_amount',
    ];
  }

  getFieldLabel(field: string): string {
    const labels: Record<string, string> = {
      first_name: 'First Name',
      middle_name: 'Middle Name',
      last_name: 'Last Name',
      ext_name: 'Ext. Name',
      address: 'Address',
      phone_num: 'Phone Number',
      birthdate: 'Date of Birth',
      age: 'Age',
      dept: 'Department',
      position: 'Position',
      salary: 'Salary',
      ee_status: 'Employment Status',
      years_coop: 'Years as Coop Member',
      share_amount: 'Amount of Shares',
      saving_amount: 'Amount of Saving',
    };

    return labels[field] || field;
  }
}
