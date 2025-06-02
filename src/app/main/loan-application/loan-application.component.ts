import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddApplicationComponent } from './add-application/add-application.component';
import { AuthService } from '../../services/auth.services';
import Swal from 'sweetalert2';
import { SetScheduleComponent } from './set-schedule/set-schedule.component';

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
  personal: PersonalInfo;
  employment: EmploymentInfo;
  coop: CoopInfo;
  loan: LoanInfo;
  requirements: string[];
  declineReason?: string;
  status: 'application' | 'releasing' | 'declined';
}

@Component({
  selector: 'app-loan-application',
  standalone: false,
  templateUrl: './loan-application.component.html',
  styleUrl: './loan-application.component.scss'
})
export class LoanApplicationComponent {
  selectedFilter: 'application' | 'releasing' | 'declined' = 'application';
  selectedApplicant: Applicant | null = null;

  applicants: Applicant[] = [
    {
      personal: {
        firstName: 'Juan',
        middleName: 'Martinez',
        lastName: 'Dela Cruz',
        extName: 'Jr.',
        address: 'Lot 10, Main Street, Manila, NCR, 1000',
        contactNumber: '09123456789',
        dob: '01/01/2000',
        age: 23
      },
      employment: {
        office: 'Finance Dept.',
        position: 'Accountant',
        salary: '18,000',
        status: 'Worker'
      },
      coop: {
        years: '2 years',
        shares: '18,000',
        savings: '18,000'
      },
      loan: {
        type: 'Personal Loan',
        amount: '60,000',
        term: '24 months',
        purpose: 'Education expenses',
        frequency: 'Monthly'
      },
      requirements: ['ID', 'Proof of Income'],
      status: 'application'
    },
    {
      personal: { firstName: 'Maria', middleName: 'Luna', lastName: 'Reyes', extName: '', address: 'Blk 5, Street 2, QC, NCR, 1100', contactNumber: '09124567890', dob: '12/05/1995', age: 29 },
      employment: { office: 'HR', position: 'Recruiter', salary: '20,000', status: 'Regular' },
      coop: { years: '3 years', shares: '15,000', savings: '10,000' },
      loan: { type: 'Emergency Loan', amount: '40,000', term: '12 months', purpose: 'Medical', frequency: 'Bi-Weekly' },
      requirements: ['ID', 'Medical Certificate'], status: 'application'
    },
    {
      personal: { firstName: 'Carlos', middleName: 'Dizon', lastName: 'Santos', extName: '', address: 'Purok 3, Davao City, Davao, 8000', contactNumber: '09127654321', dob: '23/08/1988', age: 36 },
      employment: { office: 'Operations', position: 'Technician', salary: '22,000', status: 'Contractual' },
      coop: { years: '1 year', shares: '5,000', savings: '2,000' },
      loan: { type: 'Motorcycle Loan', amount: '70,000', term: '36 months', purpose: 'Transport', frequency: 'Monthly' },
      requirements: ['Valid ID', 'Payslip'], status: 'application'
    },
    {
      personal: { firstName: 'Ana', middleName: 'Ramos', lastName: 'Lim', extName: '', address: 'Sitio Uno, Cebu City, Cebu, 6000', contactNumber: '09121234567', dob: '05/11/1992', age: 32 },
      employment: { office: 'Admin', position: 'Secretary', salary: '15,000', status: 'Worker' },
      coop: { years: '2 years', shares: '8,000', savings: '7,000' },
      loan: { type: 'Housing Loan', amount: '150,000', term: '60 months', purpose: 'Renovation', frequency: 'Monthly' },
      requirements: ['Barangay Clearance', 'Proof of Ownership'], status: 'application'
    },
    {
      personal: { firstName: 'Roberto', middleName: 'F.', lastName: 'Diaz', extName: 'Sr.', address: 'Zone 4, Iloilo City, Iloilo, 5000', contactNumber: '09128889999', dob: '10/04/1985', age: 40 },
      employment: { office: 'Logistics', position: 'Driver', salary: '14,000', status: 'Worker' },
      coop: { years: '5 years', shares: '10,000', savings: '12,000' },
      loan: { type: 'Salary Loan', amount: '30,000', term: '6 months', purpose: 'Debt Consolidation', frequency: 'Weekly' },
      requirements: ['Coop ID', 'Payslip'], status: 'application'
    },
    {
      personal: { firstName: 'Lea', middleName: 'Santos', lastName: 'Gomez', extName: '', address: 'Street 12, CDO, Misamis Oriental, 9000', contactNumber: '09127776666', dob: '17/03/1991', age: 33 },
      employment: { office: 'IT', position: 'Developer', salary: '30,000', status: 'Regular' },
      coop: { years: '1 year', shares: '20,000', savings: '25,000' },
      loan: { type: 'Gadget Loan', amount: '50,000', term: '12 months', purpose: 'Laptop', frequency: 'Monthly' },
      requirements: ['Employee ID', 'Proof of Purchase'], status: 'application'
    },
    {
      personal: { firstName: 'Eric', middleName: 'Dela Peña', lastName: 'Morales', extName: '', address: 'Green Hills, San Juan, NCR, 1500', contactNumber: '09125554444', dob: '29/09/1990', age: 34 },
      employment: { office: 'Marketing', position: 'Analyst', salary: '28,000', status: 'Probationary' },
      coop: { years: '4 years', shares: '12,000', savings: '9,000' },
      loan: { type: 'Business Loan', amount: '120,000', term: '36 months', purpose: 'Startup', frequency: 'Monthly' },
      requirements: ['Business Permit', 'Photos'], status: 'application'
    },
    {
      personal: { firstName: 'Grace', middleName: 'T.', lastName: 'Navarro', extName: '', address: 'Valenzuela City, NCR, 1440', contactNumber: '09126667777', dob: '08/07/1993', age: 31 },
      employment: { office: 'Sales', position: 'Agent', salary: '16,000', status: 'Worker' },
      coop: { years: '3 years', shares: '14,000', savings: '6,000' },
      loan: { type: 'Emergency Loan', amount: '25,000', term: '6 months', purpose: 'Medical bills', frequency: 'Bi-Weekly' },
      requirements: ['Medical Certificate', 'Coop ID'], status: 'application'
    },
    {
      personal: { firstName: 'Noel', middleName: 'Cruz', lastName: 'Fernandez', extName: '', address: 'Dumaguete City, Negros Oriental, 6200', contactNumber: '09129991111', dob: '03/02/1994', age: 30 },
      employment: { office: 'Engineering', position: 'Engineer', salary: '35,000', status: 'Regular' },
      coop: { years: '6 years', shares: '40,000', savings: '30,000' },
      loan: { type: 'Vehicle Loan', amount: '100,000', term: '48 months', purpose: 'Car purchase', frequency: 'Monthly' },
      requirements: ['Driver’s License', 'Vehicle Quote'], status: 'application'
    }
  ];

