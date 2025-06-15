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
import Swal from 'sweetalert2';

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
  btnLoading: boolean = false;

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

  onSubmit() {
    const email = this.loginForm.get('email')?.value?.trim();
    const password = this.loginForm.get('password')?.value?.trim();

    if (!email || !password) {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Input',
        text: 'Please enter your email and password.',
        confirmButtonColor: '#CA2311'
      });
      this.loginForm.markAllAsTouched();
      return;
    }

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Input',
        text: 'Please correct the highlighted fields.',
        confirmButtonColor: '#CA2311'
      });
      return;
    }

    this.btnLoading = true;

    this.http.post<{ encrypted: string }>(`${environment.baseUrl}/api/login`, this.loginForm.value).subscribe({
      next: (response) => {

            const decrypted = decryptResponse(
              response.encrypted,
              this.encryptionKey
            ) as LoginResponse;

            this.authService.setAccessToken(decrypted.accessToken);
            this.authService.setRefreshToken(decrypted.refreshToken);
            this.authService.setRoleName(decrypted.roleName);

            // Optional: this.authService.setUser(decrypted.user  );

            this.router.navigate(['main/dashboard']);
      },
      error: (error) => {
        console.error('Login failed:', error);
        this.btnLoading = false;

        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: error.status === 401
            ? 'Invalid email or password.'
            : 'An error occurred. Please try again later.',
          confirmButtonColor: '#CA2311'
        });
      },
      complete: () => {
        this.btnLoading = false;
      }
    });
  }

  get isLoginDisabled(): boolean {
    const email = this.loginForm.get('email')?.value?.trim();
    const password = this.loginForm.get('password')?.value?.trim();
    return this.btnLoading || (!email && !password);
  }
}
