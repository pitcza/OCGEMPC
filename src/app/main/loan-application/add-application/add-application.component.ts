import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoanApplicationService } from './loan-application.service';
import { Maker } from '../../../models/models';
import { MakerService } from '../../makers/makers.service';
import { decryptResponse } from '../../../utils/crypto.util';
import { environment } from '../../../../environments/environment';
import { NewMakerComponent } from '../../makers/new-maker/new-maker.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-application',
  standalone: false,
  templateUrl: './add-application.component.html',
  styleUrls: ['./add-application.component.scss'],
})
export class AddApplicationComponent implements OnInit {
  @ViewChild('modalBody') modalBody!: ElementRef;
  loanForm!: FormGroup;
  isSubmitting = false;
  apiError: string | null = null;

  makers: Maker[] = [];
  filteredMakers: Maker[] = [];
  filteredComakers: Maker[] = [];

  selectedMaker: Maker | null = null;
  selectedComaker: Maker | null = null;
  makerSearchTerm = '';
  comakerSearchTerm = '';

  private encryptionKey = environment.encryptionKey;

  constructor(
    private dialogRef: MatDialogRef<AddApplicationComponent>,
    private fb: FormBuilder,
    private loanService: LoanApplicationService,
    private makerService: MakerService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: { preSelectedMaker?: Maker }
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadMakers();

    if (this.data?.preSelectedMaker) {
      this.onMakerSelect(this.data.preSelectedMaker);
    }
  }

  initializeForm(): void {
    this.loanForm = this.fb.group({
      maker_id: ['', Validators.required],
      co_maker_id: [null],
      loan_type: ['', Validators.required],
      applied_amount: ['', [Validators.required, Validators.min(1000)]],
      loan_term: ['', [Validators.required, Validators.min(1)]],
      loan_purpose: ['', Validators.required],
      repayment_freq: ['Monthly', Validators.required],
      payslip: [false],
      valid_id: [false],
      company_id: [false],
      proof_of_billing: [false],
      employment_details: [false],
      barangay_clearance: [false],
    });
  }

  loadMakers(): void {
    this.makerService.getAllMakers().subscribe({
      next: (response: any) => {
        try {
          const decrypted = decryptResponse(
            response.encrypted,
            this.encryptionKey
          );
          this.makers = decrypted;
          this.filteredMakers = [...decrypted];
          this.filteredComakers = [...decrypted];
        } catch (e) {
          console.error('Decryption failed:', e);
          this.apiError = 'Failed to decrypt makers. Please contact support.';
        }
      },
      error: (err) => {
        console.error('Failed to load makers:', err);
        this.apiError = 'Failed to load makers. Please try again.';
      },
    });
  }

  filterMakers(): void {
    const term = this.makerSearchTerm.toLowerCase().trim();
    this.filteredMakers = this.makers.filter((m) =>
      `${m.first_name} ${m.last_name}`.toLowerCase().includes(term) ||
      m.position?.toLowerCase().includes(term) ||
      m.dept?.toLowerCase().includes(term)
    );
  }

  filterComakers(): void {
    const term = this.comakerSearchTerm.toLowerCase().trim();
    this.filteredComakers = this.makers
      .filter((m) => m.id !== this.selectedMaker?.id) // exclude selected Maker
      .filter((m) =>
        `${m.first_name} ${m.last_name}`.toLowerCase().includes(term) ||
        m.position?.toLowerCase().includes(term) ||
        m.dept?.toLowerCase().includes(term)
      );
  }

  scrollToBottom(): void {
    setTimeout(() => {
      if (this.modalBody && this.modalBody.nativeElement) {
        this.modalBody.nativeElement.scrollTop =
          this.modalBody.nativeElement.scrollHeight;
      }
    }, 100);
  }

  onMakerSelect(maker: Maker): void {
    this.selectedMaker = maker;
    this.loanForm.patchValue({ maker_id: maker.id });
    this.makerSearchTerm = '';
    this.filterMakers();
    this.scrollToBottom();
  }

