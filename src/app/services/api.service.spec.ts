import { Component, OnInit } from '@angular/core';
import { ApiService } from './api.service';

@Component({
  selector: 'app-main',
  template: `
    <div>
      <h1>{{ message }}</h1>
    </div>
  `,
})
export class MainComponent implements OnInit {

  message: string = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getData().subscribe({
      next: (data) => {
        this.message = data.message;
      },
      error: (error) => {
        console.error('Error fetching data:', error);
      }
    });
  }
}
