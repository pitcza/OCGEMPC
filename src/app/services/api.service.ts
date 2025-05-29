import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = 'https://ocgempcapi-production.up.railway.app/api'; 

  constructor(private http: HttpClient) { }

  getData(): Observable<{ message: string }> {
    return this.http.get<{ message: string }>(`${this.baseUrl}/data`);
  }

}
