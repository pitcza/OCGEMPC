import { Component } from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../services/auth.services';
import { LoginResponse } from '../models/login-response.model';
import { environment } from '../../environments/environment';
import { decryptResponse } from '../utils/crypto.util';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
})
export class LoginComponent {
  loginForm: FormGroup;
  private encryptionKey = environment.encryptionKey;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  getEmailError() {
    const emailControl = this.loginForm.get('email');
    if (emailControl?.hasError('required')) {
      return 'Email is required';
    }
    if (emailControl?.hasError('email')) {
      return 'Please enter a valid email';
    }
    return '';
  }

  showPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  // onSubmit() {
  //   if (this.loginForm.valid) {
  //     console.log('Login Form Submitted', this.loginForm.value);
  //   }
  // }
  onSubmit() {
    if (this.loginForm.valid) {
      this.http
        .post<{ encrypted: string }>(
          `${environment.baseUrl}/api/login`,
          this.loginForm.value
        )
        .subscribe({
          next: (response) => {
            const decrypted = decryptResponse(
              response.encrypted,
              this.encryptionKey
            ) as LoginResponse;

            console.log('Decrypted login response:', decrypted);

            this.authService.setAccessToken(decrypted.accessToken);
            this.authService.setRefreshToken(decrypted.refreshToken);
            this.authService.setRoleName(decrypted.roleName);

            // Optional: this.authService.setUser(decrypted.user  );

            this.router.navigate(['main/dashboard']);
          },
          error: (error) => {
            console.error('Login API call error:', error);
          },
        });
    }
  }
}
