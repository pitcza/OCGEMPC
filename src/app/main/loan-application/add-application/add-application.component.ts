import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoanApplicationService } from './loan-application.service';

@Component({
  selector: 'app-add-application',
  standalone: false,
  templateUrl: './add-application.component.html',
  styleUrl: './add-application.component.scss'
})
export class AddApplicationComponent implements OnInit {
  isCoMakersFormVisible = false;
  makersForm!: FormGroup;
  coMakersForm!: FormGroup;
  isSubmitting = false;
  apiError: string | null = null;

  constructor(
    private dialogRef: MatDialogRef<AddApplicationComponent>,
    private fb: FormBuilder,
    private loanService: LoanApplicationService
  ) {}

  ngOnInit(): void {
    this.makersForm = this.fb.group({
      first_name: ['', Validators.required],
      middle_name: [''],
      last_name: ['', Validators.required],
      ext_name: [''],
      address: ['', Validators.required],
      phone_num: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      birthdate: ['', Validators.required],
      age: ['', Validators.required],
      dept: [''],
      position: [''],
      salary: [''],
      ee_status: [''],
      years_coop: [''],
      share_amount: [''],
      saving_amount: [''],
      loan_type: ['', Validators.required],
      applied_amount: ['', Validators.required],
      loan_term: ['', Validators.required],
      loan_purpose: ['', Validators.required],
      repayment_freq: ['', Validators.required]
    });

    this.coMakersForm = this.fb.group({
      co_first_name: ['', Validators.required],
      co_middle_name: [''],
      co_last_name: ['', Validators.required],
      co_ext_name: [''],
      co_address: ['', Validators.required],
      co_phone_num: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      co_birthdate: ['', Validators.required],
      co_age: ['', Validators.required],
      co_dept: [''],
      co_position: [''],
      co_salary: [''],
      co_ee_status: [''],
      co_years_coop: [''],
      co_share_amount: [''],
      co_saving_amount: ['']
    });
  }

  validatePhoneNumberInput(event: KeyboardEvent) {
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
    if (!/^\d$/.test(event.key) && !allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  showCoMakersForm(): void {
    if (this.makersForm.valid) {
      this.isCoMakersFormVisible = true;
      this.apiError = null;
    } else {
      this.makersForm.markAllAsTouched();
    }
  }

  showMakersForm(): void {
    this.isCoMakersFormVisible = false;
    this.apiError = null;
  }

  closeModal(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    this.apiError = null;
    if (this.makersForm.invalid || this.coMakersForm.invalid) {
      this.makersForm.markAllAsTouched();
      this.coMakersForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;

    // Prepare the payload according to your backend model
    const payload = {
      // You may need to adjust this mapping to match your backend expectations
      ...this.makersForm.value,
      co_maker: this.coMakersForm.value,
      supporting_documents: [] // Add logic for documents if needed
    };

    this.loanService.createLoanApplication(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.dialogRef.close(res);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.apiError = err?.error?.message || 'Submission failed';
      }
    });
  }
}
