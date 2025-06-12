import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MainRoutingModule } from './main-routing.module';
import { MainComponent } from './main.component';

import { DashboardComponent } from './dashboard/dashboard.component';
import { MakersComponent } from './makers/makers.component';

import { LoanApplicationComponent } from './loan-application/loan-application.component';

import { InsuranceComponent } from './insurance/insurance.component';

import { DetailsComponent } from './makers/details/details.component';
import { ScheduleComponent } from './makers/schedule/schedule.component';
import { AddApplicationComponent } from './loan-application/add-application/add-application.component';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { SetScheduleComponent } from './loan-application/set-schedule/set-schedule.component';
import { ActivityLogComponent } from './activity-log/activity-log.component';
import { NewMakerComponent } from './makers/new-maker/new-maker.component';
import { CoMakersComponent } from './comakers/comakers.component';
import { CoMakerDetailsComponent } from './comakers/details/details.component';
import { NewCoMakerComponent } from './comakers/new-comaker/new-comaker.component';
import { LoanDetailsComponent } from './loan-details/loan-details.component';


@NgModule({
  declarations: [
    DashboardComponent,
    MakersComponent,
    LoanApplicationComponent,
    InsuranceComponent,
    DetailsComponent,
    CoMakerDetailsComponent,
    ScheduleComponent,
    AddApplicationComponent,
    SetScheduleComponent,
    ActivityLogComponent,
    NewMakerComponent,
    NewCoMakerComponent,
    CoMakersComponent,
    LoanDetailsComponent,
  ],
  imports: [
    CommonModule,
    MainRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule
  ]
})
export class MainModule { }
