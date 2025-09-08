import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = `http://${window.location.hostname}:3300/api`;
  // private baseUrl = 'http://localhost:4000/api';
  
  constructor(private http: HttpClient) { }

  getData(): Observable<{ message: string }> {
    return this.http.get<{ message: string }>(`${this.baseUrl}/data`);
  }
}