import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';  
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

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

  constructor(private fb: FormBuilder, private http: HttpClient) {
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
          alert('Reset code sent! Please check your email.');
          this.step = 2;
        },
        error: (err) => alert('Error: ' + (err.error?.message || err.message))
      });
    }
  }

  // Step 2 - verify code and go to password reset
  onVerifyCode() {
    if (this.forgotForm.get('code')?.valid) {
      this.step = 3;
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
          alert('Password reset successfully! You can now log in.');
          this.step = 1;
          this.forgotForm.reset();
        },
        error: (err) => alert('Error: ' + (err.error?.message || err.message))
      });
    }
  }
}
