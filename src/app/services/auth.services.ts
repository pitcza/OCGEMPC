import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient, public cookieService: CookieService) {}

  getAccessToken(): string | null {
    return this.cookieService.get('accessToken');
  }

  getRefreshToken(): string | null {
    return this.cookieService.get('refreshToken');
  }

  setAccessToken(token: string) {
    this.cookieService.set('accessToken', token);
  }

  setRefreshToken(token: string) {
    this.cookieService.set('refreshToken', token);
  }

  setRoleName(role: string) {
    this.cookieService.set('roleName', role);
  }

  getUserRole(): string | null {
    return this.cookieService.get('roleName');
  }

  hasRequiredRoles(requiredRoles: string[]): boolean {
    const userRole = this.getUserRole();
    return userRole ? requiredRoles.includes(userRole.toLowerCase()) : false;
  }

  refreshToken(): Observable<string> {
    return this.http
      .post<{ accessToken: string }>('/api/refresh', {
        refreshToken: this.getRefreshToken(),
      })
      .pipe(
        map((response) => {
          this.setAccessToken(response.accessToken);
          return response.accessToken;
        })
      );
  }

  logoutApi(): Observable<any> {
    // Call your backend logout endpoint, passing the refresh token if needed
    return this.http.post('/api/logout', {
      refreshToken: this.getRefreshToken()
    });
  }

  performLogout(): Observable<any> {
    // Call the API, then clear cookies and redirect
    return this.logoutApi().pipe(
      map(() => {
        this.logout();
      })
    );
  }

  logout() {
    this.cookieService.deleteAll();
    window.location.href = '/login'; // or show modal
  }
}
