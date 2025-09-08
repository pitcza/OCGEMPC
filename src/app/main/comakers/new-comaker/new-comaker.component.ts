import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ComakerService } from '../comakers.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';

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
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please fill all required fields correctly',
        confirmButtonColor: '#508D4E',
      });
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to create this Co-Maker record?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#508D4E',
      cancelButtonColor: '#be1010',
      confirmButtonText: 'Yes, create it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.makerService.createComaker(this.comakerForm.value).subscribe({
          next: (response) => {
            this.isLoading = false;
            Swal.fire({
              icon: 'success',
              title: 'Co-Maker Created',
              text: 'The Co-Maker was successfully created.',
              confirmButtonColor: '#508D4E',
            }).then((res) => {
                if (res.isConfirmed) {
                  this.dialogRef.close(true);
                  window.location.reload(); 
                }
              });
            },
          error: (error) => {
            this.isLoading = false;
            console.error('Error creating co-maker:', error);
            Swal.fire({
              icon: 'error',
              title: 'Creation Failed',
              text: error.error?.message || 'Failed to create co-maker',
              confirmButtonColor: '#be1010',
            });
          },
        });
      }
    });
  }

  closeModal(): void {
    this.dialogRef.close();
  }
}
