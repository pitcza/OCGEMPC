import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';
import { decryptResponse } from '../../utils/crypto.util';
// import * as XLSX from 'xlsx';
// import { saveAs } from 'file-saver';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';
import { lastValueFrom } from 'rxjs';

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
    birthdate?: string;
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
    'birthdate',
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

  async downloadReport(): Promise<void> {
    if (!this.filteredInsurances || this.filteredInsurances.length === 0) {
      Swal.fire('No Data', 'There are no insurance records to export.', 'info');
      return;
    }

    try {
      const arrayBuffer = await this.http
        .get('assets/LPPI-LPF.xlsx', { responseType: 'arraybuffer' })
        .toPromise();

      const wb = new Workbook();
      await wb.xlsx.load(arrayBuffer!);
      const ws = wb.worksheets[0]; // adjust if your sheet is not the first

      const headerRowIndex = 17; // template header
      const dataStartRow = headerRowIndex + 1;

      const colMap: Record<string, number> = {
        no: 1,
        certificateNo: 2,
        surname: 3,
        firstName: 4,
        middleName: 5,
        birthday: 6,
        age: 7,
        sumInsured: 8,
        effectiveDate: 9,
        expiryDate: 10,
        term: 11,
        status: 12,
        grossPremium: 13
      };

      // helper: safely parse dates
      const toDate = (val?: string) => {
        if (!val) return null;
        const d = new Date(val);
        return isNaN(d.getTime()) ? null : d;
      };

      this.filteredInsurances.forEach((item, idx) => {
        const r = dataStartRow + idx;
        const row = ws.getRow(r);

        const maker = this.insurances.find(i => i.certificate_no === item.certificateNo)?.maker;

        row.getCell(colMap['no']).value = idx + 1;
        row.getCell(colMap['certificateNo']).value = item.certificateNo ?? '';
        row.getCell(colMap['surname']).value = maker?.last_name ?? '';
        row.getCell(colMap['firstName']).value = maker?.first_name ?? '';
        row.getCell(colMap['middleName']).value = maker?.middle_name ?? '';

        // Birthday
        const bdate = toDate(maker?.birthdate);
        if (bdate) {
          const c = row.getCell(colMap['birthday']);
          c.value = bdate;
          c.numFmt = 'mm/dd/yy';
        } else {
          row.getCell(colMap['birthday']).value = '';
        }

        row.getCell(colMap['age']).value = item.age ?? '';

        // Sum Insured (number)
        const sumInsuredNum = Number(String(item.sumInsured).replace(/[^0-9.\-]/g, '')) || 0;
        row.getCell(colMap['sumInsured']).value = sumInsuredNum;

        // Effective / Expiry Dates
        const eff = toDate(item.effectiveDate);
        if (eff) {
          const c = row.getCell(colMap['effectiveDate']);
          c.value = eff;
          c.numFmt = 'mm/dd/yy';
        } else {
          row.getCell(colMap['effectiveDate']).value = '';
        }

        const exp = toDate(item.expiryDate);
        if (exp) {
          const c2 = row.getCell(colMap['expiryDate']);
          c2.value = exp;
          c2.numFmt = 'mm/dd/yy';
        } else {
          row.getCell(colMap['expiryDate']).value = '';
        }

        row.getCell(colMap['term']).value = item.term ?? '';
        row.getCell(colMap['status']).value = item.status ?? '';

        const grossNum = Number(String(item.grossPremium).replace(/[^0-9.\-]/g, '')) || 0;
        const gpCell = row.getCell(colMap['grossPremium']);
        gpCell.value = grossNum;
        gpCell.numFmt = '#,##0.00';

        row.commit();
      });

      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      saveAs(blob, `LPPI-LPF_${new Date().toISOString().slice(0,10)}.xlsx`);
    } catch (err) {
      console.error(err);
      Swal.fire('Export Error', 'Failed to generate the report from the template.', 'error');
    }
  }
}

