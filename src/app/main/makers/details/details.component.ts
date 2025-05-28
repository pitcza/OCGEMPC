import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-details',
  standalone: false,
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss'
})
export class DetailsComponent implements OnInit{
  makerDetails: any = null;
  loading = true;
  error: string | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<DetailsComponent>,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    if (this.data && this.data.id) {
      this.fetchMakerDetails(this.data.id);
    } else {
      this.error = 'No Maker ID provided.';
      this.loading = false;
    }
  }

  fetchMakerDetails(id: string | number): void {
    this.loading = true;
    this.http.get<any>(`http://localhost:3000/api/maker/${id}`).subscribe({
      next: (details) => {
        this.makerDetails = details;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to fetch details.';
        this.loading = false;
      }
    });
  }

  closeModal(): void {
    this.dialogRef.close();
  }
}
