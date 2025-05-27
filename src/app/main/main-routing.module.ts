import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './main.component';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';

import { DashboardComponent } from './dashboard/dashboard.component';
import { MakersComponent } from './makers/makers.component';
import { LoanApplicationComponent } from './loan-application/loan-application.component';
import { InsuranceComponent } from './insurance/insurance.component';
import { ApplicationListComponent } from './loan-application/application-list/application-list.component';
import { ForReleasingComponent } from './loan-application/for-releasing/for-releasing.component';
import { DeclinedListComponent } from './loan-application/declined-list/declined-list.component';
import { ActivityLogComponent } from './activity-log/activity-log.component';
import { UnauthorizedComponent } from '../unauthorized/unauthorized.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],  },
  { path: 'makers',
    component: MakersComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Loan Officer', 'Superadmin'] },
  },
  { path: 'loan', component: LoanApplicationComponent,
    children: [
      { path: 'list',
        component: ApplicationListComponent,
        canActivate: [AuthGuard] },
      { path: 'release',
        component: ForReleasingComponent,
        canActivate: [AuthGuard] },
      { path: 'declined',
        component: DeclinedListComponent,
        canActivate: [AuthGuard] },
      { path: '', redirectTo: 'list', pathMatch: 'full' },
    ],
  },
  { path: 'insurance',
    component: InsuranceComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Loan Officer', 'Superadmin'] }
  },
  { path: 'logs',
    component: ActivityLogComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Superadmin'] }
   },
  { path: 'unauthorized', component: UnauthorizedComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule { }
