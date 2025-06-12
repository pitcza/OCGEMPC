import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-success-options-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, CommonModule],
  template: `
    <div class="modal-container">
      <div class="modal-head">
        <h1>Success</h1>
        <button class="exit-button" mat-dialog-close>&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="success-content">
          <svg class="success-icon" viewBox="0 0 24 24">
            <path fill="var(--primary)" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <h2>Maker Created Successfully!</h2>
          <p>The new maker has been added to the system.</p>
        </div>
        
        <div class="form-footer">
          <button class="cancel-btn" mat-dialog-close>
            Close
          </button>
          <button class="green-btn" [mat-dialog-close]="'proceed'">
            Proceed to Loan Application
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-container {
      display: flex;
      flex-direction: column;
      background: #fff;
      width: 500px;
      max-height: 85%;
      border-radius: 12px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.3);
      overflow: hidden;
      animation: fadeIn 0.3s ease-in-out;
    }

    .modal-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 30px;
      background-color: #fff;
      border-bottom: 1px solid #eee;
      z-index: 1;
    }

    .modal-head h1 {
      color: #222;
      font-size: 24px;
      font-weight: 600;
      text-transform: uppercase;
      margin: 0;
    }

    .exit-button {
      background: none;
      border: none;
      font-size: 32px;
      font-weight: bold;
      color: #666;
      cursor: pointer;
      transition: color 0.2s ease-in-out;
      line-height: 1;
      padding: 0;
      margin: 0;
    }

    .exit-button:hover {
      color: var(--primary-hover);
    }

    .modal-body {
      padding: 30px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .success-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 30px;
    }

    .success-icon {
      width: 60px;
      height: 60px;
      margin-bottom: 20px;
    }

    .success-content h2 {
      font-size: 20px;
      font-weight: 500;
      color: #222;
      margin: 0 0 10px 0;
    }

    .success-content p {
      color: #666;
      margin: 0;
      font-size: 14px;
    }

    .form-footer {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      width: 100%;
    }

    .cancel-btn {
      width: auto;
      height: 40px;
      border: none;
      outline: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
      border-radius: 4px;
      border: 1px solid #ddd;
      font-size: 14px;
      font-weight: 400;
      padding: 0 20px;
      color: #222;
      transition: all 0.2s ease-in-out;
      cursor: pointer;
      background: #f5f5f5;
    }

    .cancel-btn:hover {
      background: #e0e0e0;
    }

    .green-btn {
      background-color: var(--primary);
      width: auto;
      height: 40px;
      border: none;
      outline: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 400;
      padding: 0 20px;
      color: white;
      transition: all 0.2s ease-in-out;
      cursor: pointer;
    }

    .green-btn:hover {
      background-color: var(--primary-hover);
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class SuccessOptionsDialog {
  constructor(
    public dialogRef: MatDialogRef<SuccessOptionsDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}