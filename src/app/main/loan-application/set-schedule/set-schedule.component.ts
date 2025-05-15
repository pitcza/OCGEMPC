import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-set-schedule',
  standalone: false,
  templateUrl: './set-schedule.component.html',
  styleUrl: './set-schedule.component.scss'
})
export class SetScheduleComponent {
  selectedDate: string = '';

  constructor(
    private dialogRef: MatDialogRef<SetScheduleComponent>
  ) {}

  closeModal(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (!this.selectedDate) {
      Swal.fire('Missing Date', 'Please select a date before proceeding.', 'warning');
      return;
    }

    Swal.fire({
      title: 'Confirm Schedule',
      text: `Set schedule on ${this.selectedDate}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Set it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#508D4E',
      cancelButtonColor: '#7c7777',
    }).then((result) => {
      if (result.isConfirmed) {
        // Handle the schedule setting logic here
        Swal.fire('Scheduled!', 'The schedule has been set.', 'success');
        this.dialogRef.close();
      }
    });
  }
}
