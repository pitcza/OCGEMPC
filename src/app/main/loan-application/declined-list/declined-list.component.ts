import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ViewApplicationComponent } from '../view-application/view-application.component';
import Swal from 'sweetalert2';
import { AuthService } from '../../../services/auth.services';

@Component({
  selector: 'app-declined-list',
  standalone: false,
  templateUrl: './declined-list.component.html',
  styleUrl: './declined-list.component.scss'
})
export class DeclinedListComponent {
  selectedMaker = 'all';
  searchQuery = '';
  itemsPerPage = 10;
  currentPage = 1;
  userRole: string | null = null;

  viewLoan() {
    this.dialog.open(ViewApplicationComponent);
  }

  constructor(private dialog: MatDialog, private authService: AuthService) {
    this.userRole = this.authService.cookieService.get('roleName');
  }

  // sample data
  users = [
    { name: 'Andrea Louise Castillo', address: '421 Magnolia St., Pasig City, Metro Manila', contact: '0987-123-1234', remarks: 'Sample Remarks' },
    { name: 'John Michael Santos', address: '12 Kalayaan Ave., Quezon City', contact: '0987-123-1234', remarks: 'Sample Remarks' },
    { name: 'Maria Isabella Reyes', address: '89 D. Tuazon St., Manila', contact: '0987-123-1234', remarks:  'Sample Remarks' },
    { name: 'Carlos Emmanuel Cruz', address: '5 Boni Ave., Mandaluyong City', contact: '0987-123-1234', remarks: 'Sample Remarks' },
    { name: 'Katrina Mae De Leon', address: '76 Lopez Jaena St., San Juan', contact: '0987-123-1234', remarks: 'Sample Remarks' },
    { name: 'Katrina Mae De Leon', address: '76 Lopez Jaena St., San Juan', contact: '0987-123-1234', remarks: 'Sample Remarks' },
    { name: 'Katrina Mae De Leon', address: '76 Lopez Jaena St., San Juan', contact: '0987-123-1234', remarks: 'Sample Remarks' }
  ];

  filteredUsers = [...this.users];

  get totalItems() {
    return this.filteredUsers.length;
  }

  get startIndex() {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  get endIndex() {
    return Math.min(this.startIndex + this.itemsPerPage, this.totalItems);
  }

  get totalPages() {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get totalPagesArray() {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get paginatedUsers() {
    return this.filteredUsers.slice(this.startIndex, this.endIndex);
  }

  applyFilters() {
    const query = this.searchQuery.toLowerCase();
    this.filteredUsers = this.users.filter(user =>
      user.name.toLowerCase().includes(query)
    );
    this.currentPage = 1;
  }

  goToPage(page: number) {
    this.currentPage = page;
  }

  goToPreviousPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  goToNextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  onItemsPerPageChange() {
    this.currentPage = 1;
  }
}
