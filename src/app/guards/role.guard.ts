import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.services';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const allowedRoles = route.data['roles'] as Array<string>;
    const userRole = this.authService.cookieService.get('roleName');

    if (allowedRoles && allowedRoles.includes(userRole)) {
      return true;
    }

    // Optionally redirect to unauthorized page
    this.router.navigate(['/login']);
    return false;
  }
}
