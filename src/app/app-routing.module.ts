import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { MainComponent } from './main/main.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: MainComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },  
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'main', canActivate: [AuthGuard], component: MainComponent, children: [{ path: '', loadChildren: ()=>import('./main/main.module').then((m)=>m.MainModule) }] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
