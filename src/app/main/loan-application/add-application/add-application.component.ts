import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-application',
  standalone: false,
  templateUrl: './add-application.component.html',
  styleUrl: './add-application.component.scss'
})
export class AddApplicationComponent {
  isCoMakersFormVisible = false;
  
  constructor(
    private dialogRef: MatDialogRef<AddApplicationComponent>
  ) {}

  validatePhoneNumberInput(event: KeyboardEvent) {
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
    if (!/^\d$/.test(event.key) && !allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  showCoMakersForm(): void {
    this.isCoMakersFormVisible = true;
  }

  showMakersForm(): void {
    this.isCoMakersFormVisible = false;
  }

  closeModal(): void {
    this.dialogRef.close();
  }
}