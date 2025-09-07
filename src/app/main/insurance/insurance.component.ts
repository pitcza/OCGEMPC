import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';
import { decryptResponse } from '../../utils/crypto.util';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface InsuranceApi {
  loan_id: number;
  maker_id: number;
  billing_statement_no: string;
  certificate_no: string;
  status: 'new' | 'renewal';
  effective_date: string;
  expiry_date: string;
  term: number;
  annual_premium: string;
  monthly_premium: string;
  gross_premium: string;
  service_fee?: string;
  sum_insured: string;
  loan_application?: any; // can be expanded if needed
  maker?: {
    first_name: string;
    middle_name?: string;
    last_name: string;
    ext_name?: string;
    age: string | number;
  };
}

interface InsuranceTableRow {
  certificateNo: string;
  fullName: string;
  age: string | number | undefined;
  status: string;
  effectiveDate: string;
  expiryDate: string;
  term: number;
  sumInsured: string;
  grossPremium: string;
  billingStatementNo: string;
}

@Component({
  selector: 'app-insurance',
  standalone: false,
  templateUrl: './insurance.component.html',
  styleUrl: './insurance.component.scss'
})
export class InsuranceComponent implements OnInit {
  private encryptionKey = environment.encryptionKey;

 insurances: InsuranceApi[] = [];
  filteredInsurances: InsuranceTableRow[] = [];
  allBillingStatements: string[] = [];
  selectedBillingStatement: string = '';
  searchQuery: string = '';
  itemsPerPage: number = 10;
  currentPage: number = 1;
  totalItems: number = 0;
  totalPages: number[] = [];
  startIndex: number = 0;
  endIndex: number = 0;

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

  constructor(
    private http: HttpClient,
  ) {}

   ngOnInit() {
    this.fetchInsurances();
  }

fetchInsurances() {
  this.http.get<{ encrypted: string }>(`${environment.baseUrl}/api/insurances`).subscribe({
    next: (data) => {
      const decrypted = decryptResponse(data.encrypted, this.encryptionKey);
      if (typeof decrypted === 'string') {
        this.insurances = JSON.parse(decrypted) as InsuranceApi[];
      } else {
        this.insurances = decrypted as InsuranceApi[];
      }
      this.allBillingStatements = Array.from(new Set(this.insurances.map(i => i.billing_statement_no)));
      this.selectedBillingStatement = ''; 
      this.applyFilters();
    },
    error: (err) => {
      Swal.fire('Error', 'Failed to fetch insurances from server.', 'error');
    }
  });
}


mapToTableRow(insurance: InsuranceApi): InsuranceTableRow {
    // Compose full name from maker
    let fullName = '';
    if (insurance.maker) {
      const { last_name, first_name, middle_name, ext_name } = insurance.maker;
      fullName = [
        last_name,
        ', ',
        first_name,
        middle_name ? ' ' + middle_name : '',
        ext_name ? ' ' + ext_name : ''
      ].join('').replace(/\s+/g, ' ').trim();
    }
    // Age is not available in the API, so leave blank or calculate if DOB is available
    return {
      certificateNo: insurance.certificate_no,
      fullName,
      age: insurance.maker?.age, // If age is available, calculate here
      status: insurance.status === 'new' ? 'N' : 'R',
      effectiveDate: this.formatDate(insurance.effective_date),
      expiryDate: this.formatDate(insurance.expiry_date),
      term: insurance.term,
      sumInsured: this.formatCurrency(insurance.sum_insured),
      grossPremium: this.formatCurrency(insurance.gross_premium),
      billingStatementNo: insurance.billing_statement_no
    };
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  formatCurrency(value: string): string {
    if (!value) return '';
    return parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2 });
  }

  applyFilters() {
    // Filter by billing statement
    let filtered = this.insurances.filter(i =>
      !this.selectedBillingStatement || i.billing_statement_no === this.selectedBillingStatement
    );
    // Filter by search query (on full name or certificate no)
    if (this.searchQuery && this.searchQuery.trim() !== '') {
      const q = this.searchQuery.trim().toLowerCase();
      filtered = filtered.filter(i => {
        const fullName = [
          i.maker?.last_name,
          ', ',
          i.maker?.first_name,
          i.maker?.middle_name ? ' ' + i.maker.middle_name : '',
          i.maker?.ext_name ? ' ' + i.maker.ext_name : ''
        ].join('').replace(/\s+/g, ' ').trim().toLowerCase();
        return (
          fullName.includes(q) ||
          (i.certificate_no && i.certificate_no.toLowerCase().includes(q))
        );
      });
    }
    // Map to table rows
    const mapped = filtered.map(i => this.mapToTableRow(i));
    this.totalItems = mapped.length;
    this.setPagination(mapped);
  }

  setPagination(data: InsuranceTableRow[]) {
    this.totalPages = [];
    const pageCount = Math.ceil(this.totalItems / this.itemsPerPage);
    for (let i = 1; i <= pageCount; i++) {
      this.totalPages.push(i);
    }
    if (this.currentPage > pageCount) this.currentPage = 1;
    this.startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.endIndex = Math.min(this.startIndex + this.itemsPerPage, this.totalItems);
    this.filteredInsurances = data.slice(this.startIndex, this.endIndex);
  }

  onItemsPerPageChange() {
    this.currentPage = 1;
    this.applyFilters();
  }

  goToPreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFilters();
    }
  }

  goToNextPage() {
    if (this.currentPage < this.totalPages.length) {
      this.currentPage++;
      this.applyFilters();
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.applyFilters();
  }

  onBillingStatementChange() {
    this.currentPage = 1;
    this.applyFilters();
  }

  downloadReport(): void {
    if (!this.filteredInsurances || this.filteredInsurances.length === 0) {
      Swal.fire('No Data', 'There are no insurance records to export.', 'info');
      return;
    }

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(
      this.filteredInsurances.map(item => ({
        'Certificate No.': item.certificateNo,
        'Full Name': item.fullName,
        'Age': item.age,
        'Status': item.status,
        'Effective Date': item.effectiveDate,
        'Expiry Date': item.expiryDate,
        'Term': item.term,
        'Sum Insured': item.sumInsured,
        'Gross Premium': item.grossPremium
      }))
    );

    const workbook: XLSX.WorkBook = {
      Sheets: { 'Insurance Report': worksheet },
      SheetNames: ['Insurance Report'],
    };

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });
    const blob: Blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    saveAs(blob, `Insurance_Report_${new Date().toISOString().slice(0,10)}.xlsx`);
  }
}

