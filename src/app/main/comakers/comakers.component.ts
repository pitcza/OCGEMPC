import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { CoMakerDetailsComponent } from './details/details.component';
import { environment } from '../../../environments/environment';
import { decryptResponse } from '../../utils/crypto.util';
import { NewCoMakerComponent } from './new-comaker/new-comaker.component';

interface CoMakerUser {
  co_first_name: string;
  co_middle_name: string;
  co_last_name: string;
  co_ext_name: string;
  co_address: string;
  co_phone_num: string;
  co_birthdate: string;
  co_age: number;
  co_dept: string;
  co_position: string;
  co_salary: GLfloat;
  co_ee_status: string;
  co_years_coop: string;
  co_share_amount: GLfloat;
  co_saving_amount: GLfloat;
  // Add other fields as needed
}
@Component({
  selector: 'app-comakers',
  standalone: false,
  templateUrl: './comakers.component.html',
  styleUrls: ['./comakers.component.scss'],
})
export class CoMakersComponent implements OnInit {
  selectedMaker = 'all';
  searchQuery = '';
  itemsPerPage = 10;
  currentPage = 1;
  users: CoMakerUser[] = [];
  filteredUsers: CoMakerUser[] = [];
  pagedUsers: CoMakerUser[] = [];

  private encryptionKey = environment.encryptionKey;

  constructor(private dialog: MatDialog, private http: HttpClient) {}

  ngOnInit(): void {
    const storedItemsPerPage = localStorage.getItem('comakersItemsPerPage');
    const storedCurrentPage = localStorage.getItem('comakersCurrentPage');

    if (storedItemsPerPage) this.itemsPerPage = +storedItemsPerPage;
    if (storedCurrentPage) this.currentPage = +storedCurrentPage;

    this.fetchUsers();
  }

  fetchUsers(): void {
    this.http.get<any>(`${environment.baseUrl}/api/comakers`).subscribe({
      next: (data) => {
        const decrypted = decryptResponse(data.encrypted, this.encryptionKey);
        this.users = decrypted;
        this.filteredUsers = [...this.users];
        this.updatePagedUsers();
      },
      error: (err) => {
        // Handle error (optional: show notification)
        this.users = [];
        this.filteredUsers = [];
        this.pagedUsers = [];
      },
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
    this.filteredUsers = this.users.filter((user) => {
      const matchesMaker = this.selectedMaker === 'all';
      const matchesSearch =
        user.co_first_name
          .toLowerCase()
          .includes(this.searchQuery.toLowerCase()) ||
        user.co_last_name
          .toLowerCase()
          .includes(this.searchQuery.toLowerCase());
      return matchesMaker && matchesSearch;
    });
    this.currentPage = 1;
    this.updatePagedUsers();
  }

  updatePagedUsers(): void {
    const start = this.startIndex;
    const end = this.endIndex;
    this.pagedUsers = this.filteredUsers.slice(start, end);
  }

  goToPage(page: number) {
    this.currentPage = page;
    localStorage.setItem('comakersCurrentPage', String(this.currentPage));
    this.updatePagedUsers();
  }

  onItemsPerPageChange() {
    this.currentPage = 1;
    localStorage.setItem('comakersItemsPerPage', String(this.itemsPerPage));
    localStorage.setItem('comakersCurrentPage', String(this.currentPage));
    this.updatePagedUsers();
  }

  goToPreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      localStorage.setItem('comakersCurrentPage', String(this.currentPage));
      this.updatePagedUsers();
    }
  }

  goToNextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      localStorage.setItem('comakersCurrentPage', String(this.currentPage));
      this.updatePagedUsers();
    }
  }

  viewDetails(user: any) {
    this.dialog.open(CoMakerDetailsComponent, {
      data: user,
    });
  }

  viewNewMaker(user: any) {
    this.dialog.open(NewCoMakerComponent, {
      data: user,
    });
  }
  getFullName(user: any): string {
    return [user.co_first_name, user.co_last_name].filter(Boolean).join(' ');
  }
}
