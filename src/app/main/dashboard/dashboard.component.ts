import { Component, OnInit, Inject, PLATFORM_ID, AfterViewInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, AfterViewInit {

  barChart: any;
  pieChart: any;

  // Recent payments data
  recentPayments = [
    { id: '1001', borrower: 'Lara Jane Acar', amount: 'P 10,000.00', date: '04/20/2025', status: 'Paid' },
    { id: '1002', borrower: 'Dominique Robles', amount: 'P 10,000.00', date: '04/20/2025', status: 'Paid' },
    { id: '1003', borrower: 'Czarina Arellano', amount: 'P 10,000.00', date: '04/20/2025', status: 'Paid' }
  ];

  // Dashboard statistics as getters
  get totalApplications(): number {
    return this.recentPayments.length;
  }

  get totalLoanAmount(): string {
    // Sum up all amounts from recent payments
    const totalAmount = this.recentPayments.reduce((sum, payment) => {
      // Extract numeric value from amount string (remove 'P ' and ',')
      const numericAmount = parseFloat(payment.amount.replace('P ', '').replace(/,/g, ''));
      return sum + numericAmount;
    }, 0);

    // Format as currency
    return `P ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  get activeLoans(): number {
    return this.recentPayments.filter(payment => payment.status === 'Active').length;
  }

  get fullyPaidLoans(): number {
    return this.recentPayments.filter(payment => payment.status === 'Paid').length;
  }

   constructor(
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    // Wait for the DOM to be ready
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

    this.recentPayments.forEach(payment => {
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
    const paymentsByMonth = this.groupPaymentsByMonth();

    // Monthly loan application data
    const months = ['January', 'February', 'March', 'April', 'May', 'June'];
    const applicationData = months.map(month => {
      return paymentsByMonth[month] || 0;
    });

    this.barChart = new Chart(barCanvas, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [{
          label: 'Loan Applications',
          data: applicationData,
          backgroundColor: '#508d4e',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Applications'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Month'
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                return `Applications: ${context.raw}`;
              }
            }
          }
        }
      }
    });
  }

  createPieChart() {
    if (!isPlatformBrowser(this.platformId)) return;

    const pieCanvas = document.getElementById('pieChart') as HTMLCanvasElement;
    if (!pieCanvas) return;

    // Define status type to avoid TS errors
    type LoanStatus = 'Active' | 'Paid' | 'Overdue' | 'Denied';

    // Count loans by status with proper typing
    const statusCounts: Record<LoanStatus, number> = {
      'Active': this.activeLoans,
      'Paid': this.fullyPaidLoans,
      'Overdue': 0,
      'Denied': 0
    };

    // Loan status data
    const statuses: LoanStatus[] = ['Active', 'Paid', 'Overdue', 'Denied'];
    const statusData = statuses.map(status => statusCounts[status]);

    this.pieChart = new Chart(pieCanvas, {
      type: 'pie',
      data: {
        labels: statuses,
        datasets: [{
          data: statusData,
          backgroundColor: [
            '#508d4e',  // Green - Active
            '#4682B4',  // Blue - Paid
            '#CD5C5C',  // Red - Overdue
            '#808080'   // Gray - Denied
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw as number;
                const total = (context.dataset.data as number[]).reduce((acc, data) => acc + data, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }
}
