import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-view-application',
  standalone: false,
  templateUrl: './view-application.component.html',
  styleUrl: './view-application.component.scss'
})
export class ViewApplicationComponent {
  constructor(
    private dialogRef: MatDialogRef<ViewApplicationComponent>
  ) {}

  closeModal(): void {
    this.dialogRef.close();
  }
}
