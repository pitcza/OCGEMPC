import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = 'http://localhost:3000/api';
  // private baseUrl = 'https://ocgempc-api-k4aq.onrender.com/api';

  constructor(private http: HttpClient) { }

  getData(): Observable<{ message: string }> {
    return this.http.get<{ message: string }>(`${this.baseUrl}/data`);
  }

}