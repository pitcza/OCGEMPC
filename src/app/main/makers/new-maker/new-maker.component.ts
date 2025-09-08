import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MakerService } from '../makers.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SuccessOptionsDialog } from './success-options-dialog.component';
import { AddApplicationComponent } from '../../loan-application/add-application/add-application.component';
import { environment } from '../../../../environments/environment';
import { decryptResponse } from '../../../utils/crypto.util';
import { DuplicateConfirmationDialogComponent } from './duplicate-confirmation/duplicate-confirmation-dialog.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-new-maker',
  standalone: false,
  templateUrl: './new-maker.component.html',
  styleUrls: ['./new-maker.component.scss'],
})
export class NewMakerComponent {
  makerForm: FormGroup;
  isLoading = false;
  private encryptionKey = environment.encryptionKey;

  constructor(
    private dialogRef: MatDialogRef<NewMakerComponent>,
    private fb: FormBuilder,
    private makerService: MakerService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: { fromLoanApplication?: boolean }
  ) {
    this.makerForm = this.fb.group({
      first_name: ['', Validators.required],
      middle_name: [''],
      last_name: ['', Validators.required],
      ext_name: [''],
      address: ['', Validators.required],
      phone_num: ['', [Validators.required, Validators.pattern(/^[0-9]{11}$/)]],
      birthdate: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(18)]],
      dept: ['', Validators.required],
      position: ['', Validators.required],
      salary: ['', [Validators.required, Validators.min(0)]],
      ee_status: ['', Validators.required],
      years_coop: ['', Validators.required],
      share_amount: ['', [Validators.required, Validators.min(0)]],
      saving_amount: ['', [Validators.required, Validators.min(0)]],
    });

    this.makerForm.get('birthdate')?.valueChanges.subscribe((value: string) => {
      const age = this.calculateAge(value);
      this.makerForm.get('age')?.setValue(age);
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
    if (this.makerForm.invalid) {
      this.makerForm.markAllAsTouched();
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
      text: 'Do you want to create this maker record?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#508D4E',
      cancelButtonColor: '#be1010',
      confirmButtonText: 'Yes, create it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.makerService.checkMaker(this.makerForm.value).subscribe({
          next: (response: any) => {
            const decrypted = decryptResponse(
              response.encrypted,
              this.encryptionKey
            );
            this.isLoading = false;
            this.handleDuplicateCheckResponse(response);
          },
          error: (error) => {
            this.isLoading = false;
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: error.error?.message || 'Failed to create maker',
              confirmButtonColor: '#be1010',
            });
          },
        });
      }
    });
  }

  private handleDuplicateCheckResponse(response: any): void {
    const decrypted = decryptResponse(response.encrypted, this.encryptionKey);
    const data = decrypted.data;
    this.isLoading = false;

    if (
      data.exactMatch ||
      (data.potentialMatches && data.potentialMatches.length > 0)
    ) {
      this.showDuplicateConfirmation(data);
    } else {
      this.createMaker();
    }
  }

  private showDuplicateConfirmation(duplicateData: any): void {
    const dialogRef = this.dialog.open(DuplicateConfirmationDialogComponent, {
      data: {
        form: this.makerForm,
        matches: duplicateData.exactMatch
          ? [duplicateData.exactMatch]
          : duplicateData.potentialMatches,
        fromLoanApplication: this.data?.fromLoanApplication,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.action === 'use-existing') {
        if (this.data?.fromLoanApplication) {
          // Return existing maker directly
          this.dialogRef.close({ existingMaker: result.maker });
        } else {
          this.openLoanApplicationDialog(result.maker);
        }
      } else if (result?.action === 'create-new') {
        this.createMaker();
      }
      // Else (cancel) do nothing
    });
  }

  private createMaker(): void {
    this.isLoading = true;
    this.makerService.createMaker(this.makerForm.value).subscribe({
      next: (response: any) => {
        const decrypted = decryptResponse(
          response.encrypted,
          this.encryptionKey
        );
        this.isLoading = false;
        this.showSuccessOptions(decrypted.data);
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open(
          error.error?.message || 'Failed to create maker',
          'Close',
          { duration: 5000 }
        );
      },
    });
  }

  private showSuccessOptions(createdMaker: any): void {
    if (this.data?.fromLoanApplication) {
      // If opened from loan app, just return the maker
      this.dialogRef.close({ maker: createdMaker });
      return;
    }

    const dialogRef = this.dialog.open(SuccessOptionsDialog, {
      data: { maker: createdMaker },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'proceed') {
        this.openLoanApplicationDialog(createdMaker);
      } else {
        this.dialogRef.close(createdMaker);
      }
      setTimeout(() => {
        window.location.reload();
      }, 300);
    });
  }

  private openLoanApplicationDialog(maker: any): void {
    const loanDialogRef = this.dialog.open(AddApplicationComponent, {
      width: '800px',
      data: { preSelectedMaker: maker },
    });

    loanDialogRef.afterClosed().subscribe((result) => {
      if (result?.success) {
        this.dialogRef.close({
          loanCreated: true,
          loanId: result.loanId,
          status: result.status,
        });
      } else {
        // User cancelled loan creation, still return to parent
        this.dialogRef.close(null);
      }
    });
  }

  closeModal(): void {
    this.dialogRef.close();
  }
}
