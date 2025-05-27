import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../services/auth.services';

@Component({
  selector: 'app-main',
  standalone: false,
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
  userRole: string | null = null;
  constructor(
    private router: Router,
    private authService: AuthService,
  ) {
    this.checkScreenWidth();
    this.userRole = this.authService.cookieService.get('roleName');
  }

  logoutUser() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out of the system.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#CA2311',
      cancelButtonColor: '#7F7F7F',
      confirmButtonText: 'Logout',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {

        // Call the AuthService to perform logout (API + cleanup)
        this.authService.performLogout().subscribe({
          next: () => {
            // The AuthService.logout() will handle redirect
          },
          error: (err) => {
            // Even if API fails, ensure local logout
            this.authService.logout();
          }
        });
      }
    });
  }

  // SIDEBAR
  isSidebarCollapsed = false;
  isSidebarOverlay = false;
  isSidebarToggled = false;

  toggleSidebar() {
    this.isSidebarToggled = !this.isSidebarToggled;
    if (window.innerWidth <= 1024) {
      if (this.isSidebarOverlay) {
        this.isSidebarOverlay = false;
        this.isSidebarCollapsed = true;
      } else {
        this.isSidebarOverlay = true;
        this.isSidebarCollapsed = false;
      }
    } else {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
      this.isSidebarOverlay = false;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.checkScreenWidth();
  }

  checkScreenWidth() {
    if (typeof window !== 'undefined') {
      const screenWidth = window.innerWidth;
      if (screenWidth <= 1024) {
        this.isSidebarCollapsed = true;
        this.isSidebarOverlay = false;
      } else {
        this.isSidebarCollapsed = screenWidth <= 1320;
        this.isSidebarOverlay = false;
      }
    }
  }
}
