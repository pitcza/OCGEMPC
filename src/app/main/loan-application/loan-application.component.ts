import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddApplicationComponent } from './add-application/add-application.component';
import { AuthService } from '../../services/auth.services';
import Swal from 'sweetalert2';
import { SetScheduleComponent } from './set-schedule/set-schedule.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { decryptResponse } from '../../utils/crypto.util';
import { LoanDetailsComponent } from '../loan-details/loan-details.component';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { Workbook, Column, Cell } from 'exceljs';
import { saveAs } from 'file-saver';

interface PersonalInfo {
  firstName: string;
  middleName: string;
  lastName: string;
  extName: string;
  address: string;
  contactNumber: string;
  dob: string;
  age: number;
}

interface EmploymentInfo {
  office: string;
  position: string;
  salary: string;
  status: string;
}

interface CoopInfo {
  years: string;
  shares: string;
  savings: string;
}

interface LoanInfo {
  type: string;
  amount: string;
  term: string;
  purpose: string;
  frequency: string;
  status_details: string;
}

interface Applicant {
  id: number;
  personal: PersonalInfo;
  employment: EmploymentInfo;
  coop: CoopInfo;
  loan: LoanInfo;
  requirements: string[];
  declineReason?: string;
  status: 'pending' | 'approved' | 'declined' | 'completed';
  loan_history?: LoanHistory[];
  requirements_status: {
    payslip: boolean;
    valid_id: boolean;
    company_id: boolean;
    proof_of_billing: boolean;
    employment_details: boolean;
    barangay_clearance: boolean;
  };
}

interface Requirement {
  label: string;
  key: keyof Applicant['requirements_status'];
}

interface LoanHistory {
  id: number;
  loanamount_history: string;
  date: string;
  status: string;
}
@Component({
  selector: 'app-loan-application',
  standalone: false,
  templateUrl: './loan-application.component.html',
  styleUrl: './loan-application.component.scss',
})
export class LoanApplicationComponent implements OnInit {
  selectedFilter: 'pending' | 'approved' | 'declined' | 'completed' = 'pending';
  selectedApplicant: Applicant | null = null;
  searchQuery = '';
  itemsPerPage = 10;
  currentPage = 1;
  userRole: string | null = null;
  showLoanOnly = false;
  isLoading = true;
  navigationState: { loanId: number; status: string } | null = null;
  applicants: Applicant[] = [];
  filteredApplicants: Applicant[] = [];
  standardRequirements: Requirement[] = [
    { label: 'Payslip', key: 'payslip' },
    { label: 'Valid ID', key: 'valid_id' },
    { label: 'Company ID', key: 'company_id' },
    { label: 'Proof of Billing', key: 'proof_of_billing' },
    { label: 'Employment Details', key: 'employment_details' },
    { label: 'Barangay Clearance', key: 'barangay_clearance' },
  ];

  private encryptionKey = environment.encryptionKey;

  constructor(
    private dialog: MatDialog,
    private authService: AuthService,
    private http: HttpClient,
    private route: ActivatedRoute
  ) {
    this.userRole = this.authService.cookieService.get('roleName');
  }

