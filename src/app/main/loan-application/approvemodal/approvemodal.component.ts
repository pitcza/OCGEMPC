import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-approvemodal',
  standalone: false,
  templateUrl: './approvemodal.component.html',
  styleUrl: './approvemodal.component.scss'
})
export class ApprovemodalComponent {
  constructor(
    private dialogRef: MatDialogRef<ApprovemodalComponent>,
    private dialog: MatDialog,

  )
  {};

  closeModal(): void{
    this.dialogRef.close();
  }
}
