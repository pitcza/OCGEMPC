import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddApplicationComponent } from './add-application/add-application.component';
import { AuthService } from '../../services/auth.services';
import Swal from 'sweetalert2';
import { SetScheduleComponent } from './set-schedule/set-schedule.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { decryptResponse } from '../../utils/crypto.util';

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
}

interface Applicant {
  id: number;
  personal: PersonalInfo;
  employment: EmploymentInfo;
  coop: CoopInfo;
  loan: LoanInfo;
  requirements: string[];
  declineReason?: string;
  status: 'application' | 'releasing' | 'declined';
    loan_history?: LoanHistory[];
}

interface LoanHistory{
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
  selectedFilter: 'application' | 'releasing' | 'declined' = 'application';
  selectedApplicant: Applicant | null = null;
  searchQuery = '';
  itemsPerPage = 10;
  currentPage = 1;
  userRole: string | null = null;
  showLoanOnly = false;
  standardRequirements = [
    'Payslip',
    'Valid ID',
    'Company ID',
    'Proof of Billing',
    'Employment Details',
    'Barangay Clearance',
  ];

  applicants: Applicant[] = [];
  filteredApplicants: Applicant[] = [];

  private encryptionKey = environment.encryptionKey;

  constructor(
    private dialog: MatDialog,
    private authService: AuthService,
    private http: HttpClient
  ) {
    this.userRole = this.authService.cookieService.get('roleName');
  }

  isRequirementSubmitted(requirement: string): boolean {
    if (!this.selectedApplicant) return false;
    return this.selectedApplicant.requirements.some((submittedReq) =>
      submittedReq.toLowerCase().includes(requirement.toLowerCase())
    );
  }

  ngOnInit() {
    this.fetchLoans();
  }

  fetchLoans() {
    this.http.get<any>(`${environment.baseUrl}/api/loans`).subscribe({
      next: (data) => {
        const decrypted = decryptResponse(data.encrypted, this.encryptionKey);

        console.log(decrypted);

        // Transform the backend data to match our frontend interface
        this.applicants = decrypted.map((loan: any) => ({
          id: loan.id,
          personal: {
            firstName: loan.maker.first_name || '',
            middleName: loan.maker.middle_name || '',
            lastName: loan.maker.last_name || '',
            extName: loan.maker.extension_name || 'N/A',
            address: loan.maker.address || '',
            contactNumber: loan.maker.phone_num || '',
            dob: loan.maker.birthdate || '',
            age: loan.maker.age,
          },
          employment: {
            office: loan.maker.dept || '',
            position: loan.maker.position || '',
            salary: loan.maker.salary ? loan.maker.salary.toString() : '0',
            status: loan.maker.ee_status || '',
          },
          coop: {
            years: loan.maker.years_coop
              ? loan.maker.years_coop.toString()
              : '0',
            shares: loan.maker.share_amount ? loan.maker.share_amount.toString() : '0',
            savings: loan.maker.saving_amount ? loan.maker.saving_amount.toString() : '0',
          },
          loan: {
            type: loan.loan_type || '',
            amount: loan.applied_amount ? loan.applied_amount.toString() : '0',
            
            term: loan.loan_term || '',
            purpose: loan.loan_purpose || '',
            frequency: loan.repayment_freq || '',
          },
          requirements: loan.requirements
            ? loan.requirements.split(',').map((req: string) => req.trim())
            : [],
          status: this.mapStatus(loan.loan_status),
          declineReason: loan.decline_reason || '',
          loan_history: loan.loan_history ? loan.loan_history.map((h: any) => ({
            loanamount_history:h.loadamount ? h.loanamount_history.toString() : '0',
            date: h.date || '',
            status: h.status || ''
          })) : []
        }));
        this.filterApplicants();
      },
      error: () => {
        Swal.fire('Error', 'Failed to fetch loans from server.', 'error');
      },
    });
  }

  private calculateAge(birthDate: string): number {
    if (!birthDate) return 0;
    const dob = new Date(birthDate);
    const diff = Date.now() - dob.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  private mapStatus(status: string): 'application' | 'releasing' | 'declined' {
    if (!status) return 'application';
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('approve') || lowerStatus.includes('releasing'))
      return 'releasing';
    if (lowerStatus.includes('decline')) return 'declined';
    return 'application';
  }

  addApplication() {
    this.dialog.open(AddApplicationComponent);
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
  }

      selectApplicant(applicant: Applicant) {
      this.selectedApplicant = applicant;
      this.historyData = applicant.loan_history || [];
      this.selectedItem = null; 
      }

  approve() {
    if (!this.selectedApplicant) return;

    Swal.fire({
      title: 'Approve Application',
      text: `Are you sure you want to approve this application?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#508D4E',
      cancelButtonColor: '#7c7777',
      confirmButtonText: 'Yes, approve it!',
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
                title: 'Application Approved',
                text: `${this.selectedApplicant?.personal.firstName} ${this.selectedApplicant?.personal.lastName} has been approved.`,
                icon: 'success',
                confirmButtonColor: '#508D4E',
                confirmButtonText: 'SET SCHEDULE',
              }).then((result) => {
                if (result.isConfirmed) {
                  this.setSchedule();
                }
                this.fetchLoans(); // Refresh the list
              });
            },
            error: () => {
              Swal.fire('Error', 'Failed to approve the loan.', 'error');
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
//     historyData = LoanHistory [] =  [
//   { loanamount:"111000", date: '2025-06-01 09:15:23', status: 'complated' },
//     { loanamount:"1500", date: '2025-06-01 09:15:23', status: 'declined' },
//     { loanamount:"1000", date: '2025-06-01 09:15:23', status: 'pending' },
      
// ];
historyData: LoanHistory[] = [];
 selectedItem: LoanHistory | null = null;

  selectItem(item: LoanHistory) {
    this.selectedItem = item;
  }

  
  
}