  getRequirementStatus(key: string): boolean {
    if (!this.selectedApplicant) return false;
    const typedKey = key as keyof Applicant['requirements_status'];
    return this.selectedApplicant.requirements_status[typedKey];
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const loanId = +params['loanId'];
      const status = params['status'];
      if (loanId && status) {
        this.navigationState = { loanId, status };
      }

      this.fetchLoans();
    });
  }

  fetchLoans() {
    this.isLoading = true;
    this.http.get<any>(`${environment.baseUrl}/api/loans`).subscribe({
      next: (data) => {
        const decrypted = decryptResponse(data.encrypted, this.encryptionKey);

        // Transform the backend data to match our frontend interface
        this.applicants = decrypted.loans.map((loan: any) => {
          // Parse the supporting_documents JSON string
          let requirementsStatus = {
            payslip: false,
            valid_id: false,
            company_id: false,
            proof_of_billing: false,
            employment_details: false,
            barangay_clearance: false,
          };

          if (loan.supporting_documents) {
            try {
              requirementsStatus = JSON.parse(loan.supporting_documents);
            } catch (e) {
              console.error('Error parsing supporting_documents:', e);
            }
          }

          return {
            id: loan.id,
            personal: {
              firstName: loan.applicant?.first_name || '',
              middleName: loan.applicant?.middle_name || '',
              lastName: loan.applicant?.last_name || '',
              extName: loan.applicant?.extension_name || 'N/A',
              address: loan.applicant?.address || '',
              contactNumber: loan.applicant?.phone_num || '',
              dob: loan.applicant?.birthdate || '',
              age: loan.applicant?.age || 0,
            },
            employment: {
              office: loan.applicant?.dept || '',
              position: loan.applicant?.position || '',
              salary: loan.applicant?.salary ? loan.applicant.salary.toString() : '0',
              status: loan.applicant?.ee_status || '',
            },
            coop: {
              years: loan.applicant?.years_coop ? loan.applicant.years_coop.toString() : '0',
              shares: loan.applicant?.share_amount ? loan.applicant.share_amount.toString() : '0',
              savings: loan.applicant?.saving_amount ? loan.applicant.saving_amount.toString() : '0',
            },
            loan: {
              type: loan.loan_type || '',
              amount: loan.applied_amount ? loan.applied_amount.toString() : '0',
              term: loan.loan_term || '',
              purpose: loan.loan_purpose || '',
              frequency: loan.repayment_freq || '',
              status_details: loan.status_details || '',
            },
            requirements: loan.requirements
              ? loan.requirements.split(',').map((req: string) => req.trim())
              : [],
            status: this.mapStatus(loan.loan_status),
            declineReason: loan.decline_reason || '',
            loan_history: loan.applicant?.applications
              ? loan.applicant.applications.map((app: any) => ({
                  loanamount_history: app.applied_amount ? app.applied_amount.toString() : '0',
                  date: app.createdAt || '',
                  status: app.loan_status || '',
                  id: app.id,
                }))
              : [],
            requirements_status: requirementsStatus,
          };

        });

        this.filterApplicants();
        this.isLoading = false;

        this.handleNavigationState();
      },
      error: () => {
        this.isLoading = false;
        Swal.fire('Error', 'Failed to fetch loans from server.', 'error');
      },
    });
  }

  private mapStatus(
    status: string
  ): 'pending' | 'approved' | 'declined' | 'completed' {
    if (!status) return 'pending';
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('approve')) return 'approved';
    if (lowerStatus.includes('decline')) return 'declined';
    if (lowerStatus.includes('complete')) return 'completed';
    return 'pending';
  }

  private handleNavigationState() {
    if (!this.navigationState) return;

    // Set the filter to match the new loan's status
    this.selectedFilter = this.navigationState.status as any;
    this.filterApplicants();

    // Find and select the loan
    const loan = this.applicants.find(
      (a) => a.id === this.navigationState?.loanId
    );
    
    if (loan) {
      this.selectApplicant(loan);
    }

    // Clear the state after handling
    this.navigationState = null;
  }

  addApplication() {
    const dialogRef = this.dialog.open(AddApplicationComponent);

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.success) {
        // Refresh the loans and select the newly created one
      }
    });
  }

  filterApplicants() {
    this.selectedApplicant = null;

    this.filteredApplicants = this.applicants.filter(
      (a) =>
        a.status === this.selectedFilter &&
        (this.searchQuery === '' ||
          a.personal.firstName
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase()) ||
          a.personal.lastName
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase()))
    );

    // Auto-select first applicant if available
    if (this.filteredApplicants.length > 0) {
      this.selectApplicant(this.filteredApplicants[0]);
    }
  }

  selectApplicant(applicant: Applicant) {
    this.selectedApplicant = applicant;

    this.historyData = (applicant.loan_history || []).filter(
      (entry) => entry.status.toLowerCase() !== 'pending'
    );

    this.selectedItem = null;
  }

  approve() {
    if (!this.selectedApplicant) return;

    Swal.fire({
      title: 'Approve Application',
      text: `Are you sure you want to approve ${this.selectedApplicant.personal.firstName} ${this.selectedApplicant.personal.lastName}'s application?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#508D4E',
      cancelButtonColor: '#7c7777',
      confirmButtonText: 'Yes, approve it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.http
          .post(
            `${environment.baseUrl}/api/approve-loan/${this.selectedApplicant?.id}`,
            {}
          )
          .subscribe({
            next: () => {
              Swal.fire({
                title: 'Approved!',
                text: 'Loan application has been approved successfully.',
                icon: 'success',
                confirmButtonColor: '#508D4E',
                timer: 1500,
                showConfirmButton: false,
              });
              this.fetchLoans(); // Refresh the list
            },
            error: (err) => {
              console.error('Error approving loan:', err);
              Swal.fire({
                title: 'Error',
                text: 'Failed to approve the loan. Please try again.',
                icon: 'error',
                confirmButtonColor: '#be1010',
              });
            },
          });
      }
    });
  }

  setSchedule() {
    this.dialog.open(SetScheduleComponent);
  }

  decline() {
    if (!this.selectedApplicant) return;

    Swal.fire({
      title: 'Decline Application',
      text: `Are you sure you want to decline this application?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#be1010',
      cancelButtonColor: '#7c7777',
      confirmButtonText: 'Yes, decline it!',
    }).then((result) => {
      if (result.isConfirmed) {
        // Prompt for remarks
        Swal.fire({
          title: 'Decline Remarks',
          input: 'textarea',
          inputLabel: 'Please provide a reason for declining:',
          inputPlaceholder: 'Enter your remarks here...',
          inputAttributes: {
            'aria-label': 'Type your message here',
          },
          showCancelButton: true,
          confirmButtonText: 'Submit',
          cancelButtonColor: '#7c7777',
          confirmButtonColor: '#be1010',
          preConfirm: (remarks) => {
            if (!remarks) {
              Swal.showValidationMessage('Remarks are required to proceed.');
            }
            return remarks;
          },
        }).then((remarksResult) => {
          if (remarksResult.isConfirmed) {
            const remarks = remarksResult.value;
            this.http
              .post(
                `${environment.baseUrl}/api/decline-loan/${this.selectedApplicant?.id}`,
                {
                  remarks,
                }
              )
              .subscribe({
                next: () => {
                  Swal.fire(
                    'Declined!',
                    `${this.selectedApplicant?.personal.firstName} ${this.selectedApplicant?.personal.lastName} has been declined.`,
                    'error'
                  );
                  this.fetchLoans(); // Refresh the list
                },
                error: () => {
                  Swal.fire('Error', 'Failed to decline the loan.', 'error');
                },
              });
          }
        });
      }
    });
  }

  // Pagination methods
  get totalItems() {
    return this.filteredApplicants.length;
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

  get paginatedApplicants() {
    return this.filteredApplicants.slice(this.startIndex, this.endIndex);
  }

  applyFilters() {
    this.filterApplicants();
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

  historyData: LoanHistory[] = [];
  selectedItem: LoanHistory | null = null;

  selectItem(item: LoanHistory) {
    this.selectedItem = item;
  }

  canApproveDecline(): boolean {
    return this.authService.hasRequiredRoles(['superadmin', 'admin']);
  }

  canToggleRequiredDocuments(): boolean {
    return this.authService.hasRequiredRoles(['loan officer']);
  }

  async toggleRequirement(key: string) {
    if (!this.selectedApplicant) return;

    // Toggle the status
    const typedKey = key as keyof Applicant['requirements_status'];
    const originalValue = this.selectedApplicant.requirements_status[typedKey];
    this.selectedApplicant.requirements_status[typedKey] = !originalValue;

    try {
      // Send the requirements_status object directly
      const response = await this.http
        .put<any>(
          `${environment.baseUrl}/api/update-loan/${this.selectedApplicant.id}`,
          {
            supporting_documents: this.selectedApplicant.requirements_status,
          }
        )
        .toPromise();

      // Update local data if needed
      if (response?.loan?.supporting_documents) {
        this.selectedApplicant.requirements_status =
          response.loan.supporting_documents;
      }

      await Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Requirement status updated',
        timer: 900,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error('Error updating requirement status:', err);
      // Revert on error
      this.selectedApplicant.requirements_status[typedKey] = originalValue;
      await Swal.fire('Error', 'Failed to update requirement status', 'error');
    }
  }

  viewLoanDetails(loanId: number) {
    this.dialog.open(LoanDetailsComponent, {
      data: { loanId },
      panelClass: 'loan-details-dialog',
    });
  }

  exportToExcel() {
    const exportData = this.filteredApplicants.map(applicant => ({
      'First Name': applicant.personal.firstName,
      'Last Name': applicant.personal.lastName,
      'Address': applicant.personal.address,
      'Contact No.': applicant.personal.contactNumber,
      'DOB': applicant.personal.dob,
      'Age': applicant.personal.age,
      'Department/Office': applicant.employment.office,
      'Position': applicant.employment.position,
      'Salary': applicant.employment.salary,
      'Employment Status': applicant.employment.status,
      'Years in Coop': applicant.coop.years,
      'Shares': applicant.coop.shares,
      'Savings': applicant.coop.savings,
      'Loan Type': applicant.loan.type,
      'Loan Amount': applicant.loan.amount,
      'Loan Term': applicant.loan.term,
      'Loan Purpose': applicant.loan.purpose,
      'Repayment Frequency': applicant.loan.frequency,
      'Status': applicant.status,
    }));

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Loan Applications');

    // Title row
    const titleRow = worksheet.addRow(['LOAN APPLICATIONS']);
    worksheet.mergeCells(1, 1, 1, Object.keys(exportData[0]).length);

    titleRow.font = { size: 20, bold: true, color: { argb: 'FFFFFF' } }; // White text
    titleRow.alignment = { horizontal: 'center', vertical: 'middle' };
    titleRow.height = 30;

    // Apply green background
    titleRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '508D4E' }, // Green background
      };
    });

    // Header row
    const headerRow = worksheet.addRow(Object.keys(exportData[0]));
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    headerRow.height = 20;

    // Data rows
    exportData.forEach(row => worksheet.addRow(Object.values(row)));

    // Auto column widths
    worksheet.columns.forEach((col) => {
      const column = col as Column | undefined;
      if (!column) return;

      let maxLength = 15;
      column.eachCell({ includeEmpty: true }, (cell: Cell) => {
        const cellLength = cell.value ? cell.value.toString().length : 0;
        if (cellLength > maxLength) {
          maxLength = cellLength;
        }
      });
      column.width = maxLength + 4;
    });

    // Align headers & data
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell: Cell) => {
        if (rowNumber === 1) return; // Skip title
        if (rowNumber === 2) {
          cell.font = { bold: true };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        } else {
          cell.alignment = { vertical: 'middle' };
        }
      });
    });

    // Save file
    workbook.xlsx.writeBuffer().then((buffer) => {
      const fileName = `loan_applications_${this.selectedFilter}_${new Date()
        .toISOString()
        .split('T')[0]}.xlsx`;
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      saveAs(blob, fileName);
    });
  }
}
