import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';  
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  imports: [ReactiveFormsModule, CommonModule, RouterModule] 
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.forgotForm = this.fb.group({
      identifier: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotForm.valid) {
      console.log('Form Submitted!', this.forgotForm.value);
    }
  }
}
