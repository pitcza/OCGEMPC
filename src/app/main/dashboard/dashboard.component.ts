import { Component, OnInit, Inject, PLATFORM_ID, AfterViewInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Chart } from 'chart.js/auto';
import { DashboardApiService, RecentPayment } from './dashboard.api';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, AfterViewInit {
  barChart: any;
  pieChart: any;

  loanCount: number = 0;
  totalLoanAmount: number = 0;
  activeLoans: number = 0;
  fullyPaidLoans: number = 0;
  loanApplicationsByMonth: { [month: string]: number } = {};
  loanStatusOverview: { [status: string]: number } = {};
  recentPayments: RecentPayment[] = [];

  // For chart labels
  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];
  statuses = ['Active', 'Paid', 'Overdue', 'Denied'];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private dashboardApi: DashboardApiService
  ) {}

  ngOnInit(): void {
    // Wait for the DOM to be ready
    this.dashboardApi.getTotalApplications().subscribe((val) => {
      // If val is not a number, default to 0
      this.loanCount = typeof val === 'number' ? val : 0;
    });
    this.dashboardApi.getTotalLoanAmountThisMonth().subscribe((val) => {
      this.totalLoanAmount = typeof val === 'number' ? val : 0;
    });
    this.dashboardApi.getActiveLoans().subscribe((val) => {
      this.activeLoans = typeof val === 'number' ? val : 0;
    });
    this.dashboardApi.getFullyPaidLoans().subscribe((val) => {
      this.fullyPaidLoans = typeof val === 'number' ? val : 0;
    });

    this.dashboardApi
      .getLoanApplicationsByMonth()
      .subscribe((response: any) => {
        const data = response.result;

        this.loanApplicationsByMonth = {};

        data.forEach((item: { month: string; count: number }) => {
          const date = new Date(item.month + '-01');
          const monthName = date.toLocaleString('default', { month: 'long' });
          this.loanApplicationsByMonth[monthName] = item.count;
        });
        this.createBarChart();
      });

    this.dashboardApi.getLoanStatusOverview().subscribe((val: any) => {
      const statusObj: Record<string, number> = {};

      const result = val.result;

      if (Array.isArray(result)) {
        result.forEach((item: { loan_status: string; count: number }) => {
          const status = item.loan_status.toLowerCase();
          switch (status) {
            case 'approved':
              statusObj['Active'] = item.count;
              break;
            case 'completed':
              statusObj['Paid'] = item.count;
              break;
            case 'pending':
              statusObj['Pending'] = item.count;
              break;
            case 'declined':
              statusObj['Declined'] = item.count;
              break;
          }
        });
      } else {
        console.error('Expected result to be an array, but got:', result);
      }

      this.loanStatusOverview = statusObj;
      this.createPieChart();
    });

    this.dashboardApi.getRecentPayments().subscribe((val) => {
      this.recentPayments = val.mostRecentPayments;
    });
  }

  ngAfterViewInit(): void {
    // Only run chart code in the browser
    if (isPlatformBrowser(this.platformId)) {
      // Wait for the DOM to be ready
      setTimeout(() => {
        this.createBarChart();
        this.createPieChart();
      }, 100);
    }
  }

  // Helper method to group payments by month
  groupPaymentsByMonth(): Record<string, number> {
    const result: Record<string, number> = {};

    this.recentPayments.forEach((payment) => {
      // Extract month from payment date
      const date = new Date(payment.date);
      const monthName = date.toLocaleString('default', { month: 'long' });

      // Increment count for this month
      if (result[monthName]) {
        result[monthName]++;
      } else {
        result[monthName] = 1;
      }
    });

    return result;
  }

  createBarChart() {
    if (!isPlatformBrowser(this.platformId)) return;

    const barCanvas = document.getElementById('barChart') as HTMLCanvasElement;
    if (!barCanvas) return;

    // Group payments by month
    // const paymentsByMonth = this.groupPaymentsByMonth();

    // // Monthly loan application data
    // const months = ['January', 'February', 'March', 'April', 'May', 'June'];
    const applicationData = this.months.map(
      (month) => this.loanApplicationsByMonth[month] || 0
    );
    this.barChart = new Chart(barCanvas, {
      type: 'bar',
      data: {
        labels: this.months,
        datasets: [
          {
            label: 'Loan Applications',
            data: applicationData,
            backgroundColor: '#508d4e',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Applications',
            },
          },
          x: {
            title: {
              display: true,
              text: 'Month',
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                return `Applications: ${context.raw}`;
              },
            },
          },
        },
      },
    });
  }

  createPieChart() {
    if (!isPlatformBrowser(this.platformId)) return;

    const pieCanvas = document.getElementById('pieChart') as HTMLCanvasElement;
    if (!pieCanvas) return;

    const statusData = this.statuses.map(
      (status) => this.loanStatusOverview[status] || 0
    );

    this.pieChart = new Chart(pieCanvas, {
      type: 'pie',
      data: {
        labels: this.statuses,
        datasets: [
          {
            data: statusData,
            backgroundColor: [
              '#508d4e', // Green - Active
              '#4682B4', // Blue - Paid
              '#CD5C5C', // Red - Overdue
              '#808080', // Gray - Denied
            ],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              font: {
                size: 12,
              },
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || '';
                const value = context.raw as number;
                const total = (context.dataset.data as number[]).reduce(
                  (acc, data) => acc + data,
                  0
                );
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value} (${percentage}%)`;
              },
            },
          },
        },
      },
    });
  }

  get formattedTotalLoanAmount(): string {
    return `P ${this.totalLoanAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  getFullName(payment: any): string {
    return [payment.first_name, payment.last_name].filter(Boolean).join(' ');
  }

  get loanApplicationsByMonthArray(): [string, number][] {
    return Object.entries(this.loanApplicationsByMonth);
  }

  get loanStatusOverviewArray(): [string, number][] {
    return Object.entries(this.loanStatusOverview);
  }
}
