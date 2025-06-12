import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { decryptResponse } from '../../../utils/crypto.util';
import { LoanDetailsComponent } from '../../loan-details/loan-details.component';

@Component({
  selector: 'app-details',
  standalone: false,
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss',
})
export class CoMakerDetailsComponent implements OnInit {
  comakerDetails: any = null;
  loading = true;
  error: string | null = null;
  historyData: { id: number; loanAmount: string; loanType: string; date: string; status: string }[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CoMakerDetailsComponent>,
    private http: HttpClient,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    if (this.data && this.data.id) {
      this.fetchCoMakerDetails(this.data.id);
    } else {
      this.error = 'No CoMaker ID provided.';
      this.loading = false;
    }
  }

  private encryptionKey = environment.encryptionKey;

  fetchCoMakerDetails(id: string | number): void {
    this.loading = true;
    this.http.get<any>(`${environment.baseUrl}/api/comaker/${id}`).subscribe({
      next: (details) => {
        const decrypted = decryptResponse(
          details.encrypted,
          this.encryptionKey
        );
        
        this.comakerDetails = decrypted;

        this.historyData = (decrypted.loan_applications || []).map(
          (loan: any) => ({
            id: loan.id,
            loanAmount: loan.applied_amount,
            loanType: loan.loan_type,
            date: loan.createdAt,
            status: loan.loan_status,
          })
        );

        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to fetch details.';
        this.loading = false;
      },
    });
  }

  closeModal(): void {
    this.dialogRef.close();
  }

    viewLoanDetails(loanId: number) {
    this.dialog.open(LoanDetailsComponent, {
      data: { loanId },
      panelClass: 'loan-details-dialog'
    });
}
}
