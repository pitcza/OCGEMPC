import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-insurance',
  standalone: false,
  templateUrl: './insurance.component.html',
  styleUrl: './insurance.component.scss'
})
export class InsuranceComponent implements OnInit {
onItemsPerPageChange() {
throw new Error('Method not implemented.');
}
startIndex: any;
endIndex: any;
totalItems: any;
itemsPerPage: any;

insurances: any[] = [];
filteredInsurances: any[] = [];

  constructor(
    private http: HttpClient,
  ) {}

   ngOnInit() {
    this.fetchInsurances();
  }

    fetchInsurances() {
      this.http.get<any[]>(`${environment.baseUrl}/api/insurances`).subscribe({
        next: (data) => {
          // Filter for pending loans
          this.insurances = data;
          this.filteredInsurances = [...this.insurances];
        },
        error: (err) => {
          Swal.fire('Error', 'Failed to fetch loans from server.', 'error');
        }
      });
    }

goToPreviousPage() {
throw new Error('Method not implemented.');
}
goToPage(_t67: any) {
throw new Error('Method not implemented.');
}
totalPages: any;
goToNextPage() {
throw new Error('Method not implemented.');
}
searchQuery: any;
currentPage: any;
applyFilters() {
throw new Error('Method not implemented.');
}

    displayedColumns: string[] = [
  'certificateNo',
  'fullName',
  'age',
  'status',
  'effectiveDate',
  'expiryDate',
  'term',
  'sumInsured',
  'grossPremium'
];

dataSource = new MatTableDataSource([
  {
    certificateNo: '01234567',
    fullName: 'Castillo, Andrea Louise X',
    age: 34,
    status: 'N',
    effectiveDate: 'March 15, 2025',
    expiryDate: 'March 15, 2027',
    term: 12,
    sumInsured: '60,000',
    grossPremium: '2,000'
  },
  {
    certificateNo: '01234567',
    fullName: 'Abagansya, Teodore Peter I',
    age: 23,
    status: 'F',
    effectiveDate: 'March 15, 2025',
    expiryDate: 'March 15, 2027',
    term: 12,
    sumInsured: '60,000',
    grossPremium: '683'
  }
]);


}

