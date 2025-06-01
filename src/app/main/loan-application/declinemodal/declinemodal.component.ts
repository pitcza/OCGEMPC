import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-declinemodal',
  standalone: false,
  templateUrl: './declinemodal.component.html',
  styleUrl: './declinemodal.component.scss'
})
export class DeclinemodalComponent {
  reason: string = '';

  constructor(
    private dialogRef: MatDialogRef<DeclinemodalComponent>,
    private dialog: MatDialog,

  )
  {};
  closeModal(): void{
    this.dialogRef.close();
  }

submitDecline() {
  if (this.reason.trim()) {
    console.log('Decline reason:', this.reason);
    // Handle submission logic here
    this.closeModal();
  } else {
    alert('Please enter a reason.');
  }
}
}
