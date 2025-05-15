import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SetScheduleComponent } from '../set-schedule/set-schedule.component';

@Component({
  selector: 'app-view-application',
  standalone: false,
  templateUrl: './view-application.component.html',
  styleUrl: './view-application.component.scss'
})
export class ViewApplicationComponent {
  status: string = 'pending';

  constructor(
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<ViewApplicationComponent>
  ) {}

  setSchedule() {
    this.dialog.open(SetScheduleComponent);
  }

  closeModal(): void {
    this.dialogRef.close();
  }

  validatePhoneNumberInput(event: KeyboardEvent) {
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
    if (!/^\d$/.test(event.key) && !allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  }
}
