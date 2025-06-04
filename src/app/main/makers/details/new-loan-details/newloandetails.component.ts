import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-newloandetails',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './newloandetails.component.html',
  styleUrls: ['./newloandetails.component.scss'],
})
export class NewLoanDetails implements OnInit {
  loanForm!: FormGroup;
  isSubmitting = false;
  isNextClicked = false;
  isNewCoMakerClicked = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<NewLoanDetails>
  ) {}

  ngOnInit(): void {
    this.loanForm = this.fb.group({
      loan_type: ['', Validators.required],
      applied_amount: ['', Validators.required],
      loan_term: ['', Validators.required],
      loan_purpose: ['', Validators.required],
      repayment_freq: ['', Validators.required],

      // Co-maker fields
      co_first_name: [''],
      co_middle_name: [''],
      co_last_name: [''],
      co_ext_name: [''],
      co_address: [''],
      co_phone_num: [''],
      co_birthdate: [''],
      co_age: [''],
      co_dept: [''],
      co_position: [''],
      co_salary: [''],
      co_ee_status: [''],
      co_years_coop: [''],
      co_share_amount: [''],
      co_saving_amount: [''],
    });
  }

  closeModal(): void {
    this.dialogRef.close();
  }

  goToNext(): void {
    if (this.loanForm.valid) {
      this.isNextClicked = true;
    } else {
      this.loanForm.markAllAsTouched();
    }
  }

  addNewCoMakers(): void {
    this.isNewCoMakerClicked = true;
  }

  previewCoMakers(): void {
    console.log('Preview Co-Makers clicked');
  }

  onSubmit(): void {
    if (this.loanForm.valid) {
      this.isSubmitting = true;

      setTimeout(() => {
        console.log('Form submitted:', this.loanForm.value);
        this.isSubmitting = false;
        this.isNewCoMakerClicked = false;
        this.isNextClicked = false;
        this.loanForm.reset();
      }, 1000);
    } else {
      this.loanForm.markAllAsTouched();
    }
  }
}
