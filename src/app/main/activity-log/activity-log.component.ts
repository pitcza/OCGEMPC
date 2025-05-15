import { Component } from '@angular/core';

export interface ActivityLog {
  timestamp: string;
  who: string;
  role: string;
  action: string;
  details: string;
}

@Component({
  selector: 'app-activity-log',
  standalone: false,
  templateUrl: './activity-log.component.html',
  styleUrls: ['./activity-log.component.scss']
})
export class ActivityLogComponent {
  displayedColumns: string[] = ['timestamp', 'who', 'role', 'action', 'details'];
  dataSource: ActivityLog[] = [
    { timestamp: '2025-05-15 09:12 AM', who: 'Kim Kardashian', role: 'Loan Officer', action: 'Created', details: 'Created a new loan application (#LA-1024).' },
    { timestamp: '2025-05-15 09:15 AM', who: 'Ray J', role: 'Treasurer', action: 'Approved', details: 'Approved loan application (#LA-1024).' },
    { timestamp: '2025-05-15 09:20 AM', who: 'Juan Dela Cruz', role: 'Board of Member', action: 'Edited', details: 'Edited loan terms for application (#LA-1024).' },
    { timestamp: '2025-05-15 09:25 AM', who: 'Kim Kardashian', role: 'Loan Officer', action: 'Deleted', details: 'Deleted loan application (#LA-1007).' },
    { timestamp: '2025-05-15 09:30 AM', who: 'Ray J', role: 'Treasurer', action: 'Created', details: 'Created a new loan application (#LA-1025).' },
    { timestamp: '2025-05-15 09:33 AM', who: 'Juan Dela Cruz', role: 'Board of Member', action: 'Approved', details: 'Approved loan application (#LA-1025).' },
    { timestamp: '2025-05-15 09:38 AM', who: 'Kim Kardashian', role: 'Loan Officer', action: 'Edited', details: 'Updated borrower information for #LA-1024.' },
    { timestamp: '2025-05-15 09:40 AM', who: 'Ray J', role: 'Treasurer', action: 'Deleted', details: 'Deleted rejected application (#LA-0995).' },
    { timestamp: '2025-05-15 09:45 AM', who: 'Juan Dela Cruz', role: 'Board of Member', action: 'Created', details: 'Created loan application draft (#LA-1026).' },
  ];
}
