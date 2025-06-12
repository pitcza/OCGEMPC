import { NgModule } from '@angular/core';
import {
  BrowserModule,
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MaterialModule } from './material/material.module';
import { MainComponent } from './main/main.component';
import { MainModule } from './main/main.module';
import { LoginComponent } from './login/login.component';
import { CommonModule } from '@angular/common';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { AuthInterceptor } from './interceptors/auth.interceptors';
import { MakerService } from './main/makers/makers.service';
import { ComakerService } from './main/comakers/comakers.service';
import { LoanApplicationService } from './main/loan-application/add-application/loan-application.service';

@NgModule({
  declarations: [AppComponent, MainComponent],

  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    MainModule,
    LoginComponent,
    ForgotPasswordComponent,
    CommonModule,
  ],

  providers: [
    provideClientHydration(withEventReplay()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    MakerService,
    ComakerService,
    LoanApplicationService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
