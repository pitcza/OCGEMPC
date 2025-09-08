import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';  
import { RouterModule, Router  } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  imports: [ReactiveFormsModule, CommonModule, RouterModule] 
})
export class ForgotPasswordComponent {
  step = 1; // 1 = email, 2 = code, 3 = new password
  forgotForm: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.forgotForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        code: ['', [Validators.required]],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  // Step 1 - send reset code
  onSendCode() {
    if (this.forgotForm.get('email')?.valid) {
      this.http.post(`${environment.baseUrl}/api/reset-password`, {
        email: this.forgotForm.value.email
      }).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Reset code sent!',
            text: 'Please check your email.',
            confirmButtonColor: '#508D4E'
          });
          this.step = 2;
        },
        error: (err) => {
          let message = 'An error occurred';
          if (err.status === 404) {
            message = 'No Email Matched';
          } else if (err.status === 500) {
            message = 'Server error. Please try again later';
          }
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message,
            confirmButtonColor: '#be1010'
          });
        }
      });
    }
  }

  // Step 2 - verify code and go to password reset
  onVerifyCode() {
    if (this.forgotForm.get('code')?.valid) {
      this.http.post(`${environment.baseUrl}/api/verify-reset-code`, {
        email: this.forgotForm.value.email,
        code: this.forgotForm.value.code
      }).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Code verified!',
            text: 'You can now reset your password',
            confirmButtonColor: '#508D4E'
          });
          this.step = 3;
        },
        error: (err) => {
          let message = 'An error occurred';
          if (err.status === 400) {
            message = 'Invalid Code';
          } else if (err.status === 404) {
            message = 'User not found';
          } else if (err.status === 500) {
            message = 'Server error. Please try again later';
          }
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message,
            confirmButtonColor: '#be1010'
          });
        }
      });
    }
  }

  // Step 3 - confirm password reset
  onResetPassword() {
    if (this.forgotForm.valid) {
      this.http.post(`${environment.baseUrl}/api/confirm-reset-password`, {
        email: this.forgotForm.value.email,
        code: this.forgotForm.value.code,
        newPassword: this.forgotForm.value.newPassword
      }).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Password reset successfully!',
            text: 'You will now be redirected to the login page',
            confirmButtonColor: '#508D4E'
          }).then(() => {
            this.router.navigate(['/login']);
          });
          this.step = 1;
          this.forgotForm.reset();
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: err.error?.message || err.message,
            confirmButtonColor: '#be1010'
          });
        }
      });
    }
  }
}
