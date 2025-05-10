import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-application-list',
  standalone: false,
  templateUrl: './application-list.component.html',
  styleUrl: './application-list.component.scss'
})
export class ApplicationListComponent {
  selectedMaker = 'all';
  searchQuery = '';
  itemsPerPage = 10;
  currentPage = 1;

  constructor(private dialog: MatDialog) {}

  users = [
    { name: 'Andrea Louise Castillo', address: '421 Magnolia St., Pasig City, Metro Manila', contact: '0917-234-7789', status: 'Pending' },
    { name: 'John Michael Santos', address: '12 Kalayaan Ave., Quezon City', contact: '0918-555-1234', status: 'Pending' },
    { name: 'Maria Isabella Reyes', address: '89 D. Tuazon St., Manila', contact: '0927-321-4567', status:  'Pending' },
    { name: 'Carlos Emmanuel Cruz', address: '5 Boni Ave., Mandaluyong City', contact: '0906-789-6543', status: 'Pending' },
    { name: 'Katrina Mae De Leon', address: '76 Lopez Jaena St., San Juan', contact: '0919-234-9876', status: 'Pending' },
    { name: 'Katrina Mae De Leon', address: '76 Lopez Jaena St., San Juan', contact: '0919-234-9876', status: 'Pending' },
    { name: 'Katrina Mae De Leon', address: '76 Lopez Jaena St., San Juan', contact: '0919-234-9876', status: 'Pending' }
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
