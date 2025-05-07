import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DetailsComponent } from './details/details.component';
import { ScheduleComponent } from './schedule/schedule.component';

@Component({
  selector: 'app-makers',
  standalone: false,
  templateUrl: './makers.component.html',
  styleUrls: ['./makers.component.scss']
})
export class MakersComponent {
  selectedMaker = 'all';
  searchQuery = '';
  itemsPerPage = 10;
  currentPage = 1;

  users = [
    {
      name: 'Andrea Louise Castillo',
      address: '421 Magnolia St., Pasig City, Metro Manila',
      contact: '0917-234-7789',
      birthdate: 'March 15, 1991',
      makerType: 'officer'
    },
    {
      name: 'John Michael Santos',
      address: '12 Kalayaan Ave., Quezon City',
      contact: '0918-555-1234',
      birthdate: 'July 22, 1988',
      makerType: 'member'
    },
    {
      name: 'Maria Isabella Reyes',
      address: '89 D. Tuazon St., Manila',
      contact: '0927-321-4567',
      birthdate: 'October 3, 1995',
      makerType: 'non-member'
    },
    {
      name: 'Carlos Emmanuel Cruz',
      address: '5 Boni Ave., Mandaluyong City',
      contact: '0906-789-6543',
      birthdate: 'January 17, 1985',
      makerType: 'officer'
    },
    {
      name: 'Katrina Mae De Leon',
      address: '76 Lopez Jaena St., San Juan',
      contact: '0919-234-9876',
      birthdate: 'May 9, 1993',
      makerType: 'member'
    },
    {
      name: 'Katrina Mae De Leon',
      address: '76 Lopez Jaena St., San Juan',
      contact: '0919-234-9876',
      birthdate: 'May 9, 1993',
      makerType: 'member'
    },
    {
      name: 'Katrina Mae De Leon',
      address: '76 Lopez Jaena St., San Juan',
      contact: '0919-234-9876',
      birthdate: 'May 9, 1993',
      makerType: 'member'
    }
  ];

  filteredUsers = [...this.users];

  constructor(private dialog: MatDialog) {}

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
    return Array(this.totalPages)
      .fill(0)
      .map((_, i) => i + 1);
  }

  applyFilters() {
    this.filteredUsers = this.users.filter(user => {
      const matchesMaker = this.selectedMaker === 'all' || user.makerType === this.selectedMaker;
      const matchesSearch = user.name.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchesMaker && matchesSearch;
    });
    this.currentPage = 1; // reset to first page when filters change
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

  viewDetails(user: any) {
    this.dialog.open(DetailsComponent, {
      data: user
    });
  }

  viewSchedule(user: any) {
    this.dialog.open(ScheduleComponent, {
      data: user
    });
  }
}
