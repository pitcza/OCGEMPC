import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoanApplicationService } from './loan-application.service';
import { Observable } from 'rxjs';
import { Comaker, Maker } from '../../../models/models';
import { MakerService } from '../../makers/makers.service';
import { ComakerService } from '../../comakers/comakers.service';
import { decryptResponse } from '../../../utils/crypto.util';
import { environment } from '../../../../environments/environment';
import { NewMakerComponent } from '../../makers/new-maker/new-maker.component';
import { NewCoMakerComponent } from '../../comakers/new-comaker/new-comaker.component';

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
  comakers: Comaker[] = [];
  filteredMakers: Maker[] = [];
  filteredComakers: Comaker[] = [];

  selectedMaker: Maker | null = null;
  selectedComaker: Comaker | null = null;
  makerSearchTerm = '';
  comakerSearchTerm = '';

  constructor(
    private dialogRef: MatDialogRef<AddApplicationComponent>,
    private fb: FormBuilder,
    private loanService: LoanApplicationService,
    private makerService: MakerService,
    private comakerService: ComakerService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: { preSelectedMaker?: Maker }
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadMakers();
    this.loadComakers();

    if (this.data?.preSelectedMaker) {
      this.onMakerSelect(this.data.preSelectedMaker);
    }
  }

  initializeForm(): void {
    this.loanForm = this.fb.group({
      maker_id: ['', Validators.required],
      co_maker_id: ['', Validators.required],
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

  private encryptionKey = environment.encryptionKey;

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

  loadComakers(): void {
    this.comakerService.getAllComakers().subscribe({
      next: (response: any) => {
        try {
          const decrypted = decryptResponse(
            response.encrypted,
            this.encryptionKey
          );
          this.comakers = decrypted;
          this.filteredComakers = [...decrypted];
        } catch (e) {
          console.error('Decryption failed:', e);
          this.apiError = 'Failed to decrypt comakers. Please contact support.';
        }
      },
      error: (err) => {
        console.error('Failed to load comakers:', err);
        this.apiError = 'Failed to load comakers. Please try again.';
      },
    });
  }

  filterMakers(): void {
    if (!this.makerSearchTerm) {
      this.filteredMakers = [...this.makers];
      return;
    }

    const term = this.makerSearchTerm.toLowerCase().trim();

    this.filteredMakers = this.makers.filter((maker) => {
      // Check if maker exists and has the required properties
      if (!maker) return false;

      const fullName = `${maker.first_name || ''} ${
        maker.last_name || ''
      }`.toLowerCase();
      const position = maker.position?.toLowerCase() || '';
      const dept = maker.dept?.toLowerCase() || '';

      return (
        (maker.first_name && maker.first_name.toLowerCase().includes(term)) ||
        (maker.last_name && maker.last_name.toLowerCase().includes(term)) ||
        fullName.includes(term) ||
        position.includes(term) ||
        dept.includes(term)
      );
    });
  }

  filterComakers(): void {
    if (!this.comakerSearchTerm) {
      this.filteredComakers = [...this.comakers];
      return;
    }

    const term = this.comakerSearchTerm.toLowerCase().trim();

    this.filteredComakers = this.comakers.filter((comaker) => {
      // Check if comaker exists and has the required properties
      if (!comaker) return false;

      const fullName = `${comaker.co_first_name || ''} ${
        comaker.co_last_name || ''
      }`.toLowerCase();
      const position = comaker.co_position?.toLowerCase() || '';
      const dept = comaker.co_dept?.toLowerCase() || '';

      return (
        (comaker.co_first_name &&
          comaker.co_first_name.toLowerCase().includes(term)) ||
        (comaker.co_last_name &&
          comaker.co_last_name.toLowerCase().includes(term)) ||
        fullName.includes(term) ||
        position.includes(term) ||
        dept.includes(term)
      );
    });
  }

  scrollToBottom(): void {
    setTimeout(() => {
      if (this.modalBody && this.modalBody.nativeElement) {
        this.modalBody.nativeElement.scrollTop =
          this.modalBody.nativeElement.scrollHeight;
      }
    }, 100); // slight delay to wait for DOM update
  }

  onMakerSelect(maker: Maker): void {
    this.selectedMaker = maker;
    this.loanForm.patchValue({ maker_id: maker.id });
    this.makerSearchTerm = '';
    this.filterMakers();
    this.scrollToBottom();
  }

  onComakerSelect(comaker: Comaker): void {
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

              // Select the newly added maker (assume it's the last one)
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

  openNewComakerDialog(): void {
    const dialogRef = this.dialog.open(NewCoMakerComponent, {
      width: '800px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.comakerService.getAllComakers().subscribe({
          next: (response: any) => {
            try {
              const decrypted = decryptResponse(
                response.encrypted,
                this.encryptionKey
              );
              this.comakers = decrypted;
              this.filteredComakers = [...decrypted];

              // Select the newly added comaker
              const newComaker = this.comakers[this.comakers.length - 1];
              this.onComakerSelect(newComaker);
            } catch (e) {
              console.error('Decryption failed:', e);
              this.apiError =
                'Failed to decrypt comakers. Please contact support.';
            }
          },
          error: (err) => {
            console.error('Failed to load comakers:', err);
            this.apiError = 'Failed to load comakers. Please try again.';
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
      return;
    }

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

    this.loanService.createLoanApplication(formValue).subscribe({
      next: (res) => {
        const decrypted = decryptResponse(res.encrypted, this.encryptionKey);

        this.isSubmitting = false;
        this.dialogRef.close({
          success: true,
          loanId: decrypted.loan.id,
          status: 'pending',
        });
      },
      error: (err) => {
        this.isSubmitting = false;
        this.apiError =
          err?.error?.message || 'Submission failed. Please try again.';
      },
    });
  }
}
