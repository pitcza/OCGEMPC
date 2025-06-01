import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './main.component';

import { DashboardComponent } from './dashboard/dashboard.component';
import { MakersComponent } from './makers/makers.component';
import { LoanApplicationComponent } from './loan-application/loan-application.component';
import { InsuranceComponent } from './insurance/insurance.component';
import { ApplicationListComponent } from './loan-application/application-list/application-list.component';
import { ForReleasingComponent } from './loan-application/for-releasing/for-releasing.component';
import { DeclinedListComponent } from './loan-application/declined-list/declined-list.component';
import { ActivityLogComponent } from './activity-log/activity-log.component';
import { DeclinemodalComponent } from './loan-application/declinemodal/declinemodal.component';
import { ApprovemodalComponent } from './loan-application/approvemodal/approvemodal.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'makers', component: MakersComponent },
  { path: 'loan', component: LoanApplicationComponent,
    children: [
      { path: 'list', component: ApplicationListComponent },
      { path: 'release', component: ForReleasingComponent },
      { path: 'declined', component: DeclinedListComponent },
      { path: 'declinedmodal', component: DeclinemodalComponent},
      { path: 'approvemodal', component: ApprovemodalComponent},
      { path: '', redirectTo: 'list', pathMatch: 'full' }, 
    ],
  },
  { path: 'insurance', component: InsuranceComponent },
  { path: 'logs', component: ActivityLogComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule { }
