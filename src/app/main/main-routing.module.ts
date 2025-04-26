import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './main.component';

import { DashboardComponent } from './dashboard/dashboard.component';
import { MakersComponent } from './makers/makers.component';
import { LoanApplicationComponent } from './loan-application/loan-application.component';
import { InsuranceComponent } from './insurance/insurance.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'makers', component: MakersComponent },
  { path: 'loan', component: LoanApplicationComponent },
  { path: 'insurance', component: InsuranceComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule { }
