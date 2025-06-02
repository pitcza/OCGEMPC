import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { DetailsComponent } from './details/details.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { environment } from '../../../environments/environment';
import { decryptResponse } from '../../utils/crypto.util';

interface MakerUser {
  first_name: string;
  middle_name: string;
  last_name: string;
  ext_name: string;
  address: string;
  phone_num: string;
  birthdate: string;
  makerType: string;
  age: number;
  dept: string;
  position: string;
  salary: GLfloat;
  ee_status: string;
  years_coop: string;
  share_amount: GLfloat;
  saving_amount: GLfloat;
  // Add other fields as needed
}
@Component({
  selector: 'app-makers',
  standalone: false,
  templateUrl: './makers.component.html',
  styleUrls: ['./makers.component.scss']
})
export class MakersComponent implements OnInit {
  selectedMaker = 'all';
  searchQuery = '';
  itemsPerPage = 10;
  currentPage = 1;
  users: MakerUser[] = [];
  filteredUsers: MakerUser[] = [];

  private encryptionKey = environment.encryptionKey;

  constructor(
    private dialog: MatDialog,
    private http: HttpClient
  ) {}

    ngOnInit(): void {
    this.fetchUsers();
  }
  fetchUsers(): void {
    // Replace 'your-api-route' with your actual API endpoint
    this.http.get<any>(`${environment.baseUrl}/api/makers`).subscribe({
      next: (data) => {
        const decrypted = decryptResponse(data.encrypted, this.encryptionKey);
        this.users = decrypted;
        this.filteredUsers = [...this.users];
      },
      error: (err) => {
        // Handle error (optional: show notification)
        this.users = [];
        this.filteredUsers = [];
      }
    });
  }
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
      const matchesSearch = user.first_name.toLowerCase().includes(this.searchQuery.toLowerCase()) || user.last_name.toLowerCase().includes(this.searchQuery.toLowerCase());
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

   getFullName(user: any): string {
  return [user.first_name, user.last_name].filter(Boolean).join(' ');
}
}
