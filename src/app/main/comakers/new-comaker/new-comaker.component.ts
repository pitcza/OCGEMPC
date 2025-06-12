import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ComakerService } from '../comakers.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-new-co-maker',
  standalone: false,
  templateUrl: './new-comaker.component.html',
  styleUrls: ['./new-comaker.component.scss'],
})
export class NewCoMakerComponent {
  comakerForm: FormGroup;
  isLoading = false;

  constructor(
    private dialogRef: MatDialogRef<NewCoMakerComponent>,
    private fb: FormBuilder,
    private makerService: ComakerService,
    private snackBar: MatSnackBar
  ) {
    this.comakerForm = this.fb.group({
      co_first_name: ['', Validators.required],
      co_middle_name: [''],
      co_last_name: ['', Validators.required],
      co_ext_name: [''],
      co_address: ['', Validators.required],
      co_phone_num: [
        '',
        [Validators.required, Validators.pattern(/^[0-9]{11}$/)],
      ],
      co_birthdate: ['', Validators.required],
      co_age: ['', [Validators.required, Validators.min(18)]],
      co_dept: ['', Validators.required],
      co_position: ['', Validators.required],
      co_salary: ['', [Validators.required, Validators.min(0)]],
      co_ee_status: ['', Validators.required],
      co_years_coop: ['', Validators.required],
      co_share_amount: ['', [Validators.required, Validators.min(0)]],
      co_saving_amount: ['', [Validators.required, Validators.min(0)]],
    });

    this.comakerForm
      .get('co_birthdate')
      ?.valueChanges.subscribe((value: string) => {
        const age = this.calculateAge(value);
        this.comakerForm.get('co_age')?.setValue(age);
      });
  }

  private calculateAge(birthdate: string): number {
    const birth = new Date(birthdate);
    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }

  validatePhoneNumberInput(event: KeyboardEvent) {
    const allowedKeys = [
      'Backspace',
      'Tab',
      'ArrowLeft',
      'ArrowRight',
      'Delete',
    ];
    if (!/^\d$/.test(event.key) && !allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  onSubmit(): void {
    if (this.comakerForm.invalid) {
      this.comakerForm.markAllAsTouched();
      this.snackBar.open('Please fill all required fields correctly', 'Close', {
        duration: 3000,
      });
      return;
    }

    this.isLoading = true;
    this.makerService.createComaker(this.comakerForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.snackBar.open('Co-Maker created successfully', 'Close', {
          duration: 3000,
        });
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error creating co-maker:', error);
        this.snackBar.open(
          error.error?.message || 'Failed to create co-maker',
          'Close',
          { duration: 5000 }
        );
      },
    });
  }

  closeModal(): void {
    this.dialogRef.close();
  }
}