  onComakerSelect(comaker: Maker): void {
    if (this.selectedMaker && this.selectedMaker.id === comaker.id) {
      Swal.fire(
        'Invalid Selection',
        'Maker and Co-maker cannot be the same.',
        'warning'
      );
      return;
    }
    this.selectedComaker = comaker;
    this.loanForm.patchValue({ co_maker_id: comaker.id });
    this.comakerSearchTerm = '';
    this.filterComakers();
    this.scrollToBottom();
  }

  openNewMakerDialog(): void {
    const dialogRef = this.dialog.open(NewMakerComponent, {
      width: '800px',
      disableClose: true,
      data: { fromLoanApplication: true },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.makerService.getAllMakers().subscribe({
          next: (response: any) => {
            try {
              const decrypted = decryptResponse(
                response.encrypted,
                this.encryptionKey
              );
              this.makers = decrypted;
              this.filteredMakers = [...decrypted];
              this.filteredComakers = [...decrypted];

              // auto-select newly added Maker
              const newMaker = this.makers[this.makers.length - 1];
              this.onMakerSelect(newMaker);
            } catch (e) {
              console.error('Decryption failed:', e);
              this.apiError =
                'Failed to decrypt makers. Please contact support.';
            }
          },
          error: (err) => {
            console.error('Failed to load makers:', err);
            this.apiError = 'Failed to load makers. Please try again.';
          },
        });
      }
    });
  }

  clearMakerSelection(): void {
    this.selectedMaker = null;
    this.loanForm.patchValue({ maker_id: '' });
  }

  clearComakerSelection(): void {
    this.selectedComaker = null;
    this.loanForm.patchValue({ co_maker_id: '' });
  }

  closeModal(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    this.apiError = null;

    if (this.loanForm.invalid) {
      this.loanForm.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please fill all required fields correctly before submitting.',
        confirmButtonColor: '#508D4E',
      });
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to submit this loan application?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#508D4E',
      cancelButtonColor: '#be1010',
      confirmButtonText: 'Yes, submit it',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.isSubmitting = true;

        const formValue = {
          ...this.loanForm.value,
          supporting_documents: {
            payslip: this.loanForm.value.payslip,
            valid_id: this.loanForm.value.valid_id,
            company_id: this.loanForm.value.company_id,
            proof_of_billing: this.loanForm.value.proof_of_billing,
            employment_details: this.loanForm.value.employment_details,
            barangay_clearance: this.loanForm.value.barangay_clearance,
          },
        };

        // 🔹 Remove null co_maker_id before sending
        if (!formValue.co_maker_id) {
          delete formValue.co_maker_id;
        }

        this.loanService.createLoanApplication(formValue).subscribe({
          next: (res) => {
            const decrypted = decryptResponse(
              res.encrypted,
              this.encryptionKey
            );
            this.isSubmitting = false;

            Swal.fire({
              icon: 'success',
              title: 'Application Submitted',
              text: 'Your loan application has been submitted successfully.',
              confirmButtonColor: '#508D4E',
            }).then(() => {
              this.dialogRef.close({
                success: true,
                loanId: decrypted.loan.id,
                status: 'pending',
              });
              setTimeout(() => {
                window.location.reload();
              }, 300);
            });
          },
          error: (err) => {
            this.isSubmitting = false;

            let backendMessage = 'Submission failed. Please try again.';

            try {
              if (err?.error?.encrypted) {
                const decryptedError = decryptResponse(
                  err.error.encrypted,
                  this.encryptionKey
                );
                backendMessage = decryptedError.message || decryptedError || backendMessage;
              }
            } catch (e) {
              console.error('Failed to decrypt error:', e);
            }

            if (backendMessage.includes('already have an active')) {
              Swal.fire({
                icon: 'warning',
                title: 'Duplicate Loan Detected',
                text: backendMessage,
                confirmButtonColor: '#be1010',
              });
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Submission Failed',
                text: backendMessage,
                confirmButtonColor: '#be1010',
              });
            }
          }
        });
      }
    });
  }
}