  filteredApplicants: Applicant[] = [];

  constructor(private dialog: MatDialog) {
    this.filterApplicants();
  }

  addApplication() {
    this.dialog.open(AddApplicationComponent);
  }

  filterApplicants() {
    this.selectedApplicant = null;
    this.filteredApplicants = this.applicants.filter(a => a.status === this.selectedFilter);
  }

  selectApplicant(applicant: Applicant) {
    this.selectedApplicant = applicant;
  }

  approve() {
    Swal.fire({
      title: 'Approve Application',
      text: `Are you sure you want to approve this application?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#508D4E',
      cancelButtonColor: '#7c7777',
      confirmButtonText: 'Yes, approve it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.setSchedule();
      }
    });
  }

  setSchedule() {
    this.dialog.open(SetScheduleComponent);
  }

  decline() {
    Swal.fire({
      title: 'Decline Application',
      text: `Are you sure you want to decline this application?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#be1010',
      cancelButtonColor: '#7c7777',
      confirmButtonText: 'Yes, decline it!'
    }).then((result) => {
      if (result.isConfirmed) {
        // Prompt for remarks
        Swal.fire({
          title: 'Decline Remarks',
          input: 'textarea',
          inputLabel: 'Please provide a reason for declining:',
          inputPlaceholder: 'Enter your remarks here...',
          inputAttributes: {
            'aria-label': 'Type your message here'
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
          }
        }).then((remarksResult) => {
          if (remarksResult.isConfirmed) {
            const remarks = remarksResult.value;
            Swal.fire('Declined!', `Loan application has been declined.`, 'error');
          }
        });
      }
    });
  }
}
