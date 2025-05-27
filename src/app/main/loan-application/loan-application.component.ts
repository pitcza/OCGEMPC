import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ViewApplicationComponent } from './view-application/view-application.component';
import { AddApplicationComponent } from './add-application/add-application.component';
import { AuthService } from '../../services/auth.services';

@Component({
  selector: 'app-loan-application',
  standalone: false,
  templateUrl: './loan-application.component.html',
  styleUrl: './loan-application.component.scss'
})
export class LoanApplicationComponent {
  userRole: string | null = null;
  constructor(
    private dialog: MatDialog,
    private authService: AuthService,
  ) {
      this.userRole = this.authService.cookieService.get('roleName');
  }

  addApplication() {
    this.dialog.open(AddApplicationComponent);
  }

  viewApplication() {
    this.dialog.open(ViewApplicationComponent);
  }
}
