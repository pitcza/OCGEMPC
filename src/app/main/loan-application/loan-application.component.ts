import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ViewApplicationComponent } from './view-application/view-application.component';
import { AddApplicationComponent } from './add-application/add-application.component';

@Component({
  selector: 'app-loan-application',
  standalone: false,
  templateUrl: './loan-application.component.html',
  styleUrl: './loan-application.component.scss'
})
export class LoanApplicationComponent {
  constructor(
    private dialog: MatDialog,
  ) {}

  addApplication() {
    this.dialog.open(AddApplicationComponent);
  }

  viewApplication() {
    this.dialog.open(ViewApplicationComponent);
  }
}
